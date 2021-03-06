/**
 * Created by liyafei on 2016/6/14.
 */
// 抓取vr 看片网资源

var  superAgent =require('superagent');
var async=require("async");
var  config=require('./spiderConfig').vrSeeFileConfig;
var vrlisttUrl='http://vrkanpian.vgeili.cn/Apiv1_Video/list?';
var vrDataDetial='http://vrkanpian.vgeili.cn/Apiv1_Video/detail?';
var contentModel=require("../models/Content");
var categoryModel=require('../models/ContentCategory');
var Dbopt=require('../models/Dbopt');
var baseFun=require('./baseFun');
var totalcount=0;
var synccount=0;
var VrSeeFileData = function(){

};

var   httpReqirest=function(url,senddata,callback){
    superAgent
        .get(url)
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .query(senddata)
        .end(function(err,res){
            //console.log(res.text);
            var  jsonData=JSON.parse(res.text);
            return callback(err,jsonData);
            //console.log(jsonData[0]);
        })
};

//httpReqirest("","",function(err,data){});
var saveVrData=function(hotCastData,cotegory,callback){
    //console.log(hotCastData);
    totalcount++;
    Dbopt.findOneObj(contentModel,{'source':'vrseefile','foreignKeyId':hotCastData.id},function(err,data){
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
                        tags : cotegory.name, // 标签
                        keywords : "",
                        sImg : hotCastData.head_img, // 文章小图
                        discription : hotCastData.content,
                        date: new Date(),
                        updateDate: new Date(), // 更新时间
                        author : "HkIiCzVQ", // 文档作者
                        state : true,  // 是否在前台显示，默认显示
                        isTop : 0,  // 是否推荐，默认不推荐 0为不推荐，1为推荐
                        clickNum : hotCastData.viewtotal,
                        comments : hotCastData.content,
                        commentNum : 0, // 评论数
                        likeNum : 0, // 喜欢数
                        from : 2, // 来源 1为原创 2为转载
                        source:"vrseefile", // 来源网站  hotcast  utovr
                        foreignKeyId:hotCastData.id , // 网站唯一 id
                        //uhd_url:hotCastData[dataCount].uhd_url, // 超高清
                        hd_url:hotCastData.downurl, //高清
                        //sd_url:hotCastData[dataCount].sd_url, //标清
                        videoTime:hotCastData.playtime,
                        syncDate: new Date(),
                    };
                    Dbopt.addOneObj(contentModel,temdata,function(err){
                        synccount++
                        console.log("同步一条数据");
                        callback(err);
                    })
                }
            })

}
var getVrDetialData=function(vrdatalist,cotegory,callback){
    var pagecount=0;
    console.log(vrdatalist.length);
    async.whilst(
        function() { return pagecount < vrdatalist.length },
        function(cb){
            console.log('开始同步第'+pagecount+'条数据vrseefile ' );
            var senddata={id:vrdatalist[pagecount].id}
            httpReqirest(vrDataDetial,senddata,function(err,vrdata){
                pagecount++;
                //console.log(vrdata.length);
                if (vrdata!==undefined&&vrdata.data!==undefined ){
                    //console.log(vrdata.data);
                    saveVrData(vrdata.data,cotegory,function(err,data){

                        cb(err);
                    })

                }
                else {
                    pagecount=total_page+1;
                    cb(err);
                }
            });
        },
        function(err) {
            if(err){
                console.log('同步出错第'+pagecount+'条form：vrseefile ', err);
            }
            console.log("单一元素同步完成");
            return callback(err);

        }
    )
};
VrSeeFileData.prototype={
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
                    console.log(" 开始同步VrSeeFileData：" + config[itemcount].name);

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
                            var searchdata={opt:'down',id:0,cate_id:config[itemcount].hotCastId,size:1000}
                            httpReqirest(vrlisttUrl, searchdata, function (err, vrdata) {
                                //console.log(vrdata.length);
                                if (vrdata !== undefined && vrdata.data.length > 0) {
                                   // console.log(vrdata);
                                    getVrDetialData(vrdata.data, n, function (err) {
                                        waterCb(err);
                                    })

                                }
                                else {
                                    waterCb(err);
                                }
                            });
                        }
                    ], function (err, result) {
                        if (err) {
                            console.log(" 同步VrSeeFileData出错：" + config[itemcount].name);
                            itemcount = config.length;
                        }
                        itemcount++;
                        cb(err);
                    });

                },
                function (err) {
                    if (err) {
                        console.log('出错同步VrSeeFileData： ', err);
                    }
                    else {
                        console.log("完成同步VrSeeFileData");
                        baseFun.updateVrData("vrseefile", totalcount, synccount, function (err, data) {
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
}

module.exports=VrSeeFileData;
//var hotcast=new VrSeeFileData();
//hotcast.getVideoItem(function(err,data){
//
//});

//{ id: '190',
//    head_img: 'http://7xs0qt.media1.z0.glb.clouddn.com/video/1462781099371.jpg',
//    view: '4',
//    content: '在美国胡德河上挑战一次风筝冲浪是来这里旅游观光最推荐的极限运动之一，一只硕大的风筝在空中翱翔，你站在胡德河上的冲浪板上手握风筝线，冲浪板在河面上飞速滑行，激起浪花，时不时还会有另一位挑战者在你身边呼啸而过。你看到的是蓝天白云以及身边胶片般美好的一帧帧画面，别人看到的，是你在胡德河上潇洒扬帆的身影。',
//    viewtotal: '4',
//    title: '胡德河的潇洒扬帆',
//    created: '1463672224',
//    playtime: '05:36',
//    downurl: 'http://static.cdn.doubo.tv/utovr/201602261041264462.mp4' }