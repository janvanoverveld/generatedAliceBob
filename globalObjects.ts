import {ROLEMESSAGE,Message,READY} from './Message';
import {receiveMessageServer,waitForMessage} from './receiveMessageServer';
import {sendMessage} from './sendMessage';

//
//
// verschillende mogelijke rollen
enum roles {
    mediator='Mediator'
}

export {roles}

//
// connected roles
//
type connectedRoleInfo = {
    host: string;
    port: number;
}

const connectedRolesMap:Map<roles,connectedRoleInfo> = new Map();

function showConnectedRoles(){
    connectedRolesMap.forEach(
        (val,key)=>{
           console.log(`${key}   ${val.host}   ${val.port}`);
        }
    );
}

function getInfo(roleName:roles):connectedRoleInfo{
    let roleInfo=connectedRolesMap.get(roleName);
    if (roleInfo) {
        return roleInfo;
    }
    throw new SyntaxError(`${roleName} does not exist`)
}

function missing(nm:roles):boolean{
    return !connectedRolesMap.has(nm);
}

function save(msgOrRoleName:Message|roles,host?:string,port?:number):void{
    switch(typeof msgOrRoleName){
        case 'string':
            if(host&&port) {
                connectedRolesMap.set(msgOrRoleName, {port:port, host:host});
            }
            break;
        case 'object':
            let roleMsg:ROLEMESSAGE=<ROLEMESSAGE>msgOrRoleName;
            connectedRolesMap.set(roleMsg.roleName, {port:roleMsg.port, host:roleMsg.host});
            break;
    }
}

function noMoreRelevantRoles():boolean {
    return connectedRolesMap.size < 3;
}

function del(role:roles){
    connectedRolesMap.delete(role);
}

const connectedRoles = {
    missing: missing
,   getInfo:getInfo
,   save: save
,   delete: del
,   noMoreRelevantRoles: noMoreRelevantRoles
,   showConnectedRoles: showConnectedRoles
}

connectedRolesMap.set(roles.mediator, {port:30000, host:'localhost'});

export {connectedRoles};

async function sleep(ms:number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

//
// generieke start functie
export async function initialize(roleName:roles, port:number, host:string){
   receiveMessageServer.start(port);
   connectedRoles.save(roleName,host,port);
   await sendMessage( roleName, roles.mediator, new ROLEMESSAGE(roleName) );
   while ( true ) {
       let msg = await waitForMessage();
       if ( msg.name === ROLEMESSAGE.name) {
           connectedRoles.save(msg);
       };
       if ( msg.name === READY.name) {
           break;
       }
   }
   await sleep(1000);
}

//
// custom exception for a runtime check
export class OneTransitionPossibleException extends Error {
    constructor(public message: string) {
        super(message);
        this.name = 'Exception';
        this.message = message;
        this.stack = (<any>new Error()).stack;
    }
    toString() {
        return this.name + ': ' + this.message;
    }
}

enum roles {
    bob = "Bob",
    alice = "Alice"
}