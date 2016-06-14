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