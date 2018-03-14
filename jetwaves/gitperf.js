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
    getGitLog   : getGitLog,
    parseGitLog :   parseGitLog
};


function echoGitLog(folderName, branchName, author, since, until ){
    folderName = '/home/jetwaves/dev/posapi';
    var tempFileName = 'gitLogTemp-' + moment().format('YMMDDHHmmssSSS') + '.txt';
    var command = 'cd ' + folderName + ' && git log > ' + tempFileName;

    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\tcommand  = '+command );

    var ls = exec(command, function (error, stdout, stderr) {
        if (error !== null) {
            return false;
        }

        setTimeout(function(){
            console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss-SSS\t\t\t\t')+__filename);
            var fileContent = fs.readFileSync(path.normalize(folderName + '//' + tempFileName));
            // console.log('┏---- INFO: ----- start [fileContent @ ] -----');console.dir(fileContent);console.log('┗---- INFO: -----  end  [fileContent @ ] -----');
            fileContent = fileContent.toString().split(os.EOL);
            // console.log('┏---- INFO: ----- start [fileContent @ ] -----');console.dir(fileContent);console.log('┗---- INFO: -----  end  [fileContent @ ] -----');

        },  1000);
    });
}


function getGitLog(folderName, branchName, author, since, until ){
    return new Promise(
function(resolve, reject){
    folderName = '/home/jetwaves/dev/posapi';
    // folderName = '/home/jetwaves/dev/__github/team-performance/jetwaves';

    // var tempFileName = 'gitlog.txt';
    var tempFileName = 'gitLogTemp-' + moment().format('YMMDDHHmmssSSS') + '.txt';
    var command = 'cd ' + folderName + ' && git log > ' + tempFileName;

    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\tcommand  = '+command );

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
            }
            ],
            function(err,result){
                console.log('   .()       error !!.   err = ');console.dir(err);
                console.log('       result = ');        console.dir(result);
                res.json(err);
            }
        );
});
}


function parseGitLog(logContent){

    var res = new Array();
    var block = makeNewNullBlock();
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
                    block = makeNewNullBlock();
                    block.hash = arr[1];
                } else {
                    // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\t ========= START OF A COMMIT BLOCK 01 ======  ');
                    block = makeNewNullBlock();
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
                block.date = dateArr[1];
                break;
            case 'Merge:':
                var mergeArr = line.split(': ');
                block.merge = mergeArr[1];
                break;
            default:
                block.msgArr.push(line);
        }
    }
    // last block: end of the commit log
    block.msg = block.msgArr.join(os.EOL);
    block.msgArr = new Array();
    res.push(block);
    authors = _.uniq(authors);
    return [res, authors];
}

function makeNewNullBlock(){
    var block = new Array();
    block.hash   = null;
    block.author = null;
    block.merge  = null;
    block.date   = null;
    block.msgArr = new Array();
    block.msg    = null;
    block.branch = null;
    return block;
}




function getCurrentBranch(){

}
































module.exports = tool;
