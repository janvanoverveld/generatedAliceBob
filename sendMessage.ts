import * as request from 'request';
import {Message} from './Message';
import {connectedRoles,roles} from './globalObjects';

export async function sendMessage (roleFrom:roles,roleName:roles,msg:Message):Promise<void> {
    //console.log(`send ${msg.name} Message to ${roleName}`);
    const host = connectedRoles.getInfo(roleName).host;
    const port = connectedRoles.getInfo(roleName).port;
    //console.log(`host ${host}   port ${port}`);
    msg.from = roleFrom;    
    const options = { url: `http://${host}:${port}`,
                      headers: {'cache-control':'no-cache','Content-Type':'application/json','charset':'utf-8'},
                      body: msg,
                      json: true };
    return new Promise(
        (resolve,reject) => {
                request.post( options,
                    (err) => {
                        if (err) {
                            console.log(`error sendMessage ${roleName} : ${err}`);
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    }
                )
        }
    );
}
