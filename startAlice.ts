import {Alice_Start,Alice_End,executeProtocol} from './Alice';
import {ADD,BYE} from './Message';

const value: ()=>number = ()=>Math.floor(Math.random() * 5);

async function protocol(s1:Alice_Start):Promise<Alice_End> {
   for(let i=0;i<5;i++) {
      const add = new ADD(value(),value());
      const s2 = await s1.send_ADD_to_Bob(add);
      s1 = await s2.recv();
      if (s1.message)
        console.log(`Send an ${add.name} to ${s1.messageFrom} with values ${add.value1} and ${add.value2}, received a ${s1.messageType} with ${s1.message.sum}`);
   }
   const done=s1.send_BYE_to_Bob(new BYE());
   return new Promise( resolve => resolve( done ) );
}

async function start(){
   await executeProtocol(protocol,'localhost',30001);
}

start();