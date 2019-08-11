import {Bob_Start,Bob_End,executeProtocol, messages} from './Bob';
import {RES} from './Message';

async function protocol(s1:Bob_Start):Promise<Bob_End> {
   let nextState = await s1.recv();
   while ( true ){
      console.log(`message ${nextState.messageType} received from ${nextState.messageFrom}`);
      switch (nextState.messageType) {
         case messages.ADD: {
            const res = new RES( nextState.message.value1 + nextState.message.value2 );
            console.log(`send ${res.name} with ${res.sum}`);
            s1 = await nextState.sendRES(res);
            nextState = await s1.recv();
            break;
         }
         case messages.BYE:{
            return new Promise(
               resolve => resolve(<Bob_End>nextState)
            );
         }
      }
   }
}

async function start(){
   await executeProtocol(protocol,'localhost',30002);
}

start();