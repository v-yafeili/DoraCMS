/**
 * Created by v-lyf on 2016/7/17.
 */
var ApiDataModel=require('../../util/apiDataModel');
var DbSiteFunc=require('../../models/db/siteFunc');
var  DbOpt = require("../../models/Dbopt");
var  userModel = require("../../models/User");
var ContentModel=require("../../models/Content");
var  smsVerifyCodeModel = require("../../models/smsVerifyCode");
var  viewUserModel = require("../viewModel/resUserModel").resBaseUser;
var secretParam= require('../common/jwt-secret').secretParam;
var jwt = require('jsonwebtoken');
var timeout = 60 * 5;
var baseFun={
      checkSmsCode:function(mobile,code,callback){
        smsVerifyCodeModel.findOne({mobile:mobile,smsCode:code, verified: false},function(err,instace){
            if(err)
            {
                return callback("查询出错: "+ err);
            }
            console.log(instace);
            if (!instace)
            {
                return callback("验证码错误，请重新发送");
            }
            //console.log(instace);
            var  now=new Date();
            if ((now-instace.createdTime)>timeout*1000){
                return callback("您已超时请重新发送");
            }
            instace.verified=true;
            instace.save(function(err,temp){
                console.log("修改验证码");
                if (err)
                {
                    return callback("服务器内部错误:"+err);
                }
                return callback(null);
            })

        });
    }
}
exports.doLogin=function(req,res){
    var userinfo={
        mobile:req.body.mobile,
        smscode:req.body.smscode
    };
    console.log(userinfo);
    if (userinfo.mobile===undefined||userinfo.smscode === undefined) {
        return res.json(
            new ApiDataModel(0, "参数错误", ""));
    }

    baseFun.checkSmsCode(userinfo.mobile,userinfo.smscode,function(err) {
        if (err) {
            return res.json(
                new ApiDataModel(0, err, ""));
        };
        DbOpt.findOneObj(userModel,{phoneNum: userinfo.mobile},function (err, userinstace) {
                if (err)
                {
                   // return callback ("查找用户出错:"+ err);
                    return res.json(
                        new ApiDataModel(0,"查找用户出错:"+ err , ""));
                } else
                {
                    if(!userinstace){
                        var user={
                            phoneNum:userinfo.mobile,
                            date:new Date(),
                            logintime:new Date(),
                        };
                        DbOpt.addOneObj(userModel,user,  function (err, newinstace) {
                            if (err) {
                               // return callback("保存用户出错"+err);
                                return res.json(
                                    new ApiDataModel(0, "保存用户出错"+err, {}));
                            }
                            var token = jwt.sign({
                                userId: newinstace._id,
                                timestamp: new Date(),
                                aud: secretParam.audience
                            }, secretParam.secret);
                            var returnmodel=new viewUserModel(newinstace);
                            returnmodel.token=token;

                            userModel.update({"_id":newinstace._id},
                                { $set: { token:token }},{safe: false},function(err,doc){});

                            return res.json(
                                new ApiDataModel(1, "", returnmodel));

                        });
                    }else {
                        {
                            var token = jwt.sign({
                                userId: userinstace._id,
                                timestamp: new Date(),
                                aud: secretParam.audience
                            }, secretParam.secret);
                            userinstace.token = token;
                            userinstace.logintime = Date.now();
                            userinstace.save(function (err, newinstace) {
                                if (err) {
                                    return res.json(
                                        new ApiDataModel(0, "保存用户出错"+err, {}));
                                }
                                var returnmodel=new viewUserModel(newinstace);
                                returnmodel.token=token;
                                return res.json(
                                    new ApiDataModel(1, "", returnmodel));
                            });
                        }

                    }

                }
            });

    });
}