/**
 * Created by v-lyf on 2016/6/28.
 */
var Dbopt=require('./Dbopt');
var Content = require("./Content");
var vrSource= require('./VrSource');
var moment=require("moment");
var _=require('underscore');

var DbAnalyseOpt={
    getContentBySource:function(isrefsh,callback){
        Content.aggregate([
                {$group:{_id:"$source",vrdatacount : {$sum : 1}}}
            ],function(err,data){
                if(err){
                    return callback(err);
                };
                return callback(null,data);
            }
        )
    },
    // 统计各个视频网站的资源数量天
    vrSource:function(beginDate,endDate,callback){
        console.log("kaishiqingq"+beginDate);
        Dbopt.findAllByParms(vrSource,  {"date": { $gte: beginDate, $lte:endDate}},function(err,data){
            if(err){
                return callback(err);
            }
          var tempdata=  _.groupBy(data,function(item){
                return item.vrsource;
            })
            for(var item in tempdata){
                console.log(item);
            }
            return callback(null,tempdata);
        })
    }
};
module.exports = DbAnalyseOpt;
//=============================我要进行方法的单元测试=====================
//DbAnalyseOpt.getContentBySource(1,function(err,data){
//    console.log(data)
//})
//var begindate=moment().add(-7,'d').format('YYYY-MM-DD');
//var enddate=moment().add(1,'d').format('YYYY-MM-DD');
//console.log(begindate);
//console.log(enddate);
//DbAnalyseOpt.vrSource(begindate,enddate,function(err,data){
//    console.log(data)
//})
