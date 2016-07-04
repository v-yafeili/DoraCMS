/**
 * Created by v-lyf on 2016/6/20.
 */

// 获取Vr800 app上面的数据
//http://vr800.com/wp-content/themes/Git-master/timthumb.php?src=ht
// tp://vr800.com/wp-content/uploads/2016/04/2016042003393297.jpg&h=250&w=375&q=90&zc=1&ct=1


var  superAgent =require('superagent');
var crypto=require('crypto');
var async=require("async");
var  config=require('./spiderConfig').vr800Config;
var vrlisttUrl='http://api.vr800.com/vr/video/list?';
var vrDataDetial='http://api.vr800.com/vr/video/get?';
var playUrl="http://api.vr800.com/vr/video/play?"
var contentModel=require("../models/Content");
var categoryModel=require('../models/ContentCategory');
var Dbopt=require('../models/Dbopt');
var baseFun=require('./baseFun');
var totalcount=0;
var synccount=0;

var Vr800 = function(){

};

var   httpReqirest=function(url,senddata,base64sign,callback){
    superAgent
        .get(url)
        .set("access_key","doubo_user_key")
        .set("channel","360")
        .set("devType","Android")
        .set("version","1.0")
        .set("signature",base64sign)
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .query(senddata)
        .end(function(err,res){
            if(res) {
                var jsonData = JSON.parse(res.text);
                return callback(err, jsonData);
            }else{
                return callback(err);
            }
            //console.log(jsonData[0]);
        })
};

var saveVrData=function(hotCastData,cotegory,callback){
    totalcount++;
    Dbopt.findOneObj(contentModel,{'source':'vr800','foreignKeyId':hotCastData.id},function(err,data){
        if (data)
        {
            callback();
        }
        else {
            var temdata={
                title:  hotCastData.title,
                stitle : hotCastData.title,
                category : cotegory._id, //文章类别
                sortPath : cotegory.sortPath, //存储所有父节点结构
                tags : cotegory.name+","+hotCastData.channelName, // 标签
                keywords : "",
                sImg : hotCastData.img, // 文章小图
                discription : hotCastData.desc,
                date: new Date(),
                updateDate: new Date(), // 更新时间
                author : "HkIiCzVQ", // 文档作者
                state : true,  // 是否在前台显示，默认显示
                isTop : 0,  // 是否推荐，默认不推荐 0为不推荐，1为推荐
                clickNum : hotCastData.playCount,
                comments :hotCastData.desc,
                commentNum : 0, // 评论数
                likeNum : 0, // 喜欢数
                from : 2, // 来源 1为原创 2为转载
                source:"vr800", // 来源网站  hotcast  utovr 720yun vrtimes sanmon vr800
                foreignKeyId:hotCastData.id , // 网站唯一 id
                //uhd_url:hotCastData[dataCount].uhd_url, // 超高清
                hd_url:hotCastData.downUrl, //高清
                //sd_url:hotCastData.mobile_track, //标清
                videoTime:hotCastData.playTime,
                //videoScore:hotCastData.mediaScore,
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
            console.log('开始同步第'+pagecount+' 条Vr800 ' );
            //id=1363
            var sendata="id="+vrdatalist[pagecount].id;
            var sign=getSign(sendata);
            httpReqirest(vrDataDetial+sendata, "",sign, function (err, vrdata) {
                if(err){
                    cb(err);
                }
                    var filedata=vrdata.data;
                    httpReqirest(playUrl+sendata, "",sign, function (err, vrdata) {
                        filedata.downUrl=vrdata.data.downUrl;
                        saveVrData(filedata,cotegory,function(err,data){
                            pagecount++;
                            cb();
                        })
                    })

            });

        },
        function(err) {
            if(err){
                console.log('同步出错第'+pagecount+'条form：Vr800 ', err);
            }
            console.log("单一元素同步完成");
            return callback(err);

        }
    )
};

Vr800.prototype={
    // 获取分类
    getCategories:function(){

    },
    getVideoItem:function(callback){
        try {
            totalcount=0;
            synccount=0;
            var itemcount = 0;
            async.whilst(
                function () {
                    return itemcount < config.length
                },
                function (cb) {
                    console.log(" 开始同步VrSanMonData：" + config[itemcount].name);

                    async.waterfall([
                        function (waterCb) {
                            Dbopt.findOneObj(categoryModel,{_id: config[itemcount].categoryId}, function (err, data) {
                                //console.log(data)
                                waterCb(err, data);
                            })

                        },
                        function (n, waterCb) {
                            // 获取第一页数据
                            var pagelsit=[];
                            for(var i=0;i<21;i++){
                                pagelsit.push(i);
                            }
                            //var pagelsit=[0,1,2,3,4,5,6,7,8,9,10,];
                            async.eachSeries(pagelsit, function(item, callback) {
                                //channelId=2&page=20
                                var searchdata="channelId="+ config[itemcount].hotCastId+"&page="+item;
                                var sign=getSign("channelId="+ config[itemcount].hotCastId+"page="+item)
                                console.log(vrlisttUrl+searchdata);
                                httpReqirest(vrlisttUrl+searchdata, "",sign, function (err, vrdata) {
                                    //console.log(vrdata.data.videoList);
                                    if (vrdata !== undefined && vrdata.data.videoList.length > 0) {
                                        // console.log(vrdata);
                                        getVrDetialData(vrdata.data.videoList, n, function (err) {
                                            callback(err);
                                        })

                                    }
                                    else {
                                        callback(err);
                                    }
                                });
                            }, function(err) {
                                waterCb(err);
                            });

                        }
                    ], function (err, result) {
                        if (err) {
                            console.log(" 同步Vr800出错：" + config[itemcount].name);
                            itemcount = config.length;
                        }
                        itemcount++;
                        cb(err);
                    });

                },
                function (err) {
                    if (err) {
                        console.log('出错同步Vr800： ', err);
                    }
                    else {
                        console.log("完成同步Vr800");
                        baseFun.updateVrData("vr800", totalcount, synccount, function (err, data) {
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

module.exports=Vr800;
//var hotcast=new Vr800();
//hotcast.getVideoItem(function(err,data){
//
//});
//var args="id=1341";
//var app_secret='doubo_user_secret';
//var sign=crypto.createHmac('sha1', app_secret).update(args).digest('hex').toString('base64');
//var base64sign=new Buffer(sign).toString("base64");
//httpReqirest(vrlisttUrl,"",base64sign,function(err,data){
//    console.log(data);
//})
var getSign=function(args){
    var app_secret='doubo_user_secret';
    var sign=crypto.createHmac('sha1', app_secret).update(args).digest('hex').toString('base64');
    return new Buffer(sign).toString("base64");
}
//var args="channelId=2page=20";
//var app_secret='doubo_user_secret';
//var sign=crypto.createHmac('sha1', app_secret).update(args).digest('hex').toString('base64');
//console.log(new Buffer(sign).toString("base64"));
//var base64sign=new Buffer(sign).toString("base64");
//httpReqirest('http://api.vr800.com/vr/video/list?channelId=2&page=20',"",base64sign,function(err,data){
//    console.log(data);
//})
//
//{ id: 1120,
//    title: '美女泳装走秀',
//    poster: 'http://7xs0qt.media1.z0.glb.clouddn.com/video/1464861763508.png',
//    note: '',
//    img: 'http://7xs0qt.media1.z0.glb.clouddn.com/video/1464861763508.png' }


//{ area: 0,
//    img: 'http://7xs0qt.media1.z0.glb.clouddn.com/video/1466481349191.jpg',
//    fullView: 0,
//    praised: false,
//    year: 0,
//    praiseCount: 1,
//    collected: 0,
//    source: '买哦莫',
//    title: '清纯女优房间写真秀',
//    actor: '',
//    playCount: 496,
//    channelName: '美女',
//    playTime: '03:00',
//    id: 1363,
//    channelId: 10,
//    desc: '甜美可人又性感的日式女优' } }

//{ status: 'success',
//    code: 0,
//    data:
//    { img: 'http://7xs0qt.media1.z0.glb.clouddn.com/video/1466481349191.jpg',
//        fullView: 0,
//        downUrl: 'http://vod.vr800.com/wmy/shafa.mp4',
//        collected: 0,
//        id: 1363,
//        title: '清纯女优房间写真秀',
//        playUrl: 'http://vod.vr800.com/wmy/shafa.mp4' } }