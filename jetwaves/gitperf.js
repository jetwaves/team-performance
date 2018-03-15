/**
 * Created by jetwaves on 2018/03/12.
 */
"use strict";
var fs = require('fs');
var path = require('path');
var async = require('async');
var moment = require('moment');
var Promise = require('promise');
var _ = require('lodash');

const readline = require('readline');
const process = require('process');
const os= require('os');

var exec = require('child_process').exec;


var tool = {
    getGitLog               : getGitLog,
    parseGitLog             : parseGitLog,
    getBranchInfo           : getBranchInfo,
    getCommitSummary        : getCommitSummary
};




function getGitLog(folderName, branchName, author, since, until ){
    return new Promise(
function(resolve, reject){
    var command, tempFileName;
    [command, tempFileName]= makeGitLogCommandWithParams(folderName, branchName, author, since, until );

    async.waterfall(
            [function(callback){            // Execute the git command to redirect git log to a temp file.
                var ls = exec(command, function (error, stdout, stderr) {
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
                    var fileContent = fs.readFileSync(path.normalize(folderName + '//' + tempFileName));
                    fileContent = fileContent.toString().split(os.EOL);
                    // console.log('┏---- INFO: ----- start [fileContent @ ] -----');console.dir(fileContent);console.log('┗---- INFO: -----  end  [fileContent @ ] -----');
                    callback(null, fileContent);
                },  1000);
            },
            function(fileContent, callback){
                var parseResult, authors;
                [parseResult, authors]= parseGitLog(fileContent);
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

    var tempFileName = 'gitLogTemp-' + moment().format('YMMDDHHmmssSSS') + '.txt';
    var command = 'cd ' + folderName ;      // 去项目目录

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


function parseGitLog(logContent){
    var res = new Array();
    var block = makeNewNullCommitBlock();
    var authors = new Array();

    for(var idx in logContent){
        var line = logContent[idx];
        var arr = undefined;
        arr = line.split(' ');

        var substr = line.substr(0, 6);
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
                } else {
                    // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\t ========= START OF A COMMIT BLOCK 01 ======  ');
                    block = makeNewNullCommitBlock();
                    block.hash = arr[1];
                }
                break;
            case 'Author':
                var authorArr = line.split(': ');
                block.author = authorArr[1];
                authors.push(authorArr[1]);
                break;
            case 'Date: ':
                var dateArr = line.split(':   ');
                block.date = moment(dateArr[1]);
                block.dateStr = dateArr[1];
                break;
            case 'Merge:':
                var mergeArr = line.split(': ');
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
    var block = new Array();
    block.hash   = null;
    block.author = null;
    block.merge  = null;
    block.date   = null;
    block.dateStr= null;
    block.msgArr = new Array();
    block.msg    = null;
    block.branch = null;
    return block;
}




function getBranchInfo(folderName){
    return new Promise(
function(resolve, reject){
    // folderName = '/home/jetwaves/dev/posapi';
    // folderName = '/home/jetwaves/dev/__github/team-performance/jetwaves';


    var command = 'cd ' + folderName + ' && git branch ';
    var currentBranch = '';
    var branchList = new Array();

    exec(command, function (error, stdout, stderr) {
        if (error !== null) {
            reject(stderr);
        }
        stdout = stdout.split(os.EOL);
        for(var idx in stdout){
            var line = stdout[idx].trim();
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



// get a projects branches (local branches or branches in a supervised list ) commit summary
function getCommitSummary(folderName, branchName, author, since, until ){
    // folderName = '/home/jetwaves/dev/posapi';
    folderName = '/home/jetwaves/dev/__github/team-performance/jetwaves';

    var historyArr = new Array()
    var authors = new Array();
    getBranchInfo(folderName).then(function(branchData){
        console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
        console.log('┏---- INFO: ----- start [branchData.branchList @ ] -----');console.dir(branchData.branchList);console.log('┗---- INFO: -----  end  [branchData @ ] -----');
        async.whilst(
            function () { return branchData.branchList.length > 0; },
            function (callback) {
                var oneBranch = branchData.branchList.pop();
                console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\t Summarizing branch :   ' + oneBranch);
                getGitLog(folderName, oneBranch, author, since, until ).then(function( commitData){
                    historyArr.push(commitData.parseResult);
                    authors.push(commitData.authors);
                })
            },
            function (err, n) {
                // 5 seconds have passed, n = 5
                console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\twhilst ERROR  ');
            }
        );
        authors = _.uniq(authors);          // eliminate duplication of users at every merge commit.

        return({commitHistory: historyArr, authors: authors});
    });
}




module.exports = tool;
