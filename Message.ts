import {connectedRoles,roles} from './globalObjects';

export abstract class Message {
    public from:roles=roles.mediator;
    constructor(public name:string){};
}

export class NOMESSAGE extends Message {
    constructor(){
        super(NOMESSAGE.name);
    }
}

export class ROLEMESSAGE extends Message {
    public host:string;
    public port:number;
    constructor(public roleName:roles){
        super(ROLEMESSAGE.name);
        this.host = connectedRoles.getInfo(roleName).host;
        this.port = connectedRoles.getInfo(roleName).port;
    }
}

export class READY extends Message {
    constructor(){
        super(READY.name);
    }
}

export class ADD extends Message {
    constructor(public value1: number, public value2: number) {
        super(ADD.name);
    }
}
export class RES extends Message {
    constructor(public sum: number) {
        super(RES.name);
    }
}
export class BYE extends Message {
    constructor() {
        super(BYE.name);
    }
}
