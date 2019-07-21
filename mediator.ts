import {receiveMessageServer,waitForMessage} from './receiveMessageServer';
import {ROLEMESSAGE, READY} from './Message';
import {sendMessage} from './sendMessage';
import {roles, connectedRoles} from './globalObjects';

async function initProtocolByMediator(){
    while ( true ) {
        let msg = await waitForMessage();
        if ( msg.name = ROLEMESSAGE.name) {
            connectedRoles.save(msg);
        }

        let allRoles = Object.values(roles);
        let missingRoles = allRoles.filter( (role) => connectedRoles.missing(role) );
        missingRoles.forEach(  (role) => console.log(`${role} nog niet aanwezig`) );

        if ( missingRoles.length > 0){
            continue;
        }

        let relevantRoles = allRoles.filter( (role) => role !== roles.mediator );

        for ( let i=0; i<relevantRoles.length; i++ ) {
            for ( let j=0; j<allRoles.length; j++ ) {
                await sendMessage( roles.mediator, relevantRoles[i], new ROLEMESSAGE(allRoles[j]) );
            }
        }
        for ( let i=0; i<relevantRoles.length; i++ ) {
            await sendMessage( roles.mediator, relevantRoles[i], new READY() );
        }

        receiveMessageServer.terminate();
        console.log('protocol is gestart');
        break;
    }
}

receiveMessageServer.start(connectedRoles.getInfo(roles.mediator).port);
initProtocolByMediator();
console.log(`De mediator is gestart  ${new Date()}`);