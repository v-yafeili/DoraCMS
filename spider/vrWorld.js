/**
 * Created by v-yaf_000 on 2016/6/8.
 */
var  superAgent =require('superagent');
var async=require("async");
var  config=require('./spiderConfig').hotCastConfig;
var vrWordTypeUrl='http://www.gevek.com/api/gameapi/movietype';
var contentModel=require("../models/Content");
var categoryModel=require('../models/ContentCategory');
var Dbopt=require('../models/Dbopt');

// 同步vr 世界 视频源视频

var   httpReqirest=function(url,senddata,callback){
    superAgent
        .post(url)
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .send(senddata)
        .end(function(err,res){
            var  jsonData=JSON.parse(res.text);
            return callback(err,jsonData);
            //console.log(jsonData[0]);
        })
};
httpReqirest(vrWordTypeUrl,{"classify":0},function(err,data){
    console.log(data);
})


//
//{
//    "id":"636",
//    "sort":"432",
//    "allow":"1",
//    "title":"哈利波特4片段",
//    "update_time":"2016-06-21",
//    "all_time":"00:04:29",
//    "play_count":"1",
//    "video_size":"125368757",
//    "classify":"0",
//    "type":"15",
//    "format_classify":"MP4",
//    "doublescreen":"1",
//    "is_down":"1",
//    "is_home":"2",
//    "contid":"924",
//    "icon":"http://oss.gevek.com/img/20160621/20160621100114_16017.jpg?auth_key=1466605797-0-0-f3a5994766e2df270df0325161fed5c8",
//    "downurl":"http://oss.gevek.com/MovieOnline/20160606/165halibote4pianduan.mp4?auth_key=1466605797-0-0-a7dcd846fbe260ff058484d94fd7c63f",
//    "star":"5",
//    "downurl2":"http://oss.gevek.com/MovieOnline/20160606/165halibote4pianduan.mp4?auth_key=1466605797-0-0-a7dcd846fbe260ff058484d94fd7c63f"
//}