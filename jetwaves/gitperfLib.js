/**
 * Created by jetwaves on 2018/03/12.
 */
"use strict";
const fs = require('fs');
const path = require('path');
const async = require('async');
const moment = require('moment');
const _ = require('lodash');

const os= require('os');

const exec = require('child_process').exec;

const Table = require('cli-table-redemption');



var tool = {
    getGitLog                       : getGitLog,
    parseGitLog                     : parseGitLog,
    getBranchInfo                   : getBranchInfo,
    getProjectCommitSummary         : getProjectCommitSummary,
    getProjectInfo                  : getProjectInfo,
    getMultiProjectCommitSummary    : getMultiProjectCommitSummary,
    commitHistoryTableRedemption    : commitHistoryTableRedemption,
    authorsTableRedemption          : authorsTableRedemption
};




function getGitLog(folderName, branchName, author, since, until, projectName ){
    return new Promise(
function(resolve, reject){
    let command, tempFileName;
    [command, tempFileName]= makeGitLogCommandWithParams(folderName, branchName, author, since, until );
    if(!branchName) branchName = null;

    async.waterfall(
            [function(callback){            // Execute the git command to redirect git log to a temp file.
                let ls = exec(command, function (error, stdout, stderr) {
                    if (error !== null) {
                        callback(error, null);
                    }
                    callback(null, stdout);
                });
            },
            function(res1, callback){
                // wait a while until the file is generated.
                setTimeout(function(){
                    callback(null, 'wait finish');
                },  500);
            },
            function(res2, callback){
                setTimeout(function(){
                    // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss-SSS\t\t\t\t')+__filename);
                    let fileContent = fs.readFileSync(path.normalize(folderName + '//' + tempFileName));
                    if(fileContent){
                        fileContent = fileContent.toString().split(os.EOL);
                    } else {
                        fileContent = [];
                    }
                    // console.log('┏---- INFO: ----- start [fileContent @ ] -----');console.dir(fileContent);console.log('┗---- INFO: -----  end  [fileContent @ ] -----');
                    callback(null, fileContent);
                },  500);
            },
            function(fileContent, callback){
                fs.unlink(path.normalize(folderName + '//' + tempFileName),function(unlinkRes){});          // delete the temp file.
                let parseResult, authors;
                [parseResult, authors]= parseGitLog(fileContent, branchName, projectName);
                // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                // console.log('┏---- INFO: ----- start [parseResult @ ] -----');console.dir(parseResult);console.log('┗---- INFO: -----  end  [parseResult @ ] -----');
                //
                // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                // console.log('┏---- INFO: ----- start [authors @ ] -----');console.dir(authors);console.log('┗---- INFO: -----  end  [authors @ ] -----');
                resolve({parseResult: parseResult, authors: authors});
            }
            ],
            function(err,result){
                console.log('   .()       error !!.   err = ');console.dir(err);
                console.log('       result = ');        console.dir(result);
                reject(err);
            }
        );
});
}


function makeGitLogCommandWithParams(folderName, branchName, author, since, until ){

    let tempFileName = 'gitLogTemp-' + moment().format('YMMDDHHmmssSSS') + '.txt';
    let command = 'cd ' + folderName ;      // change to the project folder

    if(branchName) {                        // check out the selected branch
        command = command + ' && git checkout ' + branchName ;
    }
    command = command + ' && git log  --date=iso-strict  ';     // use iso data format to be parsed by moment()

    if(author) {                            // limit to a selected author
        command = command + ' --author=' + author;
    }
    if(since) {                             // limit the time span
        command = command + ' --since=' + since;
    }
    if(until) {                             // limit the time span
        command = command + ' --until=' + until;
    }

    command = command + ' > ' + tempFileName;   // output the records to a temp file
    // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\tcommand  = '+command );
    return [command, tempFileName];
}


function parseGitLog(logContent, branchName, projectName ){
    if(logContent.length <=0 ) return;
    let res = [];
    let authors = [];
    let block = makeNewNullCommitBlock();
    for(let idx in logContent){
        let line = logContent[idx];
        let arr = undefined;
        if(!line || line.trim() === '' || line.trim() == null || line.length === 0) {
            continue;
        }
        arr = line.split(' ');

        let substr = line.substr(0, 6);
        switch(substr){
            case 'commit':
                if(block.hash != null){
                    // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\t ========= END OF A COMMIT BLOCK ======  ');
                    block.msg = block.msgArr.join(os.EOL);
                    block.msgArr = new Array();
                    res.push(block);
                    // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\t ========= START OF A COMMIT BLOCK 02 ======  ');
                    block = makeNewNullCommitBlock();
                    block.hash = arr[1];
                    block.branch = branchName;
                    block.project = projectName;
                } else {
                    // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\t ========= START OF A COMMIT BLOCK 01 ======  ');
                    block = makeNewNullCommitBlock();
                    block.hash = arr[1];
                    block.branch = branchName;
                    block.project = projectName;
                }
                break;
            case 'Author':
                let authorArr = line.split(': ');
                block.author = authorArr[1];
                authors.push(authorArr[1]);
                break;
            case 'Date: ':
                let dateArr = line.split(':   ');
                block.dateStr = dateArr[1];
                block.date = moment(dateArr[1]).format('X');
                break;
            case 'Merge:':
                let mergeArr = line.split(': ');
                block.merge = mergeArr[1];
                authors = _.uniq(authors);          // eliminate duplication of users at every merge commit.
                break;
            default:
                block.msgArr.push(line);
        }
    }
    block.msg = block.msgArr.join(os.EOL);      // last block: end of the commit log
    block.msgArr = new Array();
    res.push(block);
    authors = _.uniq(authors);          // eliminate duplications
    return [res, authors];
}



function makeNewNullCommitBlock(){
    let block = [];
    block.project       = null;
    block.branch        = null;
    block.date          = null;
    block.dateStr       = null;
    block.hash          = null;
    block.author        = null;
    block.msgArr        = new Array();
    block.msg           = null;
    block.merge         = null;

    return block;
}



/**
 *  Get project branch information.
 *      return branch name list in array and current branch.
 *
 */
function getBranchInfo(folderName){
    return new Promise(
function(resolve, reject){

    let command = 'cd ' + folderName + ' && git branch ';
    let currentBranch = '';
    let branchList = [];

    exec(command, function (error, stdout, stderr) {
        if (error !== null) {
            reject(stderr);
        }
        stdout = stdout.split(os.EOL);
        for(let idx in stdout){
            let line = stdout[idx].trim();
            if(!line) continue;
            if(line.substr(0, 1).toString() == '*'){
                line = line.substr(2);
                currentBranch = line;
            }
            branchList.push(line);
        }

        resolve({currentBranch : currentBranch, branchList : branchList});
    });

});
}


/**
 *  Get project information.  ( projectName for now )    http://github.com/jetwaves/PROJECT_NAME.git
 *
 */
function getProjectInfo(folderName){
    return new Promise(
function(resolve, reject){

    let command = 'cd ' + folderName + ' && git remote -v ';
    let currentBranch = '';
    let branchList = [];

    exec(command, function (error, stdout, stderr) {
        if (error !== null) {
            reject(stderr);
        }
        let patt = /\/[a-zA-Z0-9-]{1,30}(?= \(fetch\))/;
        let regres = patt.exec(stdout);
        let projectName = regres.toString().substr(1);
        // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\tprojectName  = '+projectName );
        resolve({projectName : projectName});

    });
});
}




/**
 * Get a project's branches (local branches or branches in a supervised list ) commit summary
 *
 *   return {
 *               commitHistory:  historyArr,
 *               authors:        authors
 *          }
 *
 * */
function getProjectCommitSummary(folderName, branchName, author, since, until ){
   return new Promise(function(resolve, reject){
let historyArr  = [];
let authors     = [];

getProjectInfo(folderName).then(function(projectInfo){
    let projectName = projectInfo.projectName;
    getBranchInfo(folderName).then(function(branchData){
        console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
        console.log('┏---- INFO: ----- start [branchData.branchList @ ] -----');console.dir(branchData.branchList);console.log('┗---- INFO: -----  end  [branchData @ ] -----');
        async.whilst(
            function () {
                    return branchData.branchList.length > 0;
                },
            function (callback) {
                let oneBranch = branchData.branchList.pop();
                console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\t Summarizing branch :   ' + oneBranch);
                getGitLog(folderName, oneBranch, author, since, until, projectName ).then(function( commitData){
                    historyArr = _.concat(historyArr, commitData.parseResult);
                    authors = _.concat(authors, commitData.authors);
                    callback(null, 'ok');
                }).catch(function(getGitLogErr){
                    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                    console.log('┏---- INFO: ----- start [getGitLogErr @ ] -----');console.dir(getGitLogErr);console.log('┗---- INFO: -----  end  [getGitLogErr @ ] -----');
                    callback(getGitLogErr, null);
                })
            },
            function (err, n) {
                if(err){
                    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                    console.log('┏---- INFO: ----- start [whilst ERROR err @ ] -----');console.dir(err);console.log('┗---- INFO: -----  end  [err @ ] -----');
                    reject(err);
                }
                authors = _.uniq(authors);          // eliminate duplication of users at every merge commit.
                _.remove(historyArr, function(item){        // eliminate null items (due to cli param selection. )
                    return item.author == null;
                });
                // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                // console.log('┏---- INFO: ----- start [historyArr @ ] -----');console.dir(historyArr);console.log('┗---- INFO: -----  end  [historyArr @ ] -----');
                // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                // console.log('┏---- INFO: ----- start [authors @ ] -----');console.dir(authors);console.log('┗---- INFO: -----  end  [authors @ ] -----');
                let ret = {commitHistory: historyArr, authors: authors};
                // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                // console.log('┏---- INFO: ----- start [ret @ ] -----');console.dir(ret);console.log('┗---- INFO: -----  end  [ret @ ] -----');
                resolve(ret);
            }
        );

    }).catch(function(getBranchInfoErr){
        console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
        console.log('┏---- INFO: ----- start [getBranchInfoErr @ ] -----');console.dir(getBranchInfoErr);console.log('┗---- INFO: -----  end  [getBranchInfoErr @ ] -----');
        reject(getBranchInfoErr);
    });
}).catch(function(getProjectInfoErr){
    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    console.log('┏---- INFO: ----- start [getProjectInfoErr @ ] -----');console.dir(getProjectInfoErr);console.log('┗---- INFO: -----  end  [getProjectInfoErr @ ] -----');
    reject(getProjectInfoErr);
});
})}


/**
 * get multi Projects' Commit Summary.
 *
 * RETURN:
 *      data      JSON
 *          data.commitHistory          array of commitHistory
 *          data.authors                array of authors (commitors );
 *
 * commitHistory：
 *
 *  [
 *    project: 'laravel-util.git',
 *    branch: 'master',
 *    date: null,
 *    dateStr: 'Fri Feb 2 14:54:22 2018 +0800',
 *    hash: '1e8ebd3e266e6b18539d1c8e208fc9c94680397a',
 *    author: 'jetwaves@office <jetwaves@office>',
 *    msgArr: [],
 *    msg: '\n    initial commit\n',
 *    merge: null
 *  ],
 *
 * authors:
 * [
 *  'jetwaves <jetwaves@qq.com>',
 *  'jetwaves@office <jetwaves@office>'
 * ]
 *
 *
 * */
function getMultiProjectCommitSummary(folderNameArr, branchName, author, since, until ){
    return new Promise(
function(resolve, reject){
    let historyArr  = [];
    let authors     = [];
    // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    // console.log('┏---- INFO: ----- start [folderNameArr @ ] -----');console.dir(folderNameArr);console.log('┗---- INFO: -----  end  [folderNameArr @ ] -----');
    async.whilst(
        function () {   return folderNameArr.length > 0;    },
        function (callback) {
            let folderName = folderNameArr.pop();
            console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\t Analysing Project :   ' + folderName);
            getProjectCommitSummary(folderName, branchName, author, since, until).then(function( oneProjectCommitInfo ){
                historyArr = _.concat(historyArr, oneProjectCommitInfo.commitHistory);
                authors = _.concat(authors, oneProjectCommitInfo.authors);
                callback(null, 'ok');
            }).catch(function(getProjectCommitSummaryErr){
                console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                console.log('┏---- ERROR: ----- start [getProjectCommitSummaryErr @ ] -----');console.dir(getProjectCommitSummaryErr);console.log('┗---- ERROR: -----  end  [getProjectCommitSummaryErr @ ] -----');
                callback(getProjectCommitSummaryErr, null);
            })
        },
        function (getMultiProjectCommitSummaryWhilstErr, n) {
            if(getMultiProjectCommitSummaryWhilstErr){
                console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                console.log('┏---- ERROR: ----- start [getMultiProjectCommitSummaryWhilstErr @ ] -----');console.dir(getMultiProjectCommitSummaryWhilstErr);console.log('┗---- ERROR: -----  end  [getMultiProjectCommitSummaryWhilstErr @ ] -----');
                reject(getMultiProjectCommitSummaryWhilstErr);
            }
            authors = _.uniq(authors);                              // eliminate duplication of users at every merge commit.
            historyArr = filterByBranch(historyArr, branchName);    // filter branches by cli params
            historyArr = filterByAuthor(historyArr, author);        // filter author   by cli params
            resolve({commitHistory: historyArr, authors: authors});
        }
    );
});
}



/**
 * filter commit history by branch names
 * */
function filterByBranch(historyArr, branchName){
    if(!branchName){
        return historyArr;
    }
    historyArr = _.filter(historyArr, function(item){
        return _.lastIndexOf(branchName, item.branch ) >=0;
    });
    return historyArr;
}


/**
 * filter commit history by author names
 * */
function filterByAuthor(historyArr, author){
    if(!author){
        return historyArr;
    }
    if(author.length > 0){
        historyArr = _.filter(historyArr, function(item){
            var findAuthorRes = false;
            for(var authorIdx in author){
                if(item.author == null) return false;
                if(item.author.indexOf(author[authorIdx]) === 0){
                    findAuthorRes = true;
                    break;
                }
            }
            return findAuthorRes;
        });
    }
    return historyArr;
}




function filterByParams(historyArr, branchName, author){
    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    console.log('┏---- INFO: ----- start [historyArr @ ] -----');console.dir(historyArr);console.log('┗---- INFO: -----  end  [historyArr @ ] -----');
    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    console.log('┏---- INFO: ----- start [branchName @ ] -----');console.dir(branchName);console.log('┗---- INFO: -----  end  [branchName @ ] -----');



    historyArr = _.filter(historyArr, function(item){
        console.log('           item  = ');  console.dir(item);
       var branchOK =
       console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
       console.log('┏---- INFO: ----- start [item @ ] -----');console.dir(item);console.log('┗---- INFO: -----  end  [item @ ] -----');
       console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
       console.log('┏---- INFO: ----- start [branchOK @ ] -----');console.dir(branchOK);console.log('┗---- INFO: -----  end  [branchOK @ ] -----');
       var authorOK = _.findIndex(author, item.author );
       if(branchOK >=0 || authorOK >=0 ){
           return true;
       } else {
           return false;
       }
    });
    return historyArr;
}

/**
 *  Beautify the return content format
 *
 ┌──────────┬──────────┬────────────────┬──────────────────────────────┬────────────────────────────────────────┬──────────────────────────────┬──────────────────────────────────────────────────┬──────────┐
 │ Project… │ BranchN… │ dateTS         │ dateSTR                      │ CommitHash                             │ author                       │ msg                                              │ merge    │
 ├──────────┼──────────┼────────────────┼──────────────────────────────┼────────────────────────────────────────┼──────────────────────────────┼──────────────────────────────────────────────────┼──────────┤
 │          │ dev      │                │ Thu Mar 15 11:26:49 2018 +0… │ 9e063863ba2d0ea8ddf6effb39995751c7408… │ jetwaves@office <jetwaves@o… │                                                  │          │
 │          │          │                │                              │                                        │                              │     make a loop to summarize all local branches… │          │
 │          │          │                │                              │                                        │                              │                                                  │          │
 ├──────────┼──────────┼────────────────┼──────────────────────────────┼────────────────────────────────────────┼──────────────────────────────┼──────────────────────────────────────────────────┼──────────┤
 │          │ dev      │                │ Wed Mar 14 18:54:58 2018 +0… │ 386c582b2fd8b685569c8f35074f932888bb3… │ jetwaves@office <jetwaves@o… │                                                  │          │
 │          │          │                │                              │                                        │                              │     Now it can separate commit blocks and get c… │          │
 │          │          │                │                              │                                        │                              │                                                  │          │
 ├──────────┼──────────┼────────────────┼──────────────────────────────┼────────────────────────────────────────┼──────────────────────────────┼──────────────────────────────────────────────────┼──────────┤
 │          │ dev      │                │ Mon Mar 12 19:05:55 2018 +0… │ 86d30fce41a2811144816aaf4bc0db18dc9ba… │ jetwaves@office <jetwaves@o… │                                                  │          │
 │          │          │                │                              │                                        │                              │     now it can export git log into a temp txt f… │          │
 │          │          │                │                              │                                        │                              │                                                  │          │
 ├──────────┼──────────┼────────────────┼──────────────────────────────┼────────────────────────────────────────┼──────────────────────────────┼──────────────────────────────────────────────────┼──────────┤
 │          │ dev      │                │ Sun Feb 11 22:20:40 2018 +0… │ 1cd5344d1e9c7c31043edf186edd0a54a3ea5… │ jetwaves <jetwaves@qq.com>   │                                                  │          │
 │          │          │                │                              │                                        │                              │     Initial commit                               │          │
 │          │          │                │                              │                                        │                              │                                                  │          │
 └──────────┴──────────┴────────────────┴──────────────────────────────┴────────────────────────────────────────┴──────────────────────────────┴──────────────────────────────────────────────────┴──────────┘

 *
 *
 * */
function commitHistoryTableRedemption(commitHistoryArray ){
    var table = new Table({
        head:       ['ProjectName', 'BranchName','dateSTR','CommitHash','author', 'msg','merge'],
        // colWidths:  [10,            10,            20,       42,          20,      85,  12]
        colWidths:  [10,            20,            20,       25,          20,      85,  12]
    });

    for(var idx in commitHistoryArray){
        var item = commitHistoryArray[idx];
        table.push([
            item.project,
            item.branch,
            moment(item.dateStr).format('Y-MMDD HH:mm:ss'),
            item.hash,
            item.author,
            item.msg,
            item.merge
        ]);
    }
    return table.toString();
}


function authorsTableRedemption(authors ){
    var table = new Table({
        head:       ['AuthorName'],
        colWidths:  [50]
    });

    for(var idx in authors){
        var item = authors[idx];
        table.push([
            item
        ]);
    }
    return table.toString();
}



module.exports = tool;
