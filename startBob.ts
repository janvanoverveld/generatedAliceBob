import {Bob_Start,Bob_End,executeProtocol, IBob_S2, messages} from './Bob';
import {ADD,RES} from './Message';
import { roles } from './globalObjects';

async function protocol(s1:Bob_Start):Promise<Bob_End> {
   let nextState = await s1.recv();
   while ( true ){
      switch (nextState.messageFrom+nextState.messageType) {
         case roles.alice+messages.ADD: {
            const add = <ADD>nextState.message;
            const res = new RES( add.value1 + add.value2 );
            console.log(`stuur ${res.name} ${res.sum} naar Alice `);
            const s2 = <IBob_S2>nextState;
            s1 = await s2.sendRES(res);
            nextState = await s1.recv();
            break;
         }
         case roles.alice+messages.BYE:{
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