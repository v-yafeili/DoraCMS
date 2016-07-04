/**
 * Created by v-lyf on 2016/6/21.
 */
// 抓取 720yun 视频
var  superAgent =require('superagent');
var async=require("async");
var  config=require('./spiderConfig').vr720YunConfig;
var vrlisttUrl='http://api.720yun.com/api/video/list/1?is_selected=1';
var vrDataDetial='http://vrkanpian.vgeili.cn/Apiv1_Video/detail?';
var contentModel=require("../models/Content");
var categoryModel=require('../models/ContentCategory');
var Dbopt=require('../models/Dbopt');
var baseFun=require('./baseFun');
var totalcount=0;
var synccount=0;


var   httpReqirest=function(url,senddata,callback){
    superAgent
        .get(url)
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .end(function(err,res){
            //console.log(res);
            var jsdata=res.text;
            var  jsonData=JSON.parse(jsdata.toString());
            return callback(err,jsonData);

        })
};
var saveVrData=function(hotCastData,cotegory,callback){
    //console.log(hotCastData);
    totalcount++;
    Dbopt.findOneObj(contentModel,{'source':'720yun','foreignKeyId':hotCastData.id},function(err,data){
        if (data)
        {
            callback();
        }
        else {
            var temdata={
                title:  hotCastData.name,
                stitle : hotCastData.name,
                category : cotegory._id, //文章类别
                sortPath : cotegory.sortPath, //存储所有父节点结构
                tags : cotegory.name, // 标签
                keywords : "",
                sImg : hotCastData.pc_thumb, // 文章小图
                discription : hotCastData.desc,
                date: new Date(),
                updateDate: new Date(), // 更新时间
                author : "HkIiCzVQ", // 文档作者
                state : true,  // 是否在前台显示，默认显示
                isTop : 0,  // 是否推荐，默认不推荐 0为不推荐，1为推荐
                clickNum : hotCastData.pv,
                comments :hotCastData.desc,
                commentNum : 0, // 评论数
                likeNum : 0, // 喜欢数
                from : 2, // 来源 1为原创 2为转载
                source:"720yun", // 来源网站  hotcast  utovr 720yun
                foreignKeyId:hotCastData.id , // 网站唯一 id
                //uhd_url:hotCastData[dataCount].uhd_url, // 超高清
                hd_url:hotCastData.pc_track, //高清
                sd_url:hotCastData.mobile_track, //标清
                videoTime:"",
                syncDate: new Date(),
            };
            Dbopt.addOneObj(contentModel,temdata,function(err){
                synccount++;
                console.log("同步一条数据");
                callback(err);
            })
        }
    })

};
var getVrDetialData=function(vrdatalist,cotegory,callback){
    var pagecount=0;
    console.log(vrdatalist.length);
    async.whilst(
        function() { return pagecount < vrdatalist.length },
        function(cb){
            console.log('开始同步第'+pagecount+'Vr720YunData ' );
            saveVrData(vrdatalist[pagecount],cotegory,function(err,data){
                pagecount++;
                cb();
            })
        },
        function(err) {
            if(err){
                console.log('同步出错第'+pagecount+'条form：Vr720YunData ', err);
            }
            console.log("单一元素同步完成");
            return callback(err);

        }
    )
};
var Vr720YunData = function(){

};

Vr720YunData.prototype={
    // 获取分类
    getCategories:function(){

    },
    getVideoItem:function(callback){
        try {
            totalcount = 0;
            synccount = 0 ;
            var itemcount = 0;
            async.whilst(
                function () {
                    return itemcount < config.length
                },
                function (cb) {
                    console.log(" 开始同步720YunData：" + config[itemcount].name);

                    async.waterfall([
                        function (waterCb) {
                            Dbopt.findOneObj(categoryModel,{_id: config[itemcount].categoryId}, function (err, data) {
                                //console.log(data)
                                waterCb(err, data);
                            })

                        },
                        function (n, waterCb) {
                            // 获取第一页数据
                            //opt=down&id=0&cate_id=2&size=12
                            var pagelsit=[];
                            for(var i=0;i<21;i++){
                                pagelsit.push(i);
                            }
                            async.eachSeries(pagelsit, function(item, callback) {
                                var searchdata='';
                                var url='http://api.720yun.com/api/video/list/'+item+'?is_selected=1';
                                httpReqirest(url, searchdata, function (err, vrdata) {

                                    if (vrdata !== undefined && vrdata.length > 0) {
                                        console.log(vrdata.length);
                                        getVrDetialData(vrdata, n, function (err) {
                                            callback(err);
                                        })

                                    }
                                    else {
                                        callback(err);
                                    }
                                });
                            },function(err) {
                                waterCb(err);
                            })

                        }
                    ], function (err, result) {
                        if (err) {
                            console.log(" 同步Vr720YunData出错：" + config[itemcount].name);
                            itemcount = config.length;
                        }
                        itemcount++;
                        cb(err);
                    });

                },
                function (err) {
                    if (err) {
                        console.log('出错同步Vr720YunData： ', err);
                    }
                    else {
                        console.log("完成同步Vr720YunData");
                        baseFun.updateVrData("720yun", totalcount, synccount, function (err, data) {
                            return callback();
                        })
                    }


                }
            );
        }
        catch (ex){
            console.log(ex)
        }


    },
};

module.exports=Vr720YunData;


//==========================我还是测试了====================
//var hotcast=new Vr720YunData();
//hotcast.getVideoItem(function(err,data){
//
//});


//{ id: '258',
//    vid: 'a1a3bef1e5q',
//    name: '"身置幻境 触摸未来"·福莱航拍VR视频震撼来袭！',
//    desc: '',
//    pc_thumb: 'http://thumb-qiniu.720static.com/@/video/36a24wf8unn/c7fd483a9f0de820ffda31b7f998e779',
//    mobile_thumb: 'http://thumb-qiniu.720static.com/@/video/36a24wf8unn/c7fd483a9f0de820ffda31b7f998e779',
//    pc_track: 'http://video-player.720yun.com/@/36a24wf8unn/pc_1461746504.mp4?wsiphost=local',
//    mobile_track: 'http://video-player.720yun.com/@/36a24wf8unn/mobile_1461746504.mp4?wsiphost=local',
//    member_uid: '36a24wf8unn',
//    member_id: '104998',
//    member_nickname: '福莱航空科技',
//    member_avatar: 'http://avatar-qiniu.720static.com/@/avatar/36a24wf8unn/o_19k1fgj6a6k81rk71s171iog15bc7.png',
//    member_wx_avatar: '',
//    pv: '1738',
//    like: '22',
//    process: '1',
//    status: '1',
//    is_selected: '1',
//    create_date: '1461242139',
//    update_date: '1465785689',
//    agreement: '720yun协议',
//    agreement_id: '1',
//    password: '0',
//    static_version: '0',
//    keywords: '',
//    fov: '90',
//    view: '0',
//    thumb_key: '/video/36a24wf8unn/c7fd483a9f0de820ffda31b7f998e779' }