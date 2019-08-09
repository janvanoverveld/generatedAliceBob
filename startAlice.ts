import {Alice_Start,Alice_End,executeProtocol, messages} from './Alice';
import {RES,ADD,BYE} from './Message';

async function protocol(s1:Alice_Start):Promise<Alice_End> {
   for(let i=0;i<8;i++) {
      let add = new ADD(Math.floor(Math.random() * 8),Math.floor(Math.random() * 8));
      let s2 = await s1.sendADD(add);
      s1 = await s2.recv();
      if (s1.message&&s1.messageType&&s1.messageType===messages.RES) console.log(`RES heeft waarde van ${(<RES>s1.message).sum}`);
   }
   let bye=new BYE();
   let done=s1.sendBYE(bye);
   return new Promise( resolve => resolve( done ) );
}

async function start(){
   await executeProtocol(protocol,'localhost',30001);
}

start();