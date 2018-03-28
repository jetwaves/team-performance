#! /usr/bin/node --harmony

"use strict";

const moment  = require('moment');
const os      = require('os');
const log     = console.log;
const _       = require('lodash');
const fs      = require('fs');
const chalk   = require('chalk');
const program   = require('commander');


const gitperf = require('./gitperfLib');
const pkg     = require('../package.json');


// (async function (){
//     let folders = [
//                     '/home/jetwaves/dev/__github/laravel-util',
//                     '/home/jetwaves/dev/__github/tp'
//                   ];
//     let gitperfJSON = await gitperf.getMultiProjectCommitSummary(folders,null,null,null,null);
//     console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
//     console.log('┏---- INFO: ----- start [gitperfJSON @ ] -----');console.dir(gitperfJSON);console.log('┗---- INFO: -----  end  [gitperfJSON @ ] -----');
//
// })();

/**
 *
 type of args:
    1. specify config file:   --config=config.abc.json
             {
                 "project":      [
                     "fullpath/to/project01",
                     "fullpath/to/project02",
                     "fullpath/to/project03"
                 ],
                 "author" :
                 [
                     "author01",
                     "author02",
                     "author03"
                 ],
                 "branch":
                     [
                         "dev",
                         "master"
                     ],
                 "since":  "YYYY-MM-DD",
                 "until":  "YYYY-MM-DD"
             }
    2. use cli args
        $gitperf projectFolderName [branchName] --author=UserName --since=YYYY-MM-DD --until=YYYY-MM-DD
 *
 *
 */
// let args = parseArgs(process.argv);
//
// if(args.help){
//     showHelp();
//     return ;
// }
//
//
// console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
// console.log('┏---- INFO: ----- start [args @ ] -----');console.dir(args);console.log('┗---- INFO: -----  end  [args @ ] -----');
//
// let params = new Array();
//
// if(args.author) params.author = args.author;
// if(args.since)  params.since  = args.since;
// if(args.until)  params.until  = args.until;
//
//
// if(args.config){
//     if( !fileExist(args.config)){
//         console.log(chalk.red('ERROR: config file [' + args.config + '] does not exist .'));
//         return;
//     }
//     params.config = args.config;
// }
//
// console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
// console.log('┏---- INFO: ----- start [params @ ] -----');console.dir(params);console.log('┗---- INFO: -----  end  [params @ ] -----');
//
//


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
    .usage('gitperf [--config=] [--project=] [--branch=] [--author=] [--since=] [--until=] ')
    .description('    Summarize projects` team members` performance by summarizing git commit log ')
    .option('-c, --config <items>', 'config file full name')
    .option('--project <items>','project path to summarize, separate by `,` ',filterList)
    .option('--since <YYYY-MM-DD>', 'start date of analyse', validDate)
    .option('--until <YYYY-MM-DD>', 'end date of analyse', validDate)
    .option('--config <items>', 'config file full name')
    .option('--branch <items>', 'branch names to summarize, separate by `,` ',filterList)
    .option('--author <items>', 'author names to summarize, separate by `,` ',filterList)
    .parse(process.argv);

let params = determinateParams(program);


// console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
// console.log('┏---- INFO: ----- start [params @ ] -----');console.dir(params);console.log('┗---- INFO: -----  end  [params @ ] -----');


(async function (){
    // params.project = ['/home/jetwaves/dev/__github/tp','/home/jetwaves/dev/__github/route-to-controller'];
    // params.project = ['/home/jetwaves/dev/__github/tp'];
    let info = await gitperf.getMultiProjectCommitSummary(params.project, params.branch, params.author, params.since, params.until);
    // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    // console.log('┏---- INFO: ----- start [info @ ] -----');console.dir(info);console.log('┗---- INFO: -----  end  [info @ ] -----');
    log(gitperf.commitHistoryTableRedemption(info.commitHistory));
    log(gitperf.authorsTableRedemption(info.authors));

})();










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






function showHelp(){
    console.log('   ');
    console.log('                                   ' + chalk.bold.green('team-performance') + '');
    console.log('   ');

    console.log(' Tool used to summarize team members` performance by analysing multi projects` git commit logs. ');
    console.log('       Get more help with document at ' + chalk.green('https://github.com/jetwaves/team-performance/blob/master/README.md'));
    console.log('   ');
    console.log(chalk.blue('   - Command Format:'));
    console.log('           $gitperf --project=projectPath --branch=branchName --author=UserName --since=YYYY-MM-DD --until=YYYY-MM-DD   ');
    console.log('       or');
    console.log('           $gitperf --config=path/to/config/gitperf.config --author=UserName --since=YYYY-MM-DD --until=YYYY-MM-DD   ');
    console.log('   ');
    console.log(chalk.blue('   - Content Format of Config file'));
    console.log('       {                                       ');
    console.log('           project:                            ');
    console.log('               {                               ');
    console.log('                   fullpath/to/project01,      ');
    console.log('                   fullpath/to/project02,      ');
    console.log('                   fullpath/to/project03       ');
    console.log('               }                               ');
    console.log('           branch:                             ');
    console.log('               {                               ');
    console.log('                   branchName01,               ');
    console.log('                   branchName02,               ');
    console.log('                   branchName03,               ');
    console.log('               {                               ');
    console.log('           author:                             ');
    console.log('               {                               ');
    console.log('                   author01,                   ');
    console.log('                   author02,                   ');
    console.log('                   author03,                   ');
    console.log('               }                               ');
    console.log('           since:  YYYY-MM-DD,                 ');
    console.log('           until:  YYYY-MM-DD                  ');
    console.log('       }                                       ');
    console.log('   ');
    console.log(chalk.blue('   - Param Description: '));
    console.log('       --config         :  OPTIONAL  :  config file`s full name,                     , ( required when projectPath is not set ) ');
    console.log('       --project        :  OPTIONAL  :  project folder path,     use `,` to separate , ( required when --config    is not set ) ');
    console.log('       --branch         :  OPTIONAL  :  branch name to analyse , use `,` to separate  ');
    console.log('       --author         :  OPTIONAL  :  author name to analyse , use `,` to separate  ');
    console.log('       --since          :  OPTIONAL  :  start date of analyse                         ');
    console.log('       --until          :  OPTIONAL  :  end date of analyse                           ');
    console.log('   ');
}













