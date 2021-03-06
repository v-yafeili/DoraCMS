var express = require('express');
var fs = require('fs');
var util = require('util');

var router = express.Router();

//数据库操作对象
var DbOpt = require("../models/Dbopt");
// 文档对象
var Content = require("../models/Content");
//文章类别对象
var ContentCategory = require("../models/ContentCategory");
//短id
var shortid = require('shortid');
//校验
var validator = require("validator");
//时间格式化
var moment = require('moment');
//站点配置
var settings = require("../models/db/settings");
var siteFunc = require("../models/db/siteFunc");
var url = require('url');
//缓存
var cache = require('../util/cache');


var xmltxt='';
var getxmlText=function(){
    if(xmltxt==''){
        xmltxt= fs.readFileSync('./routes/videopano.xml','utf-8');
    }
    return xmltxt;
}

//==============================手机端接口==========================================================
router.get('/app', function (req, res, next) {
    siteFunc.renderToTargetPageByType(req,res,'app');
});
router.get('/app/details/:url', function (req, res, next) {

    var url = req.params.url;
    var currentId = url.split('.')[0];
    if(shortid.isValid(currentId)){
        Content.findOne({ '_id': currentId , 'state' : true}).populate('category').populate('author').exec(function(err,result){
            if (err) {
                console.log(err)
            } else {
                if (result) {
//                更新访问量
                    result.clickNum = result.clickNum + 1;
                    result.save(function(){
                        var cateParentId = result.sortPath.split(',')[1];
                        var cateQuery = {'sortPath': { $regex: new RegExp(cateParentId, 'i') }};

                        siteFunc.getContentsCount(req,res,cateParentId,cateQuery,function(count){
                            siteFunc.renderToTargetPageByType(req,res,'appdetail',{count : count, cateQuery : cateQuery, detail : result});
                        });

                    })
                } else {
                    siteFunc.renderToTargetPageByType(req,res,'error',{info : '非法操作!',message : settings.system_illegal_param, page : 'do404'});
                }
            }
        });
    }else{
        siteFunc.renderToTargetPageByType(req,res,'error',{info : '非法操作!',message : settings.system_illegal_param , page : 'do500'});
    }

});

router.get('/app/:forder/:defaultUrl', function (req, res, next) {
    var defaultUrl = req.params.defaultUrl;
    var url = defaultUrl.split('___')[1];
    var currentUrl = url;
    if (url) {
        if(url.indexOf("—") >= 0){
            currentUrl = url.split("—")[0];
            var catePageNo = (url.split("—")[1]).split(".")[0];
            if(catePageNo && validator.isNumeric(catePageNo)){
                req.query.page = catePageNo;
            }
        }
        appqueryCatePage(req, res, currentUrl);
    }else{
        next();
    }

});
//==================================================================================================

router.get('/getxml/:vrId', function(req, res, next) {
    getxmlText();
    //console.log(req.params.vrId);
    var  vrid=req.params.vrId;
    Content.findOne({ '_id': vrid , 'state' : true}).exec(function(err,result){
        if (err||!result) {
            //console.log(err)
            res.send(err);
        } else {
            var hdvideourl=result.hd_url||result.sd_url;
            var sdvideourl=result.sd_url||result.hd_url;
            var imgurl=result.sImg;
            //var videourl="http://7xlp0e.com1.z0.glb.clouddn.com/therelaxatron2.mp4";
            //var imgurl="http://7xlp0e.com1.z0.glb.clouddn.com/5615ce19193184140355c49f.png";
            var returninfo=  util.format(xmltxt.toString(), sdvideourl, imgurl, hdvideourl,imgurl+"?vid="+vrid);
            res.send(returninfo);
        }
    });


});
/* GET home page. */
router.get('/', function (req, res, next) {

    siteFunc.renderToTargetPageByType(req,res,'index');

});


router.get('/test', function (req, res, next) {

   res.render('test');

});

//缓存站点地图
router.get("/sitemap.html", function (req, res, next) {
    var siteMapNeedData;
    cache.get(settings.session_secret + '_siteMapHtml',function(siteMapHtml){
       if(siteMapHtml) {
           siteMapNeedData = siteMapHtml;
           siteFunc.renderToTargetPageByType(req,res,'sitemap',{docs : siteMapNeedData});
       }else{
           Content.find({'type': 'content','state' : true},'title',function(err,docs){
               if(err){
                   res.end(err);
               }else{
                   siteMapNeedData = docs;
                   cache.set(settings.session_secret + '_siteMapHtml', docs, 1000 * 60 * 60 * 24); // 缓存一天
                   siteFunc.renderToTargetPageByType(req,res,'sitemap',{docs : siteMapNeedData});
               }
           })
       }
    });
});


//文档详情页面
router.get('/details/:url', function (req, res, next) {

    var url = req.params.url;
    var currentId = url.split('.')[0];
    if(shortid.isValid(currentId)){
        Content.findOne({ '_id': currentId , 'state' : true}).populate('category').populate('author').exec(function(err,result){
            if (err) {
                console.log(err)
            } else {
                if (result) {
//                更新访问量
                    result.clickNum = result.clickNum + 1;
                    result.save(function(){
                        var cateParentId = result.sortPath.split(',')[1];
                        var cateQuery = {'sortPath': { $regex: new RegExp(cateParentId, 'i') }};

                        siteFunc.getContentsCount(req,res,cateParentId,cateQuery,function(count){
                            siteFunc.renderToTargetPageByType(req,res,'detail',{count : count, cateQuery : cateQuery, detail : result});
                        });

                    })
                } else {
                    siteFunc.renderToTargetPageByType(req,res,'error',{info : '非法操作!',message : settings.system_illegal_param, page : 'do404'});
                }
            }
        });
    }else{
        siteFunc.renderToTargetPageByType(req,res,'error',{info : '非法操作!',message : settings.system_illegal_param , page : 'do500'});
    }

});


//分类列表页面  http://127.0.0.1/DoraCms___VylIn1IU-1.html
router.get('/:defaultUrl', function (req, res, next) {

    var defaultUrl = req.params.defaultUrl;
    var url = defaultUrl.split('___')[1];
    var indexUrl = defaultUrl.split('—')[0];
    if (indexUrl == 'page') { // 首页的分页
        var indexPage = defaultUrl.split('—')[1].split(".")[0];
        if(indexPage && validator.isNumeric(indexPage)){
            req.query.page = indexPage;
        }
        siteFunc.renderToTargetPageByType(req,res,'index');
    } else {
        var currentUrl = url;
        if (url) {
            if(url.indexOf("—") >= 0){
                currentUrl = url.split("—")[0];
                var catePageNo = (url.split("—")[1]).split(".")[0];
                if(catePageNo && validator.isNumeric(catePageNo)){
                    req.query.page = catePageNo;
                }
            }
            queryCatePage(req, res, currentUrl);
        }else{
            next();
        }
    }

});

//分类列表页面  http://127.0.0.1/front-development/AngluarJs___EyW7kj6w
router.get('/:forder/:defaultUrl', function (req, res, next) {

    var defaultUrl = req.params.defaultUrl;
    var url = defaultUrl.split('___')[1];
    var currentUrl = url;
    if (url) {
        if(url.indexOf("—") >= 0){
            currentUrl = url.split("—")[0];
            var catePageNo = (url.split("—")[1]).split(".")[0];
            if(catePageNo && validator.isNumeric(catePageNo)){
                req.query.page = catePageNo;
            }
        }
        queryCatePage(req, res, currentUrl);
    }else{
        next();
    }


});

//分类页面路由设置
function queryCatePage(req, res, cateId) {

    if(shortid.isValid(cateId)){
        ContentCategory.findOne({"_id": cateId}).populate('contentTemp').exec(function(err,result){
            if (err) {
                siteFunc.renderToTargetPageByType(req,res,'error',{info : '页面未找到!',message : err.message, page : 'do500'});
            } else {
                if (result) {
                    var contentQuery = {'sortPath': { $regex: new RegExp(result._id, 'i') },'state' : true};
                    var cateParentId = result.sortPath.split(',')[1];
                    var cateQuery = {'sortPath': { $regex: new RegExp(cateParentId, 'i') }};

                    siteFunc.renderToTargetPageByType(req,res,'contentList',{contentQuery : contentQuery,cateQuery : cateQuery,result : result});
                }
                else {
                    siteFunc.renderToTargetPageByType(req,res,'error',{info : '非法操作!',message : settings.system_illegal_param, page : 'do500'});
                }
            }
        });
    }else{
        siteFunc.renderToTargetPageByType(req,res,'error',{info : '非法操作!',message : settings.system_illegal_param, page : 'do500'});
    }

}

function appqueryCatePage(req, res, cateId) {

    if(shortid.isValid(cateId)){
        ContentCategory.findOne({"_id": cateId}).populate('contentTemp').exec(function(err,result){
            if (err) {
                siteFunc.renderToTargetPageByType(req,res,'error',{info : '页面未找到!',message : err.message, page : 'do500'});
            } else {
                if (result) {
                    var contentQuery = {'sortPath': { $regex: new RegExp(result._id, 'i') },'state' : true};
                    var cateParentId = result.sortPath.split(',')[1];
                    var cateQuery = {'sortPath': { $regex: new RegExp(cateParentId, 'i') }};

                    siteFunc.renderToTargetPageByType(req,res,'appcontentList',{contentQuery : contentQuery,cateQuery : cateQuery,result : result});
                }
                else {
                    siteFunc.renderToTargetPageByType(req,res,'error',{info : '非法操作!',message : settings.system_illegal_param, page : 'do500'});
                }
            }
        });
    }else{
        siteFunc.renderToTargetPageByType(req,res,'error',{info : '非法操作!',message : settings.system_illegal_param, page : 'do500'});
    }

}


module.exports = router;
