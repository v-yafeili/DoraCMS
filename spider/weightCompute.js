/**
 * Created by v-lyf on 2016/7/24.
 */
var fs=require('fs');
var path=require("path");
var async=require("async");
var contentModel=require("../models/Content");
var Dbopt=require('../models/Dbopt');
var maxDuration;
var maxBit;
var timespan;
var maxClicknumber;
var maxsocre;
var vrSource=["hotcast","utovr","720yun","vr800","baofengvr","qihuanyun","sanmon","vrseefile","vrtimes"];
var vrSourceScore=[5,4.5,4,4.8,5,4.5,4.8,4.5,4.2];
var getVideoMaxDuration=function (filed,callback){
    var sort={};
    sort[filed]=-1;
    contentModel.find({isQiniu: 1})
        .sort(sort)
        .limit(1)
        .exec(function(err,data){
            callback(err,data[0][filed]);
        })
}
var updateIndexFalse=function(callback){
    contentModel.update({},{$set:{isindex:0}},{safe: false, multi: true},function(err,data){
        callback(err,data);
    })
}
var searchConent =function(callback) {

    contentModel.findOne({isQiniu: 1, isindex:0}, function (err, data) {
        if(data){
            console.log(data._id);
            var sourceindex=vrSource.indexOf(data.source);
            var tempsource=1.5;
            if(sourceindex>-1){
                tempsource=(vrSourceScore[sourceindex]/5)*1.5;
            }else{
                tempsource=(4.5)*1.5;
            }
          var tempduration=  ((data.duration?data.duration:0)/maxDuration)*2;
          var temptime=  ((data.date?data.date:new Date()).getTime()/timespan)*2;
            var tempbit=  ((data.bit_rate?data.bit_rate:0)/maxBit)*3;
            var tempClicknumber=  ((data.clickNum?data.clickNum:0)/maxClicknumber)*0.5;
            var tempmaxsocre=  ((data.videoScore?data.videoScore:0)/maxsocre)*0.5;
            //console.log(data.bit_rate);
            //console.log(maxBit);
            console.log(tempsource);
            console.log(tempduration);
            console.log(temptime);
            console.log(tempbit);
            console.log(tempClicknumber);
            console.log(tempmaxsocre);

            var total=tempsource+tempduration+temptime+tempbit+tempClicknumber+tempmaxsocre;
            console.log(total.toFixed(4));
            data.index=total.toFixed(4);
            data.isindex=1;
            data.save(function(err,data){
                callback();
            })
        }
        else{
            callback(err);
        }
    })
};



var syncImgAndVedio=function(){
    var filecount=10000;
    var currentcount=0;
    timespan=new Date().getTime();
    async.parallel([
        function(cb) {
            updateIndexFalse(function(err,data){
                cb(err);
            })
        },
        function(cb) {
            getVideoMaxDuration("bit_rate",function(err,data){
                maxBit=data?data:1;
                cb(err);
            })
        },
        function(cb) {
            getVideoMaxDuration("duration",function(err,data){
            maxDuration=data?data:1;
            cb(err);
        }) },
        function(cb) {
            getVideoMaxDuration("clickNum",function(err,data) {
                maxClicknumber = data ? data : 1;
                cb(err);
            })
        },
        function(cb) {
            getVideoMaxDuration("videoScore",function(err,data) {
                maxsocre = data ? data : 1;
                cb(err);
            })
        }
    ], function (err, results) {
       if(err){
           console.log(err);
       }else{
           async.whilst(
               function(){return currentcount<filecount;
               },
               function(cb){
                   console.log("同步第几条数据："+currentcount);
                   searchConent(function(){
                       currentcount++;
                       cb()
                   })
               },
               function(err) {
                   if (err) {

                       console.log('同步出错'+ err);
                   }
                   console.log('同步完成，数量：'+filecount);
               })
       }
    });

}

syncImgAndVedio();

//getVideoMaxDuration("bit_rate",function(err,data){
//   console.log(data)
//})