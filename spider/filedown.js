/**
 * Created by v-yaf_000 on 2016/6/6.
 */
// 同步图片和视频
var  request =require('superagent');
var fs=require('fs');
var path=require("path");
var async=require("async");
var contentModel=require("../models/Content");
var Dbopt=require('../models/Dbopt');
var qiniu=require('../util/qiniu');



var downloadImg = function(uri, filename, callback){
    request.get(uri)
    .end(function(err, res){
        // console.log('content-type:', res.headers['content-type']);  //这里返回图片的类型
        // console.log('content-length:', res.headers['content-length']);  //图片大小
        if (err) {
            //console.log('err: '+ err);
            return callback(err);
        }
        //console.log( res.headers['content-length']);
        if(fs.existsSync('temp/'+filename)){
            if(fs.statSync('temp/'+filename).size==res.headers['content-length']){
                //console.log('存在文件');
                return callback();
            }
        }

        request.get(uri).pipe(fs.createWriteStream('temp/'+filename)).on('close', callback);  //调用request的管道来下载到 images文件夹下
    });
};
//var imgurl="http://cdn.hotcast.cn/image%2F20160526%2F5746ba3b700b7%2F750_458_%E8%BF%AA%E5%A3%AB%E5%B0%BC%E9%9F%B3%E4%B9%90%E5%A5%96%E7%BA%A2%E6%AF%AF%E7%A7%80.jpg";
//downloadImg(imgurl,"test.jpg",function(err,data){
//    console.log("img down finish");
//})
var qiNiuImgUrl="http://img.51itgirls.cn/";
var qiNiuVideoUrl="http://video.51itgirls.cn/";

var saveSyncData=function(data,callback){
    data.save(function(err){
        return callback(err)
    })

}
var searchConent=function(callback) {
    Dbopt.findOneAndUpdate(contentModel, {
    "$and": [{isQiniu: {$ne: 1}}, {isQiniu: {$ne: 2}},{isQiniu: {$ne: 3}}],
        "$or":[{source:"hotcast"},{"source":"vrseefile"}]
    }, function (err, contentData) {
        //console.log(contentData);
        console.log("开始同步：" + contentData._id);
        var img_url = contentData.sImg;  //http://cdn.hotcast.cn/image%2F20160526%2F5746ba3b700b7%2F750_458_%E8%BF%AA%E5%A3%AB%E5%B0%BC%E9%9F%B3%E4%B9%90%E5%A5%96%E7%BA%A2%E6%AF%AF%E7%A7%80.jpg
        var hd_url = contentData.hd_url;
        var sd_url = contentData.sd_url;
        var downFileCount = 0;
        var finishFileCount = 0;
        if (img_url.length > 0) {
            downFileCount++;
        }
        if (hd_url && hd_url.length > 0) {
            downFileCount++;
        }
        if ( sd_url && sd_url.length > 0) {
            downFileCount++;
        }
        var localImgName = contentData._id + path.extname(img_url);
        downloadImg(img_url, localImgName, function (err) {
            if (err) {
                console.log(err);
                finishFileCount++;
                contentData.isQiniu = 2;
                if(finishFileCount>=downFileCount){
                    saveSyncData(contentData,function(err,data){
                        return callback();
                    })
                }
            } else {
                console.log(contentData._id + " img down finish");
                qiniu.upFileToQiNiu(0, localImgName, './temp/' + localImgName, function (err, data) {
                    finishFileCount++;
                    if (err) {
                        console.log(err);
                        contentData.isQiniu = 2;
                    } else {
                        contentData.isQiniu = (contentData.isQiniu==2)?2:1;
                        contentData.sImg=qiNiuImgUrl+localImgName;
                        console.log(contentData._id + "img up finish");
                    }
                    if(finishFileCount>=downFileCount){
                        saveSyncData(contentData,function(err,data){
                            return callback();
                        })
                    }
                })
            }

        })
        if (hd_url && hd_url.length > 0) {
            var localHdVideoName = 'hd_' + contentData._id + path.extname(hd_url);
            downloadImg(hd_url, localHdVideoName, function () {
                if (err) {
                    contentData.isQiniu = 2;
                    finishFileCount++;
                    if(finishFileCount>=downFileCount){
                        saveSyncData(contentData,function(err,data){
                            return callback();
                        })
                    }
                } else {
                    console.log(contentData._id + " hd down finish");
                    qiniu.upFileToQiNiu(1, localHdVideoName, './temp/' + localHdVideoName, function (err, data) {
                        finishFileCount++;
                        if (err) {
                            console.log(err);
                            contentData.isQiniu = 2;
                        } else {
                            contentData.isQiniu = (contentData.isQiniu==2)?2:1;
                            contentData.hd_url=qiNiuVideoUrl+localHdVideoName;
                            console.log(contentData._id + " hd up finish");
                        }
                        if(finishFileCount>=downFileCount){
                            saveSyncData(contentData,function(err,data){
                                return callback();
                            })
                        }
                    })
                }
            })
        }
        if (sd_url &&sd_url.length > 0) {
            var localSdVideoName = 'sd_' + contentData._id + path.extname(sd_url);
            downloadImg(sd_url, localSdVideoName, function (err) {
                if (err) {
                    contentData.isQiniu = 2;
                    finishFileCount++;
                    if(finishFileCount>=downFileCount){
                        saveSyncData(contentData,function(err,data){
                            return callback();
                        })
                    }
                } else {
                    console.log(contentData._id + " sd down finish");
                    qiniu.upFileToQiNiu(1, localSdVideoName, './temp/' + localSdVideoName, function (err, data) {
                        finishFileCount++;
                        if (err) {
                            contentData.isQiniu = 2;
                        } else {
                            contentData.isQiniu = (contentData.isQiniu==2)?2:1;
                            contentData.sd_url=qiNiuVideoUrl+localSdVideoName;
                            console.log(contentData._id + " sd up finish");
                        }
                        if(finishFileCount>=downFileCount){
                            saveSyncData(contentData,function(err,data){
                                return callback();
                            })
                        }
                    })
                }
            })
        }

    })
};

var syncImgAndVedio=function(){
    var filecount=1000;
    var currentcount=0;
    async.whilst(
        function(){return currentcount<filecount;
        },
        function(cb){
            console.log("同步第几条数据："+currentcount);
            searchConent(function(){
                currentcount++;
                cb()
            })
        },
        function(err) {
            if (err) {

                console.log('同步出错'+ err);
            }
            console.log('同步完成，数量：'+filecount);
        })
}

syncImgAndVedio();
