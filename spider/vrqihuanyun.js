/**
 * Created by v-lyf on 2016/7/1.
 */
// 从奇幻云 app 中抓取数据源
var  superAgent =require('superagent');
var async=require("async");
var vrlisttUrl='http://api.qihuanyun.com/v2/getclassifycontents?classifyid=2&' +
    'appToken=6558E6B7CB1741BDC79A93FB1C9B629D0A7675FB6153DCEA29783976ECB42C6A9F2F3C162FC0C7D3371A6CE8475820EC&';
var vrDataDetial='http://api.qihuanyun.com/v2/theme-contentDetail?' +
    'appToken=6558E6B7CB1741BDC79A93FB1C9B629D0A7675FB6153DCEA29783976ECB42C6A9F2F3C162FC0C7D3371A6CE8475820EC&';
var contentModel=require("../models/Content");
var categoryModel=require('../models/ContentCategory');
var Dbopt=require('../models/Dbopt');
var baseFun=require('./baseFun');
var totalcount=0;
var synccount=0;

////=======这里是类目信息
var config= [
    {
        name:"运动",
        categoryId:"r1n6mNYm",
        vrname:"运动",
        hotCastId:7,
    },
    {
        name:"冒险",
        categoryId:"Bybg4NF7",
        vrname:"冒险",
        hotCastId:8,
    },
    {
        name:"娱乐",
        categoryId:"rkTKIrrN",
        vrname:"演出",
        hotCastId:9,
    },
    {
        name:"旅游",
        categoryId:"B1S0LSSV",
        vrname:"自然",
        hotCastId:10,
    },
    {
        name:"其他",
        categoryId:"rklDecGSB",
        vrname:"城市",
        hotCastId:11,
    },
    {
        name:"动漫",
        categoryId:"BkRVZcmI",
        vrname:"动漫",
        hotCastId:12,
    },
];
var saveVrData=function(hotCastData,cotegory,callback){
    totalcount++;
    Dbopt.findOneObj(contentModel,{'source':'qihuanyun','foreignKeyId':hotCastData.id},function(err,data){
        if (data)
        {
            callback();
        }
        else {
            var temdata={
                title: decodeURI( hotCastData.title),
                stitle : decodeURI( hotCastData.title),
                category : cotegory._id, //文章类别
                sortPath : cotegory.sortPath, //存储所有父节点结构
                tags : cotegory.name, // 标签
                keywords : "",
                sImg : hotCastData.imgList.length>0?hotCastData.imgList[0]:hotCastData.imgUrl, // 文章小图
                discription : decodeURI( hotCastData.summary),
                date: new Date(),
                updateDate: new Date(), // 更新时间
                author : "HkIiCzVQ", // 文档作者
                state : true,  // 是否在前台显示，默认显示
                isTop : 0,  // 是否推荐，默认不推荐 0为不推荐，1为推荐
                clickNum : hotCastData.playNum,
                comments :decodeURI( hotCastData.summary),
                commentNum : 0, // 评论数
                likeNum : 0, // 喜欢数
                from : 2, // 来源 1为原创 2为转载
                source:"qihuanyun", // 来源网站  hotcast  utovr 720yun vrtimes sanmon vr800 qihuanyun
                foreignKeyId:hotCastData.id , // 网站唯一 id
                //uhd_url:hotCastData[dataCount].uhd_url, // 超高清
                hd_url:hotCastData.url, //高清
                //sd_url:hotCastData.mobile_track, //标清
                videoTime:hotCastData.playTime,
                videoScore:hotCastData.scoreAvg,
                hd_fileSize:hotCastData.fileSize,
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
            console.log('开始同步第'+pagecount+'条数据vrQiHuanYunData ' );
            var searchdata="id="+vrdatalist[pagecount].id;
            baseFun.httpGetReq(vrDataDetial+searchdata, {},'', function (err, vrdata) {
                    pagecount++;
                    if(vrdata){
                        saveVrData(vrdata.data,cotegory,function(err,data){
                            cb();
                        })
                    }else{
                        cb();
                    }
            })

        },
        function(err) {
            if(err){
                console.log('同步出错第'+pagecount+'条form：vrQiHuanYunData ', err);
            }
            console.log("单一元素同步完成");
            return callback(err);

        }
    )
};
var vrQiHuanYunData = function(){};
vrQiHuanYunData.prototype={
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
                    console.log(" 开始同步vrQiHuanYunData：" + config[itemcount].name);

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
                            async.eachSeries(pagelsit, function(item, callback) {
                                //channelId=2&page=20
                                console.log('开始请求第页数据'+item)
                                var searchdata='key='+config[itemcount].hotCastId+'&page='+item+'&size=20';
                                console.log(vrlisttUrl+searchdata);
                                baseFun.httpGetReq(vrlisttUrl+searchdata, {},'', function (err, vrdata) {
                                    //console.log(vrdata.data.videoList);
                                    if (vrdata !== undefined && vrdata.data.length > 0) {
                                         console.log(vrdata.data.length);
                                        getVrDetialData(vrdata.data, n, function (err) {
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
                            console.log(" 同步vrQiHuanYunData出错：" + config[itemcount].name);
                            itemcount = config.length;
                        }
                        itemcount++;
                        cb(err);
                    });

                },
                function (err) {
                    if (err) {
                        console.log('出错同步vrQiHuanYunData： ', err);
                    }
                    else {
                        console.log("完成同步vrQiHuanYunData");
                        baseFun.updateVrData("qihuanyun", totalcount, synccount, function (err, data) {
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
module.exports=vrQiHuanYunData;
//========================= test =======================
//console.log(decodeURI('%E6%B6%88%E5%A4%B1%E7%9A%84%E9%BB%91%E5%A4%9C'));
//var hotcast=new vrQiHuanYunData();
//hotcast.getVideoItem(function(err,data){
//
//});
//baseFun.httpGetReq(vrDataDetial,{},"",function(err,data){
//    console.log(data);
//})
//===========================开始测试
//=============================奇幻云解析相关信息======================
//---------------------分类信息--------------------------
//{"resDomain":"gfQbjUkBB2MDtBSBPOOKNw",
//    "data":[{"id":2,"key":"7","classifyName":"运动"},
//    {"id":2,"key":"8","classifyName":"冒险"},
//    {"id":2,"key":"9","classifyName":"演出"},
//    {"id":2,"key":"10","classifyName":"自然"},
//    {"id":2,"key":"11","classifyName":"城市"},
//    {"id":2,"key":"12","classifyName":"动漫"}]
//}

//-----------------------列表信息-------------------
//{ resDomain: 'gfQbjUkBB2MDtBSBPOOKNw',
//    data:
//    [ { id: 390,
//        title: '%E6%B6%88%E5%A4%B1%E7%9A%84%E9%BB%91%E5%A4%9C',
//        summary: '%E4%B8%BA%E4%BA%86%E6%8F%90%E9%AB%98%E5%85%AC%E4%BC%97%E9%98%B2%E6%B2%BB%E5%9F%8E%E5%B8%82%E5%85%89%E6%B1%A1%E6%9F%93%E7%9A%84%E6%84%8F%E8%AF%86%EF%BC%8C%E5%B0%BC%E6%96%AF%E6%B9%96%E5%85%AC%E5%8F%B8%E4%B8%8E%E5%9B%BD%E9%99%85%E6%9A%97%E5%A4%9C%E5%8D%8F%E4%BC%9A%E8%81%94%E5%90%88%E5%88%9B%E4%BD%9C%E4%BA%86%E8%BF%99%E9%83%A8%E5%85%AC%E7%9B%8A%E7%90%83%E5%B9%95%E5%BD%B1%E7%89%87%E3%80%8A%E6%B6%88%E5%A4%B1%E7%9A%84%E9%BB%91%E5%A4%9C%E3%80%8B%E3%80%82',
//        category: 2,
//        type: 11,
//        url: 'http://res1.qihuanyun.com/videos/20151225/xiaoshideheiye_BS.mp4',
//        playCounter: 0,
//        downloadCounter: 0,
//        recommend: 0,
//        display: 0,
//        imgUrl: 'http://img.qihuanyun.com/20151225/567cc4649e8c2.png',
//        realSize: '',
//        packageName: '' }
//}]}
//-----------------------------vr详情-----------------------------
//{"resDomain":"gfQbjUkBB2MDtBSBPOOKNw",
//    "data":
//    {
//        "id":388,
//        "imgUrl":"http://img.qihuanyun.com/20151219/5675004e343e6.png",
//        "category":"2",
//        "url":"http://res1.qihuanyun.com/videos/20151218/239_3DCNM.mp4",
//        "title":"%E7%AF%AE%E7%90%83%E9%A3%9E%E4%BA%BA",
//        "uploadNum":173,
//        "playNum":409,
//        "pakname":"",
//        "fileSize":"12.8M",
//        "isCollect":0,
//        "summary":"%96%E7%95%8C%E5%B0%BD%E6%83%85%E6%AC%A3%E8%B5%8F%",
//        "type":"7",
//        "info":"",
//        "imgList":["http://img.qihuanyun.com/20151219/5675004e345cf.jpg",
//        "http://img.qihuanyun.com/20151219/5675004e3485f.jpg",
//        "http://img.qihuanyun.com/20151219/5675004e34ad3.jpg",
//        "http://img.qihuanyun.com/20151219/5675004e34d20.jpg",
//        "http://img.qihuanyun.com/20151219/5675004e34f5b.jpg"],
//        "tdList":[
//        {"id":242,"title":"%E5%B1%B1%E5%9C%B0%E8%B5%9B%E8%BD%A6",
//        "summary":"%E7%8E%B0%E5%9C%A8%E6%9C%89%E6%B1%BD%E8%BD%A6%E5%8E%82%E5%95%86%E9%80%9A%E8%BF%87%E5%AE%89%E8%A3%85%E5%9C%A8%E6%B1%BD%E8%BD%A6%E9%A1%B6%E9%83%A8%E7%9A%84%E6%91%84%E5%83%8F%E5%A4%B4%E6%9D%A5%E8%AE%B0%E5%BD%95%E6%AF%94%E8%B5%9B%EF%BC%8C%E7%84%B6%E5%90%8E%E5%88%B6%E4%BD%9C%E5%87%BA%E5%8F%AF%E4%B8%BA%E6%99%AE%E9%80%9A%E8%A7%82%E4%BC%97%E4%BD%93%E9%AA%8C%E7%9A%84%E8%99%9A%E6%8B%9F%E7%8E%B0%E5%AE%9E%E8%A7%86%E9%A2%91%E3%80%82%E6%AF%94%E5%A6%82%E8%BF%99%E9%83%A8%E8%A7%86%E9%A2%91%E5%B0%B1%E5%8F%AF%E4%BB%A5%E8%AE%A9%E8%A7%82%E4%BC%97%E4%BD%93%E9%AA%8C%E5%88%B0%E4%B8%8E%E8%B5%9B%E8%BD%A6%E6%89%8B%E7%9B%B8%E5%90%8C%E7%9A%84%E8%A7%86%E8%A7%92%EF%BC%8C%E9%9D%9E%E5%B8%B8%E5%88%BA%E6%BF%80%E3%80%82",
//        "imgUrl":"http://img.qihuanyun.com/20151109/5640710ea0953.png",
//        "url":"http://res1.qihuanyun.com/videos/20151109/95_3DCNM.mp4"}],
//        "playTime":"1:40",
//        "totalCounter":582,
//        "ScoreCount":1,
//        "scoreAvg":5.0,
//        "commentsList":[],
//        "commentsCount":0},
//    "mgRes":"qwer!@3%"}
//====================================================================