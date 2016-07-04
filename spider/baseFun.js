/**
 * Created by v-lyf on 2016/6/28.
 */

var vrSource=require("../models/VrSource");
var Dbopt=require('../models/Dbopt');
var  moment=require('moment');
var  superAgent =require('superagent');

var spiderBase={
       httpGetReq:function(url,header,querydata,callback){
        superAgent
            .get(url)
            .set(header)
            .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
            .query(querydata)
            .end(function(err,res){
                if(res&&res.text) {
                    var jsonData = JSON.parse(res.text);
                    return callback(err, jsonData);
                }else{
                    return callback(err);
                }
                //console.log(jsonData[0]);
            })
    },
    updateVrData:function(source,totalcount,synccount,callback){
        var date=moment().format('YYYY-MM-DD');
        Dbopt.findOneObj(vrSource,{vrsource:source,date:date},function(err,data){
            if(data){
                data.vrcount=totalcount;
                data.updateDate=new Date();
                data.save(function(err,data){
                    return callback(err,data);
                })
            }else{
                var temp={
                    vrsource:source,
                    vrcount:totalcount,
                    date:date ,
                    updateDate: new Date(), // 更新时间
                }
                Dbopt.addOneObj(vrSource,temp,function(err,data){
                    return callback(err,data);
                })
            }
        })
    },
}
module.exports=spiderBase;