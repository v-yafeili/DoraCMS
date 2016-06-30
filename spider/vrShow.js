/**
 * Created by v-yaf_000 on 2016/6/8.
 */
var  superAgent =require('superagent');
var async=require("async");
var  config=require('./spiderConfig').hotCastConfig;
var HohCastUrl='http://api2.hotcast.cn/index.php?r=webapi/web/get-list';
var contentModel=require("../models/Content");
var categoryModel=require('../models/ContentCategory');
var Dbopt=require('../models/Dbopt');

// 同步vrshow 视频源视频


//{
//    "resourceId":651,
//    "resourceName":"一生一次VR",
//    "smallIntroduce":"单画面全景VR视频",
//    "longIntroduce":"标题：一生一次VR 副标题：春风十里，不及把女神搂在怀里 视频简介：让我们结婚去厦门度蜜月吧，与你携手漫步在细柔的沙滩，并肩走过的大街小巷，看日出日落，感谢你出现在我的生命中，这一生，仅一次，与你偕老，可好？",
//    "coverImgUrl":"http://xnxs.img.vrshow.com/2016/5/31/18016/封面.jpg",
//    "resourcesScore":5,
//    "cumulativeNum":13335,
//    "createTime":"2016-06-01 00:20:53",
//    "fileSize":"1.1 gb",
//    "resourcesPackageName":null
//}