/**
 * Created by v-lyf on 2016/6/30.
 */
//通用操作
var  DbOpt = require("../../models/Dbopt");
var  smsVerifyCode = require("../../models/smsVerifyCode");
var BaseReturnInfo = require('../../util/apiDataModel.js');
var smscodemodule=require('../common/sendsmscode').sendsmscode;
var addtestsmscode=require('../common/sendsmscode').addsmscode;

var mobileVerify = /^1\d{10}$/;
var resendTimeout = 60;
var serverFun={
     sendSmsResponse : function( error, response,callback){
        if(error || response.statusCode != 200){
            return callback("Error occured in sending sms: " + error);
        }

        // get back to user
        return callback(null,"Error occured in sending sms: " + error);
    },
    getCodebyMolile:function(mobile,callback){
        DbOpt.findOneObj(smsVerifyCode,{mobile:mobile},function(err,instace)
            {
                if(err)
                {
                    return callback("发送验证码错误: " + err);
                }
                if(instace){
                    var  now= new Date();
                    if ((now-instace.createdTime)<resendTimeout*1000){
                        return callback("您发送过于频繁，请稍后再发");
                    }
                    else{
                        instace.remove(function(err){
                            if(err){
                                return callback("发送验证码错误: " + err);
                            }
                            if(mobilenumber.substr(0,8)=="18444444"){
                                addtestsmscode(mobilenumber,callback)
                            }else{
                                smscodemodule(mobilenumber,function(err,response){
                                    return  this.sendSmsResponse(err,response,callback);
                                });}
                        });
                    }

                }
                else{
                    // now send
                    if(mobilenumber.substr(0,8)=="18444444"){
                        addtestsmscode(mobilenumber,callback)
                    }else{
                        smscodemodule(mobilenumber, function(error, response){
                            return   this.sendSmsResponse( error, response,callback);
                        });}
                }


            }
        );
    }
}

exports.fetchCode=function(req,res){
    var mobile = req.query.mobile;
    if (mobile === undefined) {
        return res.json(
            new BaseReturnInfo(0,"手机号错误",""));
    }
    var number = mobileVerify.exec(mobile);
    if (number != mobile) {
        return res.status(400).json(
            new BaseReturnInfo(0,"手机号错误","")
        );
    }
    serverFun.getCodebyMolile(mobile,function(err){
        if(err){
            return  res.json(
                new BaseReturnInfo(0,err,""));
        }
        else
        {
            return  res.json(
                new BaseReturnInfo(1,"","send success"));
        }
    });

};