import {IBob_S1,IBob_S2,IBob_Done,executeProtocol} from './Bob';
import {RES} from './Message';

async function protocol(s1:IBob_S1):Promise<IBob_Done> {
   let nextState = await s1.receive();
   while ( true ){
      switch (nextState.state) {
         case "S2": {
            let add = nextState.add;
            let res = new RES( add.value1 + add.value2 );
            console.log(`stuur ${res.name} ${res.sum} naar Alice `);
            s1 = (<IBob_S2>nextState).sendRES(res);
            nextState = await s1.receive();
            break;
         }
         case "Done": {
            return new Promise(
               resolve => resolve(<IBob_Done>nextState)
            );
         }
         default: {
            const _exhaustiveCheck:never = nextState;
         }
      }
   }
}

async function start(){
   await executeProtocol(protocol,'localhost',30002);
}

start();