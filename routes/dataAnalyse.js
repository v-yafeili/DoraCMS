/**
 * Created by v-lyf on 2016/6/28.
 */
var express = require('express');
var router = express.Router();
var moment=require("moment");
//数据库操作对象
var DbOpt = require("../models/Dbopt");
var returnModel=require("../util/apiDataModel");
var DbAnalyseOpt = require("../models/DbAnalyseopt");

router.get('/getMain', function (req, res, next) {
    DbAnalyseOpt.getContentBySource(0,function(err,data){
        if(err){
            res.json(new returnModel(0,"",[]))
        }else{
            res.json(new returnModel(1,"",data))
        }
    })
});


router.get('/sourceList', function (req, res, next) {
    var begindate=moment().add(-7,'d').format('YYYY-MM-DD');
    var enddate=moment().add(1,'d').format('YYYY-MM-DD');
    DbAnalyseOpt.vrSource(begindate,enddate,function(err,data){
        if(err){
            res.json(new returnModel(0,"",[]))
        }else{
            res.json(new returnModel(1,"",data))
        }
    })
});


module.exports = router;
