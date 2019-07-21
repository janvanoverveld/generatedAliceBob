import { receiveMessageServer, waitForMessage } from "./receiveMessageServer";
import { ADD, BYE, RES } from "./Message";
import { sendMessage } from "./sendMessage";
import { roles, initialize, connectedRoles, OneTransitionPossibleException } from "./globalObjects";

interface IBob {
    state: string;
}

interface IBob_S1 extends IBob {
    readonly state: "S1";
    res?: RES;
    receive(): Promise<IBob_S2 | IBob_Done>;
}

interface IBob_S2 extends IBob {
    readonly state: "S2";
    add: ADD;
    sendRES(res: RES): IBob_S1;
}

interface IBob_Done extends IBob {
    readonly state: "Done";
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
    constructor(public res?: RES) {
        super();
    }
    async receive(): Promise<IBob_S2 | IBob_Done> {
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
                    resolve(new Bob_Done((<BYE>msg)));
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
    sendRES(res: RES): IBob_S1 {
        super.checkOneTransitionPossible();
        sendMessage(roles.bob, roles.alice, res);
        return new Bob_S1(res);
    }
}

class Bob_Done extends Bob implements IBob_Done {
    public readonly state = "Done";
    constructor(public bye: BYE) {
        super();
        receiveMessageServer.terminate();
    }
}

export { IBob, IBob_S1, IBob_S2, IBob_Done };

export async function executeProtocol(f: (S1: IBob_S1) => Promise<IBob_Done>, host: string, port: number) {
    console.log(`Bob started ${new Date()}`);
    await initialize(roles.bob, port, host);
    let done = await f(new Bob_S1());
    return new Promise<IBob_Done>(resolve => resolve(done));
}
