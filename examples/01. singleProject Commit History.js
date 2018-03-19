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
    let gitperfJSON = await gitperf.getGitLog(folderName,'dev',null,null,null);
    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    console.log('┏---- INFO: ----- start [gitperfJSON @ ] -----');console.dir(gitperfJSON);console.log('┗---- INFO: -----  end  [gitperfJSON @ ] -----');

})();



/*
*
*
* return:

        2018/03/19 16:59:19				/home/jetwaves/dev/__github/team-performance/examples/01. singleProject Commit History.js
        ┏---- INFO: ----- start [gitperfJSON @ ] -----
        { parseResult:
           [ [ project: undefined,
               branch: 'dev',
               date: null,
               dateStr: 'Thu Mar 15 11:26:49 2018 +0800',
               hash: '9e063863ba2d0ea8ddf6effb39995751c7408691',
               author: 'jetwaves@office <jetwaves@office>',
               msgArr: [],
               msg: '\n    make a loop to summarize all local branches\' commit logs\n',
               merge: null ],
             [ project: undefined,
               branch: 'dev',
               date: null,
               dateStr: 'Wed Mar 14 18:54:58 2018 +0800',
               hash: '386c582b2fd8b685569c8f35074f932888bb3ff5',
               author: 'jetwaves@office <jetwaves@office>',
               msgArr: [],
               msg: '\n    Now it can separate commit blocks and get correct infomations from the commit logs.\n',
               merge: null ],
             [ project: undefined,
               branch: 'dev',
               date: null,
               dateStr: 'Mon Mar 12 19:05:55 2018 +0800',
               hash: '86d30fce41a2811144816aaf4bc0db18dc9ba91c',
               author: 'jetwaves@office <jetwaves@office>',
               msgArr: [],
               msg: '\n    now it can export git log into a temp txt file without filter params.\n',
               merge: null ],
             [ project: undefined,
               branch: 'dev',
               date: null,
               dateStr: 'Sun Feb 11 22:20:40 2018 +0800',
               hash: '1cd5344d1e9c7c31043edf186edd0a54a3ea5a24',
               author: 'jetwaves <jetwaves@qq.com>',
               msgArr: [],
               msg: '\n    Initial commit\n',
               merge: null ] ],
          authors:
           [ 'jetwaves@office <jetwaves@office>',
             'jetwaves <jetwaves@qq.com>' ] }
        ┗---- INFO: -----  end  [gitperfJSON @ ] -----

*
* */


