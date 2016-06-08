/**
 * Created by v-yaf_000 on 2016/6/8.
 */
var  superAgent =require('superAgent');
var async=require("async");
var  config=require('./spiderConfig').hotCastConfig;
var HohCastUrl='http://api2.hotcast.cn/index.php?r=webapi/web/get-list';
var contentModel=require("../models/Content");
var categoryModel=require('../models/ContentCategory');
var Dbopt=require('../models/Dbopt');

// 同步vrshow 视频源视频