"use strict";

/**
 * EXAMPLE DESCRIPTION:
 *      Get commit message of multi branches from one single git project.
 *
 * */

const moment = require('moment');
const os= require('os');

var gitperf = require('../jetwaves/gitperf');
let folderName = '/home/jetwaves/dev/__github/tp';           // CHANGE IT TO YOUR OWN GIT PROJECT'S FULL PATH

(async function (){

    let projectInfo = await gitperf.getProjectInfo(folderName);
    let branchInfo = await gitperf.getBranchInfo(folderName);

    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    console.log('┏---- INFO: ----- start [projectInfo @ ] -----');console.dir(projectInfo);console.log('┗---- INFO: -----  end  [projectInfo @ ] -----');


    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    console.log('┏---- INFO: ----- start [branchInfo @ ] -----');console.dir(branchInfo);console.log('┗---- INFO: -----  end  [branchInfo @ ] -----');


})();

/*
*
* return :

        2018/03/19 16:55:48				/home/jetwaves/dev/__github/team-performance/examples/03. project and branch information.js
        ┏---- INFO: ----- start [projectInfo @ ] -----
        { projectName: 'team-performance.git' }
        ┗---- INFO: -----  end  [projectInfo @ ] -----

        2018/03/19 16:55:48				/home/jetwaves/dev/__github/team-performance/examples/03. project and branch information.js
        ┏---- INFO: ----- start [branchInfo @ ] -----
        { currentBranch: 'dev', branchList: [ 'dev', 'master' ] }
        ┗---- INFO: -----  end  [branchInfo @ ] -----
*
*
* */







