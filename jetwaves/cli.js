"use strict";

const moment = require('moment');
const os= require('os');


var gitperf = require('./gitperf');


let folderName = '/home/jetwaves/dev/__github/tp';



(async function (){
    let folders = [
                    '/home/jetwaves/dev/__github/laravel-util',
                    '/home/jetwaves/dev/__github/tp'
                  ];
    let gitperfJSON = await gitperf.getMultiProjectCommitSummary(folders,null,null,null,null);
    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    console.log('┏---- INFO: ----- start [gitperfJSON @ ] -----');console.dir(gitperfJSON);console.log('┗---- INFO: -----  end  [gitperfJSON @ ] -----');



})();





