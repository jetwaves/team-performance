/**
 * Created by jetwaves on 2018/03/12.
 */
"use strict";
var fs = require('fs');
var async = require('async');
var moment = require('moment');
var Promise = require('promise');

const readline = require('readline');
const process = require('process');
const os= require('os');

var exec = require('child_process').exec;


var tool = {
    getGitLog   : getGitLog,
    parseGitLog :   parseGitLog
};


function getGitLog(folderName, branchName, author, since, until ){


    var command = 'cd ~/dev/posapi && git log > a2.txt';
    var cmd2 =    'cd ~/dev/posapi && git log';

    var ls = exec(command, function (error, stdout, stderr) {
        if (error !== null) {
            return false;
        }

        console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
        stdout = stdout.split(os.EOL);
        console.log('┏---- INFO: ----- start [stdout @ ] -----');console.dir(stdout);console.log('┗---- INFO: -----  end  [stdout @ ] -----');


    });


}



function parseGitLog(logContent){
    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    console.log('┏---- INFO: ----- start [logContent @ ] -----');console.dir(logContent);console.log('┗---- INFO: -----  end  [logContent @ ] -----');

}




































module.exports = tool;
