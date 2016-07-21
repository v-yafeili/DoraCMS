/**
 * Created by v-lyf on 2016/7/18.
 */
var  request =require('superagent');
var fs=require('fs');
var path=require("path");
var async=require("async");
var contentModel=require("../models/Content");
var Dbopt=require('../models/Dbopt');
var qiniu=require('../util/qiniu');
var downloadImg = function(uri, callback){
    request.get(uri+"?avinfo")
        .end(function(err, res){
            // console.log('content-type:', res.headers['content-type']);  //这里返回图片的类型
            // console.log('content-length:', res.headers['content-length']);  //图片大小
            if (err) {
                //console.log('err: '+ err);
                return callback(err);
            }
            callback(err,res.text);
            //console.log( res.headers['content-length']);
           //调用request的管道来下载到 images文件夹下
        });
};
function MillisecondToDate(msd) {
var time = parseFloat(msd);
if (null != time && "" != time) {
    if (time > 60 && time < 60 * 60) {
        time = parseInt(time / 60.0) + "分" + parseInt((parseFloat(time / 60.0) -
                parseInt(time / 60.0)) * 60) + "秒";
    }
    else if (time >= 60 * 60 && time < 60 * 60 * 24) {
        time = parseInt(time / 3600.0) + "时" + parseInt((parseFloat(time / 3600.0) -
                parseInt(time / 3600.0)) * 60) + "分" +
            parseInt((parseFloat((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) -
                parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)) * 60) + "秒";
    }
    else {
        time = parseInt(time) + "秒";
    }
}
return time;
}

function bytesToSize(bytes) {
    if (bytes === 0) return '0 B';
    var k = 1000, // or 1024
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));

    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}
var searchConent =function(callback) {
    contentModel.findOne({isQiniu: 1, duration: {$exists: false}}, function (err, data) {
        console.log(data);
        if (data)
            console.log(data._id);
        var url = data.hd_url ? data.hd_url : data.sd_url;
        console.log(url);
        downloadImg(url, function (err, infodata) {
            try {
                infodata = JSON.parse(infodata);
                console.log(infodata.format.duration);
                console.log(infodata.format.size);
                console.log(infodata.format.bit_rate);
                console.log(MillisecondToDate(infodata.format.duration));
                console.log(bytesToSize(infodata.format.size));
                data.duration = infodata.format.duration;
                data.size = infodata.format.size;
                data.bit_rate = infodata.format.bit_rate;
                data.videoTime = MillisecondToDate(infodata.format.duration);
                data.hd_fileSize = bytesToSize(infodata.format.size);
                data.save(function (err, newdata) {
                    console.log(data._id + "save success");
                    callback();
                })
            }
            catch
                (ex){
                data.duration=0;
                data.save(function (err, newdata) {
                    console.log(data._id + "save success");
                   return callback();
                })
            }

        })
    });
}

var syncImgAndVedio=function(){
    var filecount=10000;
    var currentcount=0;
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

syncImgAndVedio();