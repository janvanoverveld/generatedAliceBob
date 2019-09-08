import {ROLEMESSAGE,Message} from './Message';
import {receiveMessageServer} from './receiveMessageServer';
import {sendMessage} from './sendMessage';
import {messageDB} from './messageDB';

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

function del(role:roles){
    connectedRolesMap.delete(role);
}

const connectedRoles = {
    missing: missing
,   getInfo:getInfo
,   save: save
,   delete: del
,   showConnectedRoles: showConnectedRoles
}

connectedRolesMap.set(roles.mediator, {port:30000, host:'localhost'});

export {connectedRoles};

async function sleep(ms:number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// generic start function
export async function initialize(roleName:roles, port:number, host:string){
   receiveMessageServer.start(port);
   connectedRoles.save(roleName,host,port);
   await sendMessage( roleName, roles.mediator, new ROLEMESSAGE(roleName) );
   while ( true ) {
       const msg = await messageDB.remove((m)=>m.name===ROLEMESSAGE.name);
       if ( msg.name === ROLEMESSAGE.name) {
           connectedRoles.save(msg);
       };
       const missingRoles = Object.values(roles).filter( (role) => connectedRoles.missing(role) );
       if ( missingRoles.length === 0){
           break;
       }
   }
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