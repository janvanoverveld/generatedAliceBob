import {Alice_Start,Alice_End,executeProtocol} from './Alice';
import {RES,ADD,BYE} from './Message';

async function protocol(s1:Alice_Start):Promise<Alice_End> {
   for(let i=0;i<8;i++) {
      const add = new ADD(Math.floor(Math.random() * 8),Math.floor(Math.random() * 8));
      const s2 = await s1.sendADD(add);
      s1 = await s2.recv();
      console.log(`${s1.messageFrom} stuurde ${s1.messageType} met waarde van ${(<RES>s1.message).sum}`);
   }
   const bye=new BYE();
   const done=s1.sendBYE(bye);
   return new Promise( resolve => resolve( done ) );
}

async function start(){
   await executeProtocol(protocol,'localhost',30001);
}

start();