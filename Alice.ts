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
    sendADD(add: ADD): IAlice_S2;
    sendBYE(bye: BYE): IAlice_Done;
}

interface IAlice_S2 extends IAlice {
    readonly state: "S2";
    add: ADD;
    receive(): Promise<IAlice_S1>;
}

interface IAlice_Done extends IAlice {
    readonly state: "Done";
    bye: BYE;
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
    sendADD(add: ADD): IAlice_S2 {
        super.checkOneTransitionPossible();
        sendMessage(roles.alice, roles.bob, add);
        return new Alice_S2(add);
    }
    sendBYE(bye: BYE): IAlice_Done {
        super.checkOneTransitionPossible();
        sendMessage(roles.alice, roles.bob, bye);
        return new Alice_Done(bye);
    }
}

class Alice_S2 extends Alice implements IAlice_S2 {
    public readonly state = "S2";
    constructor(public add: ADD) {
        super();
    }
    async receive(): Promise<IAlice_S1> {
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

class Alice_Done extends Alice implements IAlice_Done {
    public readonly state = "Done";
    constructor(public bye: BYE) {
        super();
        receiveMessageServer.terminate();
    }
}

export { IAlice, IAlice_S1, IAlice_S2, IAlice_Done };

export async function executeProtocol(f: (S1: IAlice_S1) => Promise<IAlice_Done>, host: string, port: number) {
    console.log(`Alice started ${new Date()}`);
    await initialize(roles.alice, port, host);
    let done = await f(new Alice_S1());
    return new Promise<IAlice_Done>(resolve => resolve(done));
}
