/**
 * Created by v-lyf on 2015/9/2.
 */

var jwt = require('jsonwebtoken');
var BaseReturnInfo = require('../../util/apiDataModel.js');
var secretParam= require('../common/config');
var Dbopt=require('../../models/Dbopt');
var untilTool=require('../common/untilTool');
var ApiAccessLog=require('../../models/ApiAccessLog');
// 接口访问验证
exports.apiAccessLog=function(req,res,next){
    var accessParms={
        dateline:req.query._dateline,
        ver:req.query._ver,
        os:req.query._os,
        msid:req.query._msid,
    }
    if (typeof accessParms.dateline !== 'undefined'&& accessParms.dateline!=""&&
        typeof accessParms.ver !== 'undefined'&& accessParms.ver!=""&&
        typeof accessParms.os !== 'undefined'&& accessParms.os!=""&&
        typeof accessParms.msid !== 'undefined'&& accessParms.msid!=""
       ){
        var  timespan=Math.round(new Date().getTime()/1000);
        if((timespan-accessParms.dateline*1)>60){
            return res.json(new BaseReturnInfo(0,secretParam.reqTimeOut,""));
        }
        accessParms.creattime=new Date();
        accessParms.apiname=req.path;
        accessParms.ip=untilTool.getClientIp(req);
        Dbopt.addOneObj(ApiAccessLog,accessParms,function(err,data){
        });
        next();
    }
    else{
       return res.json(new BaseReturnInfo(0,secretParam.parmsError,""));
    }
}
// 验证用户请求

exports.ensureAuthorized = function(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined'&&bearerHeader!="") {
        req.token = bearerHeader;
        verifyToken(bearerHeader, function(ret, decode){
            if(ret){
                if(decode.userId === undefined){
                    return res.json(new BaseReturnInfo(0,"No user id was found In authenticated",""));
                }
                req.userId = decode.userId;
                next();
            }else{

                return res.json(new BaseReturnInfo(0,"Not authenticated",""));
            }
        });
    } else {
        return res.json(new BaseReturnInfo(0,"Not authenticated",""));
    }
};


var verifyToken = function(token, callback) {
    try {
        jwt.verify(token, secretParam.secret, undefined, function (err, decoded) {
            if (err) {
                console.log(err);
                if (callback != undefined) {
                    callback(false);
                }
            } else {
                if (callback != undefined) {
                    callback(true, decoded);
                }
            }
        });
    }
    catch(ex)
    {
        callback(false);
    }
}