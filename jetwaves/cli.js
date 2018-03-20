"use strict";

const moment  = require('moment');
const os      = require('os');
const log     = console.log;

const chalk   = require('chalk');
const args    = require('green').args;


const gitperf = require('./gitperf');
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
    1. specify config file:   --config=abc.config
        {
            projects:
                {
                    fullpath/to/project01,
                    fullpath/to/project02,
                    fullpath/to/project03
                }
            author:
                {
                    author01,
                    author02,
                    author03,
                }
            since:  YYYY-MM-DD,
            until:  YYYY-MM-DD
        }
    2. use cli args
        $gitperf projectFolderName [branchName] --author=UserName --since=YYYY-MM-DD --until=YYYY-MM-DD
 *
 *
 */



var help = args['-help'];
if(help){
    console.log('   ');
    console.log('                                   ' + chalk.bold.green('team-performance') + '');
    console.log('   ');

    console.log(' Tool used to summarize team members` performance by analysing multi projects` git commit logs. ');
    console.log('       Get more help with document at ' + chalk.green('https://github.com/jetwaves/team-performance/blob/master/README.md'));
    console.log('   ');
    console.log(chalk.blue('   - Command Format:'));
    console.log('           $gitperf projectPath branchName --author=UserName --since=YYYY-MM-DD --until=YYYY-MM-DD   ');
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
    console.log('       projectPath      :  OPTIONAL  :  project folder path,     use `,` to separate , ( required when --config    is not set ) ');
    console.log('       branchName       :  OPTIONAL  :  branch name to analyse , use `,` to separate  ');
    console.log('       --author         :  OPTIONAL  :  author name to analyse , use `,` to separate  ');
    console.log('       --since          :  OPTIONAL  :  start date of analyse                         ');
    console.log('       --until          :  OPTIONAL  :  end date of analyse                           ');
    console.log('   ');
    return ;
}













