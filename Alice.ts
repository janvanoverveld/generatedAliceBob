import { receiveMessageServer, waitForMessage } from "./receiveMessageServer";
import { ADD, BYE, RES } from "./Message";
import { sendMessage } from "./sendMessage";
import { roles, initialize, connectedRoles, OneTransitionPossibleException } from "./globalObjects";

interface IAlice {
    state: string;
}

interface IAlice_S1 extends IAlice {
    readonly state: "S1";
    res?: RES;
    sendADD(add: ADD): Promise<IAlice_S2>;
    sendBYE(bye: BYE): Promise<IAlice_S3>;
}

interface IAlice_S2 extends IAlice {
    readonly state: "S2";
    recv(): Promise<IAlice_S1>;
}

interface IAlice_S3 extends IAlice {
    readonly state: "S3";
}

abstract class Alice {
    constructor(protected transitionPossible: boolean = true) { }
    ;
    protected checkOneTransitionPossible() {
        if (!this.transitionPossible)
            throw new OneTransitionPossibleException("Only one transition possible from a state");
        this.transitionPossible = false;
    }
}

class Alice_S1 extends Alice implements IAlice_S1 {
    public readonly state = "S1";
    constructor(public res?: RES) {
        super();
    }
    async sendADD(add: ADD): Promise<IAlice_S2> {
        super.checkOneTransitionPossible();
        await sendMessage(roles.alice, roles.bob, add);
        return new Promise(resolve => resolve(new Alice_S2));
    }
    async sendBYE(bye: BYE): Promise<IAlice_S3> {
        super.checkOneTransitionPossible();
        await sendMessage(roles.alice, roles.bob, bye);
        return new Promise(resolve => resolve(new Alice_S3));
    }
}

class Alice_S2 extends Alice implements IAlice_S2 {
    public readonly state = "S2";
    constructor() {
        super();
    }
    async recv(): Promise<IAlice_S1> {
        try {
            super.checkOneTransitionPossible();
        }
        catch (exc) {
            return new Promise((resolve, reject) => reject(exc));
        }
        let msg = await waitForMessage();
        return new Promise(resolve => {
            switch (msg.name + msg.from) {
                case RES.name + roles.bob: {
                    resolve(new Alice_S1((<RES>msg)));
                    break;
                }
            }
        });
    }
}

class Alice_S3 extends Alice implements IAlice_S3 {
    public readonly state = "S3";
    constructor() {
        super();
        receiveMessageServer.terminate();
    }
}

export { IAlice, IAlice_S1, IAlice_S2, IAlice_S3 };

export async function executeProtocol(f: (IAlice_S1: IAlice_S1) => Promise<IAlice_S3>, host: string, port: number) {
    console.log(`Alice started ${new Date()}`);
    await initialize(roles.alice, port, host);
    let done = await f(new Alice_S1());
    return new Promise<IAlice_S3>(resolve => resolve(done));
}
