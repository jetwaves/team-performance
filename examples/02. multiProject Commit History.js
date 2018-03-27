"use strict";

/**
 * EXAMPLE DESCRIPTION:
 *      Get commit message of multi branches from one single git project.
 *
 * */

const moment = require('moment');
const os= require('os');

var gitperf = require('../jetwaves/gitperfLib');

(async function (){
    let folders = [
        '/home/jetwaves/dev/__github/laravel-util',         // CHANGE IT TO YOUR OWN GIT PROJECT'S FULL PATH
        '/home/jetwaves/dev/__github/tp'
    ];
    let gitperfJSON = await gitperf.getMultiProjectCommitSummary(folders,null,null,null,null);
    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    console.log('┏---- INFO: ----- start [gitperfJSON @ ] -----');console.dir(gitperfJSON);console.log('┗---- INFO: -----  end  [gitperfJSON @ ] -----');



})();


/*
*
*
*
*
return :

            2018/03/19 16:56:32				/home/jetwaves/dev/__github/team-performance/jetwaves/gitperf.js
            ┏---- INFO: ----- start [folderNameArr @ ] -----
            [ '/home/jetwaves/dev/__github/laravel-util',
              '/home/jetwaves/dev/__github/tp' ]
            ┗---- INFO: -----  end  [folderNameArr @ ] -----

            2018/03/19 16:56:32				/home/jetwaves/dev/__github/team-performance/jetwaves/gitperf.js
            	INFO:	 Analysing Project :   /home/jetwaves/dev/__github/tp

            2018/03/19 16:56:32				/home/jetwaves/dev/__github/team-performance/jetwaves/gitperf.js
            ┏---- INFO: ----- start [branchData.branchList @ ] -----
            [ 'dev', 'master' ]
            ┗---- INFO: -----  end  [branchData @ ] -----

            2018/03/19 16:56:34-083				/home/jetwaves/dev/__github/team-performance/jetwaves/gitperf.js

            2018/03/19 16:56:35-593				/home/jetwaves/dev/__github/team-performance/jetwaves/gitperf.js

            2018/03/19 16:56:35				/home/jetwaves/dev/__github/team-performance/jetwaves/gitperf.js
            	INFO:	 Analysing Project :   /home/jetwaves/dev/__github/laravel-util

            2018/03/19 16:56:35				/home/jetwaves/dev/__github/team-performance/jetwaves/gitperf.js
            ┏---- INFO: ----- start [branchData.branchList @ ] -----
            [ 'master' ]
            ┗---- INFO: -----  end  [branchData @ ] -----

            2018/03/19 16:56:37-105				/home/jetwaves/dev/__github/team-performance/jetwaves/gitperf.js

            2018/03/19 16:56:37				/home/jetwaves/dev/__github/team-performance/examples/02. multiProject Commit History.js
            ┏---- INFO: ----- start [gitperfJSON @ ] -----
            { commitHistory:
               [ [ project: 'team-performance.git',
                   branch: 'master',
                   date: null,
                   dateStr: 'Sun Feb 11 22:20:40 2018 +0800',
                   hash: '1cd5344d1e9c7c31043edf186edd0a54a3ea5a24',
                   author: 'jetwaves <jetwaves@qq.com>',
                   msgArr: [],
                   msg: '\n    Initial commit\n',
                   merge: null ],
                 [ project: 'team-performance.git',
                   branch: 'dev',
                   date: null,
                   dateStr: 'Thu Mar 15 11:26:49 2018 +0800',
                   hash: '9e063863ba2d0ea8ddf6effb39995751c7408691',
                   author: 'jetwaves@office <jetwaves@office>',
                   msgArr: [],
                   msg: '\n    make a loop to summarize all local branches\' commit logs\n',
                   merge: null ],
                 [ project: 'team-performance.git',
                   branch: 'dev',
                   date: null,
                   dateStr: 'Wed Mar 14 18:54:58 2018 +0800',
                   hash: '386c582b2fd8b685569c8f35074f932888bb3ff5',
                   author: 'jetwaves@office <jetwaves@office>',
                   msgArr: [],
                   msg: '\n    Now it can separate commit blocks and get correct infomations from the commit logs.\n',
                   merge: null ],
                 [ project: 'team-performance.git',
                   branch: 'dev',
                   date: null,
                   dateStr: 'Mon Mar 12 19:05:55 2018 +0800',
                   hash: '86d30fce41a2811144816aaf4bc0db18dc9ba91c',
                   author: 'jetwaves@office <jetwaves@office>',
                   msgArr: [],
                   msg: '\n    now it can export git log into a temp txt file without filter params.\n',
                   merge: null ],
                 [ project: 'team-performance.git',
                   branch: 'dev',
                   date: null,
                   dateStr: 'Sun Feb 11 22:20:40 2018 +0800',
                   hash: '1cd5344d1e9c7c31043edf186edd0a54a3ea5a24',
                   author: 'jetwaves <jetwaves@qq.com>',
                   msgArr: [],
                   msg: '\n    Initial commit\n',
                   merge: null ],
                 [ project: 'laravel-util.git',
                   branch: 'master',
                   date: null,
                   dateStr: 'Fri Feb 2 14:54:22 2018 +0800',
                   hash: '1e8ebd3e266e6b18539d1c8e208fc9c94680397a',
                   author: 'jetwaves@office <jetwaves@office>',
                   msgArr: [],
                   msg: '\n    initial commit\n',
                   merge: null ],
                 [ project: 'laravel-util.git',
                   branch: 'master',
                   date: null,
                   dateStr: 'Fri Feb 2 12:02:11 2018 +0800',
                   hash: '19a319711b2ee80cfd9b4a2ad0993a75891aa67a',
                   author: 'jetwaves <jetwaves@qq.com>',
                   msgArr: [],
                   msg: '\n    Initial commit\n',
                   merge: null ] ],
              authors:
               [ 'jetwaves <jetwaves@qq.com>',
                 'jetwaves@office <jetwaves@office>' ] }
            ┗---- INFO: -----  end  [gitperfJSON @ ] -----

*
*
* */






