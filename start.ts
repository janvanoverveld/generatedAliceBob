import * as child from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const mediatorFileName = 'mediator.js';
const logDir = './log';

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

function writeLogFile(fileName:string,data:string){
    const logFileName=`${__dirname}/../log/${fileName.substr(0,fileName.indexOf('.'))}.log`;
    fs.writeFile( logFileName
    ,             data
    ,             (err) => { if(err) { console.log(`fs error bij ${fileName}`);
                                       console.log(`${err}`); }
                             else {
                                console.log(`logfile ${logFileName}  for ${fileName} was created`);
                                if (fileName!==mediatorFileName) process.stdout.write(data);  
                             }
                           } );
}

function executeNodeProcess(fileName:string){
    console.log(`start ${fileName}   ${new Date()} `);
    const parameters = [`${__dirname}/${fileName}`];
    child.execFile( 'node'
    , parameters
    , (err,data) => { if (err){
                         console.log(`error bij ${fileName}`);
                         console.log(`${err}`);
                         writeLogFile(fileName,err.message);
                      }
                         else writeLogFile(fileName,data);
                    } );
    console.log(`eind executeNodeProcess ${fileName}`);
};

executeNodeProcess(mediatorFileName);

const startupLocalProtocolFiles = fs.readdirSync(__dirname).filter((f)=>f.includes('start'));
for ( const startFile of startupLocalProtocolFiles ){
    if ( startFile !== 'start.js' ) global.setTimeout( () => executeNodeProcess( startFile ), 500 );
}
