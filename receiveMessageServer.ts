import * as http from 'http';
import {Message} from './Message';
import WaitQueue from 'wait-queue';

const wq = new WaitQueue();

function httpRestServer(req:http.IncomingMessage,res:http.ServerResponse):void {
   const httpHeaders = {'cache-control':'no-cache','Content-Type':'application/json','charset':'utf-8'};
   if ( req.method === 'POST' ) {
      let postData:string;
      req.on('data', (data) => { postData = (postData===undefined)?data: postData+data; });
      req.on('end',  () => { try { //console.log(`bericht ontvangen  ${postData}`);
                                   //messageResolver(<Message>(JSON.parse(postData)));
                                   wq.push(<Message>(JSON.parse(postData)));
                                   res.writeHead(200, "OK", httpHeaders);
                                   res.end();
                             }
                             catch (err) {
                                   res.writeHead(400, "wrong message", httpHeaders);
                             } } );
      return;
   }
   res.writeHead(404, "page not found", httpHeaders);
}

var httpServer:http.Server = http.createServer(httpRestServer);

function start(port:number){
    httpServer.listen(port);
}

function terminate(){
        setTimeout(
           () => { httpServer.close();
                   console.log('server is afgebroken, het protocol wordt nu geeindigd');
                 }, 5000 );
}

const receiveMessageServer = {
    start: start
,   terminate:terminate
}

//var messageResolver: (msg: Message) => void;
//export async function waitForMessage():Promise<Message>{
//    return new Promise(
//            (resolve) => {
//                messageResolver = resolve;
//    });
//}

export async function waitForMessage():Promise<Message>{
    const item = await wq.shift();
    const msg = <Message>item;
    return new Promise( (resolve) => resolve(msg) );
}

export {receiveMessageServer};
