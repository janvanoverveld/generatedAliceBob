import {IBob_S1,IBob_S2,IBob_S3,executeProtocol} from './Bob';
import {RES} from './Message';

async function protocol(s1:IBob_S1):Promise<IBob_S3> {
   let nextState = await s1.recv();
   while ( true ){
      switch (nextState.state) {
         case "S2": {
            const add = nextState.add;
            const res = new RES( add.value1 + add.value2 );
            console.log(`stuur ${res.name} ${res.sum} naar Alice `);
            const s2 = <IBob_S2>nextState;
            s1 = await s2.sendRES(res);
            nextState = await s1.recv();
            break;
         }
         case "S3": {
            return new Promise(
               resolve => resolve(<IBob_S3>nextState)
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