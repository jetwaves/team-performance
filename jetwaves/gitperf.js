/**
 * Created by jetwaves on 2018/03/12.
 */
"use strict";
const fs = require('fs');
const path = require('path');
const async = require('async');
const moment = require('moment');
// var Promise = require('promise');
const _ = require('lodash');

const readline = require('readline');
const process = require('process');
const os= require('os');

const exec = require('child_process').exec;


var tool = {
    getGitLog                       : getGitLog,
    parseGitLog                     : parseGitLog,
    getBranchInfo                   : getBranchInfo,
    getProjectCommitSummary         : getProjectCommitSummary,
    getProjectInfo                  : getProjectInfo,
    getMultiProjectCommitSummary    : getMultiProjectCommitSummary,
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
                // wait until the file is generated.
                setTimeout(function(){
                    callback(null, 'wait finish');
                },  500);
            },
            function(res2, callback){
                setTimeout(function(){
                    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss-SSS\t\t\t\t')+__filename);
                    let fileContent = fs.readFileSync(path.normalize(folderName + '//' + tempFileName));
                    fileContent = fileContent.toString().split(os.EOL);
                    // console.log('┏---- INFO: ----- start [fileContent @ ] -----');console.dir(fileContent);console.log('┗---- INFO: -----  end  [fileContent @ ] -----');
                    callback(null, fileContent);
                },  1000);
            },
            function(fileContent, callback){
                let parseResult, authors;
                [parseResult, authors]= parseGitLog(fileContent, branchName, projectName);
                console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                console.log('┏---- INFO: ----- start [parseResult @ ] -----');console.dir(parseResult);console.log('┗---- INFO: -----  end  [parseResult @ ] -----');

                console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                console.log('┏---- INFO: ----- start [authors @ ] -----');console.dir(authors);console.log('┗---- INFO: -----  end  [authors @ ] -----');
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
    // folderName = '/home/jetwaves/dev/posapi';
    // folderName = '/home/jetwaves/dev/__github/team-performance/jetwaves';

    let tempFileName = 'gitLogTemp-' + moment().format('YMMDDHHmmssSSS') + '.txt';
    let command = 'cd ' + folderName ;      // 去项目目录

    if(branchName) {                        // 切换到指定分支
        command = command + ' && git checkout ' + branchName ;
    }

    command = command + ' && git log ';

    if(author) {                            // 指定作者
        command = command + ' --author=' + author;
    }
    if(since) {                             // 限定起始时间
        command = command + ' --since=' + since;
    }
    if(until) {                             // 限定结束时间
        command = command + ' --until=' + until;
    }

    command = command + ' > ' + tempFileName;   // 输出记录到临时文件

    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\tcommand  = '+command );

    return [command, tempFileName];
}


function parseGitLog(logContent, branchName, projectName ){
    let res = [];
    let authors = [];
    let block = makeNewNullCommitBlock();

    for(let idx in logContent){
        let line = logContent[idx];
        let arr = undefined;
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
                // block.date = moment(dateArr[1]);
                block.dateStr = dateArr[1];
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




function getBranchInfo(folderName){
    return new Promise(
function(resolve, reject){
    // folderName = '/home/jetwaves/dev/posapi';
    // folderName = '/home/jetwaves/dev/__github/team-performance/jetwaves';

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
        let patt = /\/[a-zA-Z0-9-]{1,30}.git(?= \(fetch\))/;
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
            function () {   return branchData.branchList.length > 0;    },
            function (callback) {
                let oneBranch = branchData.branchList.pop();
                // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\t Summarizing branch :   ' + oneBranch);
                getGitLog(folderName, oneBranch, author, since, until, projectName ).then(function( commitData){
                    historyArr = _.concat(historyArr, commitData.parseResult);
                    authors = _.concat(authors, commitData.authors);
                    // historyArr.push(commitData.parseResult);
                    // authors.push(commitData.authors);
                    callback(null, 'ok');
                })
            },
            function (err, n) {
                if(err){
                    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                    console.log('┏---- INFO: ----- start [whilst ERROR err @ ] -----');console.dir(err);console.log('┗---- INFO: -----  end  [err @ ] -----');
                }
                // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\twhilst ERROR  ');
                authors = _.uniq(authors);          // eliminate duplication of users at every merge commit.
                // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                // console.log('┏---- INFO: ----- start [historyArr @ ] -----');console.dir(historyArr);console.log('┗---- INFO: -----  end  [historyArr @ ] -----');
                // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                // console.log('┏---- INFO: ----- start [authors @ ] -----');console.dir(authors);console.log('┗---- INFO: -----  end  [authors @ ] -----');
                let ret = {commitHistory: historyArr, authors: authors};
                console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                console.log('┏---- INFO: ----- start [ret @ ] -----');console.dir(ret);console.log('┗---- INFO: -----  end  [ret @ ] -----');
                resolve(ret);
            }
        );
        // resolve ('xxxxxxxx');

    });
});

})}


function getMultiProjectCommitSummary(folderNameArr, branchName, author, since, until ){
    return new Promise(
function(resolve, reject){
    let historyArr  = [];
    let authors     = [];
    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    console.log('┏---- INFO: ----- start [folderNameArr @ ] -----');console.dir(folderNameArr);console.log('┗---- INFO: -----  end  [folderNameArr @ ] -----');
    async.whilst(
        function () {   return folderNameArr.length > 0;    },
        function (callback) {
            let folderName = folderNameArr.pop();
            console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\t Analysing Project :   ' + folderName);

            getProjectCommitSummary(folderName, branchName, author, since, until).then(function( oneProjectCommitInfo ){
                historyArr = _.concat(historyArr, oneProjectCommitInfo.commitHistory);
                authors = _.concat(authors, oneProjectCommitInfo.authors);
                // historyArr.push(oneProjectCommitInfo.commitHistory);
                // authors.push(oneProjectCommitInfo.authors);
                callback(null, 'ok');
            })
            // let oneProjectCommitInfo = getProjectCommitSummary(folderName, branchName, author, since, until);
            // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
            // console.log('┏---- INFO: ----- start [oneProjectCommitInfo @ ] -----');console.dir(oneProjectCommitInfo);console.log('┗---- INFO: -----  end  [oneProjectCommitInfo @ ] -----');
            // historyArr.push(oneProjectCommitInfo.commitHistory);
            // authors.push(oneProjectCommitInfo.authors);
        },
        function (err, n) {
            if(err){
                console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
                console.log('┏---- INFO: ----- start [whilst ERROR err @ ] -----');console.dir(err);console.log('┗---- INFO: -----  end  [err @ ] -----');
            }
            // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\twhilst ERROR  ');
            authors = _.uniq(authors);          // eliminate duplication of users at every merge commit.
            // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
            // console.log('┏---- INFO: ----- start [historyArr @ ] -----');console.dir(historyArr);console.log('┗---- INFO: -----  end  [historyArr @ ] -----');
            // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
            // console.log('┏---- INFO: ----- start [authors @ ] -----');console.dir(authors);console.log('┗---- INFO: -----  end  [authors @ ] -----');
            resolve({commitHistory: historyArr, authors: authors});
        }
    );


});
}



module.exports = tool;
