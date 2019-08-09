import { receiveMessageServer, waitForMessage } from "./receiveMessageServer";
import { ADD, BYE, RES, Message, NOMESSAGE } from "./Message";
import { sendMessage } from "./sendMessage";
import { roles, initialize, connectedRoles, OneTransitionPossibleException } from "./globalObjects";

enum messages {
    ADD = "ADD",
    BYE = "BYE",
    RES = "RES",
    NOMESSAGE = "NOMESSAGE"
}

interface IBob {
    messageFrom: roles;
    messageType: messages;
    message: Message;
}

interface IBob_S1 extends IBob {
    recv(): Promise<IBob_S2 | IBob_S3>;
}

interface IBob_S2 extends IBob {
    sendRES(res: RES): Promise<IBob_S1>;
}

interface IBob_S3 extends IBob {
}

abstract class Bob {
    public messageFrom = roles.bob;
    public messageType = messages.NOMESSAGE;
    public message = new NOMESSAGE();
    constructor(protected transitionPossible: boolean = true) { }
    ;
    protected checkOneTransitionPossible() {
        if (!this.transitionPossible)
            throw new OneTransitionPossibleException("Only one transition possible from a state");
        this.transitionPossible = false;
    }
}

class Bob_S1 extends Bob implements IBob_S1 {
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
                    resolve(new Bob_S2(msg.from, messages.ADD, msg));
                    break;
                }
                case BYE.name + roles.alice: {
                    resolve(new Bob_S3(msg.from, messages.BYE, msg));
                    break;
                }
            }
        });
    }
}

class Bob_S2 extends Bob implements IBob_S2 {
    constructor(messageFrom: roles, messageType: messages, message: Message) {
        super();
        super.messageFrom = messageFrom;
        super.messageType = messageType;
        super.message = message;
    }
    async sendRES(res: RES): Promise<IBob_S1> {
        super.checkOneTransitionPossible();
        await sendMessage(roles.bob, roles.alice, res);
        return new Promise(resolve => resolve(new Bob_S1));
    }
}

class Bob_S3 extends Bob implements IBob_S3 {
    constructor(messageFrom: roles, messageType: messages, message: Message) {
        super();
        super.messageFrom = messageFrom;
        super.messageType = messageType;
        super.message = message;
        receiveMessageServer.terminate();
    }
}

type Bob_Start = IBob_S1;
type Bob_End = IBob_S3;

async function executeProtocol(f: (Bob_Start: Bob_Start) => Promise<Bob_End>, host: string, port: number) {
    console.log(`Bob started ${new Date()}`);
    await initialize(roles.bob, port, host);
    let done = await f(new Bob_S1());
    return new Promise<Bob_End>(resolve => resolve(done));
}

export { IBob, IBob_S1, IBob_S2, IBob_S3, messages, Bob_Start, Bob_End, executeProtocol, roles };

