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


var tool = {
    saveLogToMongodb                       : saveLogToMongodb,
};


function checkMongodbModule(){
    // check if the mongodb module is installed.
    try {
        console.log(require.resolve("mongodb"));
    } catch(e) {
        console.error(chalk.bgRed(' Save commit log To mongodb function requires mongodb module to be installed.'));
        console.error(chalk.red('   Execute `npm install mongodb --save` to enable the function` '));
        process.exit(e.code);
    }
}


function insertOne(db, doc){
    return new Promise(
function(resolve, reject){
    db.test.insert(doc, function(err,res){
        if(err){
            console.error('           err  = ');  console.dir(err);
            reject(err);
        }
        resolve(res);
    });
})
}

async function saveLogToMongodb(dbConfig, project, branch, author, since, until ){
    checkMongodbModule();

    let info = await gitperf.getMultiProjectCommitSummary(project, branch, author, since, until);
    // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    // console.log('┏---- INFO: ----- start [info @ ] -----');console.dir(info);console.log('┗---- INFO: -----  end  [info @ ] -----');

    // log(gitperf.commitHistoryTableRedemption(info.commitHistory));
    // log(gitperf.authorsTableRedemption(info.authors));

    // save commit history to MongoDB
    let mongojs = require('mongojs');
    let db = mongojs('git:123456@127.0.0.1/gitperf', ['test']);
    // db.test.find({}).toArray(function(err, docs){
    //     if(err) return reject(err);
    //     resolve(docs);
    // });
    console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);console.log('\tINFO:\t inserting documents into mongodb  ');
    for(let item of info.commitHistory){
        // console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
        // console.log('┏---- INFO: ----- start [item @ ] -----');console.dir(item);console.log('┗---- INFO: -----  end  [item @ ] -----');
        let testItem = {
            project : item.project,
            branch : item.branch,
            date : item.date,
            dateStr : item.dateStr,
            hash : item.hash,
            author : item.author,
            msgArr : item.msgArr,
            msg : item.msg,
            merge : item.merge
        };
        let ioRes = await insertOne(db, testItem);
        console.log("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
        console.log('┏---- INFO: ----- start [ioRes @ ] -----');console.dir(ioRes);console.log('┗---- INFO: -----  end  [ioRes @ ] -----');
    }
    return true;


}




module.exports = tool;




























