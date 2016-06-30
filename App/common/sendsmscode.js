/**
 * Created by metis on 2015-08-17.
 */

var request = require('superagent');

var  smsVerifyCodeModel = require("../../models/smsVerifyCode");
exports.addsmscode=function(mobile,callback){
    var smscodeInstace=new smsVerifyCodeModel();
    smscodeInstace.mobile=mobile;
    smscodeInstace.smsCode=8888;
    smscodeInstace.createdTime=Date.now();
    smscodeInstace.save(function(err,user){
        if(err){
            if(callback!=undefined){
                return callback(err);
            }
        }
        return  callback(null,8888);
    })
}
exports.sendsmscode=function(mobile,callback) {
    var smscode=parseInt(Math.random()*90000+10000);
    //console.log("sendsmscode mobile:"+mobile);
    var mobilecode=mobile;
    var smscodeInstace=new smsVerifyCodeModel();
    smscodeInstace.mobile=mobile;
    smscodeInstace.smsCode=smscode;
    smscodeInstace.createdTime=Date.now();
    smscodeInstace.save(function(err,user){
        if(err){
            if(callback!=undefined){
                return callback(err);
            }
        }
      //  var sms = '您的饭应验证码是' + smscode + '。请在五分钟之内完成验证。本条信息无需回复。如非本人操作，请忽略。【为爱吃狂】';
        var sms ="【一步科技】"+smscode+", 您的一步学车注册／登陆验证码，三分钟内有效";
        var options  = {
            "sn": "SDK-WSS-010-08341",
            "pwd": "DD6929B3420DA8E2785261FBF1074440",
            "mobile": mobilecode,
            "content": sms,
            "ext":"",
            "stime":"",
            "rrid":"",
            "msgfmt":""
        };
        //console.log(options);
        request
            //.post('http://yunpian.com/v1/sms/send.json')
            //.get('http://sdk2.zucp.net:8060/webservice.asmx/mt') // gb2312 interface, no 'msgfmt' field
            //.get('http://sdk.entinfo.cn:8061/webservice.asmx/mdsmssend')  // utf8 interface
            .post('http://sdk2.entinfo.cn:8061/webservice.asmx/mdsmssend')  // utf8 interface
            //.set('Content-Type', 'text/plain')        // enable this when use gb2312
            //.query(queryString)                       // enable this when use gb2312
            //.query(options)
            .send(options)
            .type('form')
            .end(function(err, res){

                //console.log(res.statusCode);
                //console.log(res.text);
                callback(err, res);
            });

    });
}

var sendmessage=function(mobile,msg,callback){
    var options  = {
        "sn": "SDK-WSS-010-08341",
        "pwd": "DD6929B3420DA8E2785261FBF1074440",
        "mobile": mobile,
        "content": msg,
        "ext":smsconfig.ext,
        "stime":"",
        "rrid":"",
        "msgfmt":""
    };
    request
        .post('http://sdk2.entinfo.cn:8061/webservice.asmx/mdsmssend')  // utf8 interface
        .send(options)
        .type('form')
        .end(function(err, res){
            callback(err, res);
        });

}

