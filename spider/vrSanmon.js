/**
 * Created by v-lyf on 2016/6/22.
 */
// 获取三目vr 网站上面的内容
var  superAgent =require('superagent');
var async=require("async");
var  config=require('./spiderConfig').vrSanMonConfig;
var vrlisttUrl='http://samworld.samonkey.com/v2_0/media/categoryContent/';
var vrDataDetial='http://samworld.samonkey.com/v2_0/media/detail/280?';
var contentModel=require("../models/Content");
var categoryModel=require('../models/ContentCategory');
var Dbopt=require('../models/Dbopt');
var baseFun=require('./baseFun');
var totalcount=0;
var synccount=0;

var VrSanMonData = function(){

};

var   httpReqirest=function(url,senddata,callback){
    superAgent
        .get(url)
        .set("userId","378CFA7EE67BA032AA79778735BCF395")
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .query(senddata)
        .end(function(err,res){
            //console.log(res.text);
            if(res) {
                var jsonData = JSON.parse(res.text);
                return callback(err, jsonData);
            }else{
                return callback(err, null);
            }
            //console.log(jsonData[0]);
        })
};

var saveVrData=function(hotCastData,cotegory,callback){
    totalcount++;
    Dbopt.findOneObj(contentModel,{'source':'sanmon','foreignKeyId':hotCastData.mediaId},function(err,data){
        if (data)
        {
            callback();
        }
        else {
            var temdata={
                title:  hotCastData.mediaName,
                stitle : hotCastData.mediaName,
                category : cotegory._id, //文章类别
                sortPath : cotegory.sortPath, //存储所有父节点结构
                tags : cotegory.name+","+hotCastData.categoryType, // 标签
                keywords : "",
                sImg : hotCastData.storagePath, // 文章小图
                discription : hotCastData.mediaDesc,
                date: new Date(),
                updateDate: new Date(), // 更新时间
                author : "HkIiCzVQ", // 文档作者
                state : true,  // 是否在前台显示，默认显示
                isTop : 0,  // 是否推荐，默认不推荐 0为不推荐，1为推荐
                clickNum : hotCastData.viewCount,
                comments :hotCastData.mediaDesc,
                commentNum : 0, // 评论数
                likeNum : hotCastData.likeCount, // 喜欢数
                from : 2, // 来源 1为原创 2为转载
                source:"sanmon", // 来源网站  hotcast  utovr 720yun vrtimes sanmon
                foreignKeyId:hotCastData.mediaId , // 网站唯一 id
                //uhd_url:hotCastData[dataCount].uhd_url, // 超高清
                hd_url:hotCastData.memoryPath, //高清
                //sd_url:hotCastData.mobile_track, //标清
                videoTime:hotCastData.duration,
                videoScore:hotCastData.mediaScore,
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
            console.log('开始同步第'+pagecount+' VrSanMonData ' );
            saveVrData(vrdatalist[pagecount],cotegory,function(err,data){
                pagecount++;
                cb();
            })
        },
        function(err) {
            if(err){
                console.log('同步出错第'+pagecount+'条form：VrSanMonData ', err);
            }
            console.log("单一元素同步完成");
            return callback(err);

        }
    )
};
VrSanMonData.prototype={
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
                            //1/15/4?categoryId=27&order=1
                            var pagelsit=[];
                            for(var i=0;i<21;i++){
                                pagelsit.push(i);
                            }
                            async.eachSeries(pagelsit, function(item, callback) {
                                var searchdata=item+"/15/"+config[itemcount].classifyId+"?categoryId="+
                                    config[itemcount].hotCastId+"&order=1";
                                console.log(vrlisttUrl+searchdata);
                                httpReqirest(vrlisttUrl+searchdata, "", function (err, vrdata) {
                                    //console.log(vrdata.content.list);
                                    if (vrdata !== undefined && vrdata.content.list.length > 0) {
                                        // console.log(vrdata);
                                        getVrDetialData(vrdata.content.list, n, function (err) {
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
                            console.log(" 同步VrTimesData出错：" + config[itemcount].name);
                            itemcount = config.length;
                        }
                        itemcount++;
                        cb(err);
                    });

                },
                function (err) {
                    if (err) {
                        console.log('出错同步VrSanMonData： ', err);
                    }else {
                        console.log("完成同步VrSanMonData");
                        baseFun.updateVrData("sanmon", totalcount, synccount, function (err, data) {
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


module.exports=VrSanMonData;
//var hotcast=new VrSanMonData();
//hotcast.getVideoItem(function(err,data){
//
//});


//{ mediaId: 377,
//    storagePath: 'http://img.samonkey.com/server/media/2D/221x137/media377.png',
//    duration: '3:59',
//    likeCount: 4,
//    mediaScore: 5,
//    memoryPath: 'http://demand.samonkey.com/media/2D/1080P/media377.mp4',
//    categoryType: '热舞',
//    reviewCount: 0,
//    mediaName: 'SISTAR- I Like That',
//    mediaDesc: '韩国性感女团',
//    mediaType: 3,
//    viewCount: 69 }

//"code":1,
//    "content":{
//    "mediaId":377,
//        "praiseCount":1,
//        "keywordList":[
//        "SISTAR",
//        "2D"
//    ],
//        "likeCount":4,
//        "downCount":119,
//        "mediaName":"SISTAR- I Like That",
//        "like":1,
//        "videoSize":"77982368",
//        "mediaType":3,
//        "storagePath":"http://img.samonkey.com/server/media/2D/750x518/media377.png",
//        "mediaIntroduction":"《I Like That》Sistar 夏日性感回归，迷你4辑《没我爱》主打歌《I Like That》完整版MV公开，别致迷幻的中国风舞曲展现SISTAR全新的音乐面貌，讲述陷入坏男人魅力中的女人的心境。",
//        "duration":"3:59",
//        "mediaScore":5,
//        "memoryPath":"http://demand.samonkey.com/media/2D/1080P/media377.mp4",
//        "reviewCount":3,
//        "viewCount":69,
//        "collect":1
//},
//"message":""