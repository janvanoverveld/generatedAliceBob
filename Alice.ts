import { receiveMessageServer } from "./receiveMessageServer";
import { ADD, BYE, RES, Message } from "./Message";
import { sendMessage } from "./sendMessage";
import { roles, initialize, connectedRoles, OneTransitionPossibleException } from "./globalObjects";
import { messageDB } from "./messageDB";

enum messages {
    ADD = "ADD",
    BYE = "BYE",
    RES = "RES"
}

interface IAlice {
}

interface IAlice_S1 extends IAlice {
    readonly messageFrom: roles.bob;
    readonly messageType: messages.RES;
    message?: RES;
    send_ADD_to_Bob(add: ADD): Promise<IAlice_S2>;
    send_BYE_to_Bob(bye: BYE): Promise<IAlice_S3>;
}

interface IAlice_S2 extends IAlice {
    recv(): Promise<IAlice_S1>;
}

interface IAlice_S3 extends IAlice {
}

abstract class Alice implements IAlice {
    constructor(protected transitionPossible: boolean = true) { }
    ;
    protected checkOneTransitionPossible() {
        if (!this.transitionPossible)
            throw new OneTransitionPossibleException("Only one transition possible from a state");
        this.transitionPossible = false;
    }
}

class Alice_S1 extends Alice implements IAlice_S1 {
    readonly messageFrom = roles.bob;
    readonly messageType = messages.RES;
    constructor(public message?: RES) {
        super();
    }
    async send_ADD_to_Bob(add: ADD): Promise<IAlice_S2> {
        super.checkOneTransitionPossible();
        await sendMessage(roles.alice, roles.bob, add);
        return new Promise(resolve => resolve(new Alice_S2));
    }
    async send_BYE_to_Bob(bye: BYE): Promise<IAlice_S3> {
        super.checkOneTransitionPossible();
        await sendMessage(roles.alice, roles.bob, bye);
        return new Promise(resolve => resolve(new Alice_S3));
    }
}

class Alice_S2 extends Alice implements IAlice_S2 {
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
        const msgPredicate: (message: Message) => boolean = m => (m.name === RES.name && m.from === roles.bob);
        const msg = await messageDB.remove(msgPredicate);
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
    constructor() {
        super();
        receiveMessageServer.terminate();
    }
}

type Alice_Start = IAlice_S1;
type Alice_End = IAlice_S3;

async function executeProtocol(f: (Alice_Start: Alice_Start) => Promise<Alice_End>, host: string, port: number) {
    console.log(`Alice started ${new Date()}`);
    await initialize(roles.alice, port, host);
    let done = await f(new Alice_S1());
    return new Promise<Alice_End>(resolve => resolve(done));
}

export { IAlice, IAlice_S2, messages, Alice_Start, Alice_End, executeProtocol, roles };

