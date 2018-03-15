"use strict";

const moment = require('moment');
const os= require('os');


var gitperf = require('./gitperf');

// gitperf.getGitLog();

// gitperf.getBranchInfo('aaa');

let folderName = '/home/jetwaves/dev/posapi';
// folderName = '/home/jetwaves/dev/__github/tp/jetwaves';

// gitperf.getProjectCommitSummary(folderName);



/*


(async function() {

    let pname = await gitperf.getProjectInfo(folderName);

    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    console.log('┏---- INFO: ----- start [pname @ ] -----');console.dir(pname);console.log('┗---- INFO: -----  end  [pname @ ] -----');
})();

*/



/*

gitperf.getProjectInfo(folderName).then(function(pname){
    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    console.log('┏---- INFO: ----- start [pname @ ] -----');console.dir(pname);console.log('┗---- INFO: -----  end  [pname @ ] -----');
});

*/



(async function (){
    let folders = ['/home/jetwaves/dev/__github/laravel-util', '/home/jetwaves/dev/__github/tp'];
    let val = await gitperf.getMultiProjectCommitSummary(folders,null,null,null,null);
    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    console.log('┏---- INFO: ----- start [val @ ] -----');console.dir(val);console.log('┗---- INFO: -----  end  [val @ ] -----');

})();





