/**
 * Created by v-yaf_000 on 2016/6/6.
 */

//七牛相关操作
var qiniu = require("qiniu");
var settings = require('../models/db/settings');

//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = settings.qiniuAccessKey;
qiniu.conf.SECRET_KEY = settings.qiniuSecretKey;
qiniu.conf.UP_HOST = 'http://up-z1.qiniu.com';

//要上传的空间
imgBucket = 'img-resource';
videoBucket = 'vrresource';



//构建上传策略函数
function uptoken(bucketName, key) {
    var putPolicy = new qiniu.rs.PutPolicy(bucketName+":"+key);
    return putPolicy.token();
}



//构造上传函数
function uploadFile( filetype,filename, localFile,callbak) {
    var token="";
    if (filetype==0){
         token =uptoken(imgBucket, filename);
    }else {
         token =uptoken(videoBucket, filename);
    }

    var extra = new qiniu.io.PutExtra();

    qiniu.io.putFile(token, filename, localFile, extra, function(err, ret) {
        if(!err) {
            // 上传成功， 处理返回值
            //console.log(ret.hash, ret.key, ret.persistentId);
            return callbak(err, ret.key);
        } else {
            // 上传失败， 处理返回代码
            console.log(err);
            return callbak(err);
        }
    });
};

//调用uploadFile上传
//uploadFile(0,"tsetsetet.jpg",'../spider/temp/test.jpg',function(err,data){
//    console.log('finish');
//})

exports.upFileToQiNiu=uploadFile;
