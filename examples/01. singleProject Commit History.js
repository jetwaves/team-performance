"use strict";

/**
 * EXAMPLE DESCRIPTION:
 *      Get commit message of multi branches from one single git project.
 *
 * */

const moment = require('moment');
const gitperf = require('../jetwaves/gitperfLib');


let folderName = '/home/jetwaves/dev/__github/tp';           // CHANGE IT TO YOUR OWN GIT PROJECT'S FULL PATH

(async function (){
    // the array is saved in gitperfJSON
    let gitperfJSON = await gitperf.getGitLog(folderName,'dev',null,null,null);


    // === normal array view output. ===
    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    console.log('┏---- INFO: ----- start [gitperfJSON @ ] -----');console.dir(gitperfJSON);console.log('┗---- INFO: -----  end  [gitperfJSON @ ] -----');


    // === beautified table output. ===
    let history = gitperf.commitHistoryTableRedemption(gitperfJSON.parseResult);
    console.log(history);

    let authors = gitperf.authorsTableRedemption(gitperfJSON.authors);
    console.log(authors);

})();


/*
*
*
* return:

2018/03/19 18:15:21				/home/jetwaves/dev/__github/team-performance/examples/01. singleProject Commit History.js
┏---- INFO: ----- start [gitperfJSON @ ] -----
{ parseResult:
   [ [ project: undefined,
       branch: 'dev',
       date: '1521084409',
       dateStr: '2018-03-15T11:26:49+08:00',
       hash: '9e063863ba2d0ea8ddf6effb39995751c7408691',
       author: 'jetwaves@office <jetwaves@office>',
       msgArr: [],
       msg: '\n    make a loop to summarize all local branches\' commit logs\n',
       merge: null ],
     [ project: undefined,
       branch: 'dev',
       date: '1521024898',
       dateStr: '2018-03-14T18:54:58+08:00',
       hash: '386c582b2fd8b685569c8f35074f932888bb3ff5',
       author: 'jetwaves@office <jetwaves@office>',
       msgArr: [],
       msg: '\n    Now it can separate commit blocks and get correct infomations from the commit logs.\n',
       merge: null ],
     [ project: undefined,
       branch: 'dev',
       date: '1520852755',
       dateStr: '2018-03-12T19:05:55+08:00',
       hash: '86d30fce41a2811144816aaf4bc0db18dc9ba91c',
       author: 'jetwaves@office <jetwaves@office>',
       msgArr: [],
       msg: '\n    now it can export git log into a temp txt file without filter params.\n',
       merge: null ],
     [ project: undefined,
       branch: 'dev',
       date: '1518358840',
       dateStr: '2018-02-11T22:20:40+08:00',
       hash: '1cd5344d1e9c7c31043edf186edd0a54a3ea5a24',
       author: 'jetwaves <jetwaves@qq.com>',
       msgArr: [],
       msg: '\n    Initial commit\n',
       merge: null ] ],
  authors:
   [ 'jetwaves@office <jetwaves@office>',
     'jetwaves <jetwaves@qq.com>' ] }
┗---- INFO: -----  end  [gitperfJSON @ ] -----
┌──────────┬──────────┬────────────────────┬─────────────────────────────────────────────┬────────────────────┬─────────────────────────────────────────────────────────────────────────────────────┬─────┐
│ Project… │ BranchN… │ dateSTR            │ CommitHash                                  │ author             │ msg                                                                                 │ me… │
├──────────┼──────────┼────────────────────┼─────────────────────────────────────────────┼────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┼─────┤
│          │ dev      │ 2018-0315 11:26:49 │ 9e063863ba2d0ea8ddf6effb39995751c7408691    │ jetwaves@office <… │                                                                                     │     │
│          │          │                    │                                             │                    │     make a loop to summarize all local branches' commit logs                        │     │
│          │          │                    │                                             │                    │                                                                                     │     │
├──────────┼──────────┼────────────────────┼─────────────────────────────────────────────┼────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┼─────┤
│          │ dev      │ 2018-0314 18:54:58 │ 386c582b2fd8b685569c8f35074f932888bb3ff5    │ jetwaves@office <… │                                                                                     │     │
│          │          │                    │                                             │                    │     Now it can separate commit blocks and get correct infomations from the commit … │     │
│          │          │                    │                                             │                    │                                                                                     │     │
├──────────┼──────────┼────────────────────┼─────────────────────────────────────────────┼────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┼─────┤
│          │ dev      │ 2018-0312 19:05:55 │ 86d30fce41a2811144816aaf4bc0db18dc9ba91c    │ jetwaves@office <… │                                                                                     │     │
│          │          │                    │                                             │                    │     now it can export git log into a temp txt file without filter params.           │     │
│          │          │                    │                                             │                    │                                                                                     │     │
├──────────┼──────────┼────────────────────┼─────────────────────────────────────────────┼────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┼─────┤
│          │ dev      │ 2018-0211 22:20:40 │ 1cd5344d1e9c7c31043edf186edd0a54a3ea5a24    │ jetwaves <jetwave… │                                                                                     │     │
│          │          │                    │                                             │                    │     Initial commit                                                                  │     │
│          │          │                    │                                             │                    │                                                                                     │     │
└──────────┴──────────┴────────────────────┴─────────────────────────────────────────────┴────────────────────┴─────────────────────────────────────────────────────────────────────────────────────┴─────┘
┌──────────────────────────────────────────────────┐
│ AuthorName                                       │
├──────────────────────────────────────────────────┤
│ jetwaves@office <jetwaves@office>                │
├──────────────────────────────────────────────────┤
│ jetwaves <jetwaves@qq.com>                       │
└──────────────────────────────────────────────────┘





*
* */


