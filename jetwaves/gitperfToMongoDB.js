#! /usr/bin/node --harmony

"use strict";

const moment  = require('moment');
const os      = require('os');
const log     = console.log;
const _       = require('lodash');
const fs      = require('fs');
const chalk   = require('chalk');
const program   = require('commander');


const gitperfMongo = require('./gitperfMongo');
const pkg     = require('../package.json');


function filterList(val){
    return val.split(',');
}

function validDate(val){
    if(moment(val).isValid()){
        return val;
    } else {
        return false;
    }
}

function validFile(val){
    return fileExist(val);
}


program
    .version('0.0.1')
    .usage('gitperfToMongoDB [--config=] [--project=] [--branch=] [--author=] [--since=] [--until=] ')
    .description('    Summarize projects` team members` performance AND save to Mongodb,  by summarizing git commit log ')
    .option('-c, --config <items>', 'config file full name')
    .option('--project <items>','project path to summarize, separate by `,` ',filterList)
    .option('--since <YYYY-MM-DD>', 'start date of analyse', validDate)
    .option('--until <YYYY-MM-DD>', 'end date of analyse', validDate)
    .option('--config <items>', 'config file full name')
    .option('--branch <items>', 'branch names to summarize, separate by `,` ',filterList)
    .option('--author <items>', 'author names to summarize, separate by `,` ',filterList)
    .parse(process.argv);

let params = determinateParams(program);
console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
console.log('┏---- INFO: ----- start [params @ ] -----');console.dir(params);console.log('┗---- INFO: -----  end  [params @ ] -----');





let dbConfig = {
    host     : 'localhost',
    port     : '27017',
    user     : 'admin',
    password : '123456',
    db       : 'gitperf',
    collection: 'logs'

};


// (async function (){
//     // params.project = ['/home/jetwaves/dev/__github/tp','/home/jetwaves/dev/__github/route-to-controller'];
//     // params.project = ['/home/jetwaves/dev/__github/tp'];
//     // let info = await gitperf.getMultiProjectCommitSummary(params.project, params.branch, params.author, params.since, params.until);
//
//     // log(gitperf.commitHistoryTableRedemption(info.commitHistory));
//     // log(gitperf.authorsTableRedemption(info.authors));
//
//     let saveResult = await gitperfMongo.saveLogToMongodb(dbConfig, params.project, params.branch, params.author, params.since, params.until);
//
//     console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
//     console.log('┏---- INFO: ----- start [saveResult @ ] -----');console.dir(saveResult);console.log('┗---- INFO: -----  end  [saveResult @ ] -----');
//
//
// })();


gitperfMongo.saveLogToMongodb(dbConfig, params.project, params.branch, params.author, params.since, params.until).then(function(err, res){
    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    console.log('┏---- INFO: ----- start [save res @ ] -----');console.dir(res);console.log('┗---- INFO: -----  end  [res @ ] -----');

    process.exit(0);
});











/*
* Determinate params.
* ┌───────────┬────────────────────┬───────────────────────┬─────────────────────────────────────────────────────┐
* │ Cases:    │      CLI params    │       Config params   │   Action                                            │
* │           │         Y          │            Y          │           use config but cli param override config  │
* │           │         Y          │            N          │           use cli params                            │
* │           │         N          │            Y          │           use config params                         │
* │           │         N          │            N          │           error                                     │
* └───────────┴────────────────────┴───────────────────────┴─────────────────────────────────────────────────────┘
* */
function determinateParams(program){
    /*
    * program.args   : project full path list
    *
    * program.author : author list
    *        .branch : branch list
    *        .config : config file full name
    *        .since  : start date of analyse
    *        .until  : end date of analyse
    *
    * */
    let param = new Array();
    if(program.config){
        if(fileExist(program.config)){
            let fileConf = require(program.config);
            param.author  = fileConf.author;
            param.branch  = fileConf.branch;
            param.since   = fileConf.since;
            param.until   = fileConf.until;
            param.project = fileConf.project;
        }

    }

    if(program.author) param.author  = program.author;
    if(program.branch) param.branch  = program.branch;
    if(program.since) param.since    = program.since;
    if(program.until) param.until    = program.until;
    if(program.project) param.project = program.project;


    return param;
}


function fileExist(fileFullName){
    try{
        fs.statSync(fileFullName);
        console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\t true  ');
        return true;
    }catch(err){
        console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\t false  ');
        return false;
    }
}

