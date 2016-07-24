/**
 * Created by v-lyf on 2016/6/29.
 */
//=================执行爬虫===================
var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();
var async=require("async");
var hotcast=require('./hotCast');
var vr720yun=require('./vr720yun');
var utovr=require('./UtoVR');
var vr800=require('./vr800');
var vrBaoFeng=require('./VrBaoFeng');
var vrSanmon=require('./vrSanmon');
var vrSeeFile=require('./vrSeeFile');
var vrTimes=require('./vrTimes');
var vrQihuanyun=require('./vrqihuanyun');

var execlist=[vr720yun,vrBaoFeng,vrSanmon,vrSeeFile,vrQihuanyun,hotcast,utovr,vr800,vrTimes];

rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 5;
rule.minute = 0;

var j = schedule.scheduleJob(rule, function(){
    sync();
});
var  sync=function(){
    console.log(new Date());
    console.log("开始同步");
    async.eachSeries(execlist, function(item, callback) {
        var temp=new item();
        temp.getVideoItem(function(err,cb){
            callback();
        })
    },function(err) {
        console.log(new Date());
        console.log("同步完成");
    });
}

sync();


