import {IAlice_S1,IAlice_Done,executeProtocol} from './Alice';
import {ADD,BYE} from './Message';

async function protocol(s1:IAlice_S1):Promise<IAlice_Done> {
   for(let i=0;i<8;i++) {
      let add = new ADD(Math.floor(Math.random() * 8),Math.floor(Math.random() * 8));
      let s2 = s1.sendADD(add);
      s1 = await s2.receive();
      if (s1.res) console.log(`RES heeft waarde van ${s1.res.sum}`);
   }
   let bye=new BYE();
   let done=s1.sendBYE(bye);
   return new Promise( resolve => resolve( done ) );
}

async function start(){
   await executeProtocol(protocol,'localhost',30001);
}

start();