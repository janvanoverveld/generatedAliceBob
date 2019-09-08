import {receiveMessageServer} from './receiveMessageServer';
import {ROLEMESSAGE} from './Message';
import {sendMessage} from './sendMessage';
import {roles, connectedRoles} from './globalObjects';
import {messageDB} from './messageDB';

async function initProtocolByMediator(){
    while ( true ) {
        const msg = await messageDB.remove((m)=>m.name===ROLEMESSAGE.name);
        if ( msg.name = ROLEMESSAGE.name) {
            connectedRoles.save(msg);
        }

        const allRoles = Object.values(roles);
        const missingRoles = allRoles.filter( (role) => connectedRoles.missing(role) );
        missingRoles.forEach(  (role) => console.log(`${role} nog niet aanwezig`) );

        if ( missingRoles.length > 0){
            continue;
        }

        const relevantRoles = allRoles.filter( (role) => role !== roles.mediator );

        for ( let i=0; i<relevantRoles.length; i++ ) {
            for ( let j=0; j<relevantRoles.length; j++ ) {
                if (i!=j) sendMessage( roles.mediator, relevantRoles[i], new ROLEMESSAGE(relevantRoles[j]) );
            }
        }

        receiveMessageServer.terminate();
        console.log('protocol is gestart');
        break;
    }
}

receiveMessageServer.start(connectedRoles.getInfo(roles.mediator).port);
initProtocolByMediator();
console.log(`De mediator is gestart  ${new Date()}`);