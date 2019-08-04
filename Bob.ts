import { receiveMessageServer, waitForMessage } from "./receiveMessageServer";
import { ADD, BYE, RES } from "./Message";
import { sendMessage } from "./sendMessage";
import { roles, initialize, connectedRoles, OneTransitionPossibleException } from "./globalObjects";

interface IBob {
    state: string;
}

interface IBob_S1 extends IBob {
    readonly state: "S1";
    recv(): Promise<IBob_S2 | IBob_S3>;
}

interface IBob_S2 extends IBob {
    readonly state: "S2";
    add: ADD;
    sendRES(res: RES): Promise<IBob_S1>;
}

interface IBob_S3 extends IBob {
    readonly state: "S3";
    bye: BYE;
}

abstract class Bob {
    constructor(protected transitionPossible: boolean = true) { }
    ;
    protected checkOneTransitionPossible() {
        if (!this.transitionPossible)
            throw new OneTransitionPossibleException("Only one transition possible from a state");
        this.transitionPossible = false;
    }
}

class Bob_S1 extends Bob implements IBob_S1 {
    public readonly state = "S1";
    constructor() {
        super();
    }
    async recv(): Promise<IBob_S2 | IBob_S3> {
        try {
            super.checkOneTransitionPossible();
        }
        catch (exc) {
            return new Promise((resolve, reject) => reject(exc));
        }
        let msg = await waitForMessage();
        return new Promise(resolve => {
            switch (msg.name + msg.from) {
                case ADD.name + roles.alice: {
                    resolve(new Bob_S2((<ADD>msg)));
                    break;
                }
                case BYE.name + roles.alice: {
                    resolve(new Bob_S3((<BYE>msg)));
                    break;
                }
            }
        });
    }
}

class Bob_S2 extends Bob implements IBob_S2 {
    public readonly state = "S2";
    constructor(public add: ADD) {
        super();
    }
    async sendRES(res: RES): Promise<IBob_S1> {
        super.checkOneTransitionPossible();
        await sendMessage(roles.bob, roles.alice, res);
        return new Promise(resolve => resolve(new Bob_S1));
    }
}

class Bob_S3 extends Bob implements IBob_S3 {
    public readonly state = "S3";
    constructor(public bye: BYE) {
        super();
        receiveMessageServer.terminate();
    }
}

export { IBob, IBob_S1, IBob_S2, IBob_S3 };

export async function executeProtocol(f: (IBob_S1: IBob_S1) => Promise<IBob_S3>, host: string, port: number) {
    console.log(`Bob started ${new Date()}`);
    await initialize(roles.bob, port, host);
    let done = await f(new Bob_S1());
    return new Promise<IBob_S3>(resolve => resolve(done));
}
