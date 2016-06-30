/**
 * Created by v-yaf_000 on 2016/5/30.
 */

var  superAgent =require('superagent');
var async=require("async");
var  config=require('./spiderConfig').hotCastConfig;
var HohCastUrl='http://api2.hotcast.cn/index.php?r=webapi/web/get-list';
var contentModel=require("../models/Content");
var categoryModel=require('../models/ContentCategory');
var Dbopt=require('../models/Dbopt');
var baseFun=require('./baseFun');
var totalcount=0;
var synccount=0;

var HotCastData = function(){

};

var   httpReqirest=function(channel_id,page,callback){
    superAgent
        .post(HohCastUrl)
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .send({'token':"123",'channel_id':channel_id,'page':page})
        .end(function(err,res){
            var  jsonData=JSON.parse(res.text);
            return callback(err,jsonData);
            //console.log(jsonData[0]);
        })
};
var saveVrData=function(hotCastData,cotegory,callback){
    var dataCount=0;
    async.whilst(
        function(){return dataCount<hotCastData.length;
        },
        function(cb){
            totalcount++;
            Dbopt.findOneObj(contentModel,{'source':'hotcast','foreignKeyId':hotCastData[dataCount].vid},function(err,data){
                if (data)
                {
                    dataCount++;
                    cb(err);
                }
                else {
                    var temdata={
                        title:  hotCastData[dataCount].vname,
                        stitle : hotCastData[dataCount].vname,

                        category : cotegory._id, //文章类别
                        sortPath : cotegory.sortPath, //存储所有父节点结构
                        tags : cotegory.name, // 标签
                        keywords : "",
                        sImg : hotCastData[dataCount].post_url, // 文章小图
                        discription : hotCastData[dataCount].vname,
                        date: new Date(),
                        updateDate: new Date(), // 更新时间
                        author : "HkIiCzVQ", // 文档作者
                        state : true,  // 是否在前台显示，默认显示
                        isTop : 0,  // 是否推荐，默认不推荐 0为不推荐，1为推荐
                        clickNum : hotCastData[dataCount].show_times,
                        comments : "",
                        commentNum : 0, // 评论数
                        likeNum : hotCastData[dataCount].numbers, // 喜欢数
                        from : 2, // 来源 1为原创 2为转载
                        source:"hotcast", // 来源网站  hotcast  utovr
                        foreignKeyId:hotCastData[dataCount].vid , // 网站唯一 id
                        uhd_url:hotCastData[dataCount].uhd_url, // 超高清
                        hd_url:hotCastData[dataCount].hd_url, //高清
                        sd_url:hotCastData[dataCount].sd_url, //标清
                        syncDate: new Date(),
                    };
                    Dbopt.addOneObj(contentModel,temdata,function(err){
                        synccount++;
                        console.log("同步一条数据");
                        dataCount++;
                        cb(err);
                    })
                }
            })

        },
        function(err) {
            if (err) {
                dataCount=hotCastData.length;
                console.log('保存出错form：hotcast ', err);
            }
            console.log("一页数据保存完成");
            return callback(err);
        })

}
var getAllPageData=function(channel_id,total_page,cotegory,callback){
    var pagecount=1;
    console.log(total_page);
    async.whilst(
        function() { return pagecount < (total_page+1) },
        function(cb){
            console.log('开始同步第'+pagecount+'页数据hotcast ' );
            httpReqirest(channel_id,pagecount.toString(),function(err,vrdata){
                pagecount++;
                //console.log(vrdata.length);
                if (vrdata!==undefined ){
                    //console.log(vrdata.length);
                    saveVrData(vrdata,cotegory,function(err,data){

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
                console.log('同步出错第'+pagecount+'页form：hotcast ', err);
            }
            console.log("单一元素同步完成");
            return callback(err);

    }
    )
};

HotCastData.prototype={
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
                    console.log(" 开始同步hotcast：" + config[itemcount].name);

                    async.waterfall([
                        function (waterCb) {
                            Dbopt.findOneObj(categoryModel,{_id: config[itemcount].categoryId}, function (err, data) {
                                //console.log(data)
                               waterCb(err, data);
                            })

                        },
                        function (n, waterCb) {
                            // 获取第一页数据
                            httpReqirest(config[itemcount].hotCastId, "1", function (err, vrdata) {
                                //console.log(vrdata.length);
                                if (vrdata !== undefined && vrdata.length > 0) {
                                    var total_page = vrdata[0].total_page || 30;
                                    getAllPageData(config[itemcount].hotCastId, total_page, n, function (err) {
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
                            console.log(" 同步hotcast出错：" + config[itemcount].name);
                            itemcount = config.length;
                        }
                        itemcount++;
                        cb(err);
                    });

                },
                function (err) {
                    if (err) {
                        console.log('出错同步hotcast： ', err);
                    }
                    else {
                        console.log("完成同步hotcast");
                        baseFun.updateVrData("hotcast", totalcount, synccount, function (err, data) {
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

module.exports=HotCastData;
//var hotcast=new HotCastData();
//hotcast.getVideoItem(function(err,data){
//
//});


//Dbopt.findOneObj(categoryModel,{_id: config[0].categoryId.toString()},function(err,data){
//    console.log(data);
//    console.log(err);
//});


// 数据格式

//{ vid: '57636c354e81d',
//    uhd_url: '',
//    hd_url: 'http://cdn.hotcast.cn/import%2F20160616%2Fhd%2Fbjnmnstxx20160617.mp4',
//    sd_url: 'http://cdn.hotcast.cn/import%2F20160616%2Fsd%2Fbjnmnstxx20160617.mp4',
//    web_url: '',
//    mp3_url: 'http://cdn.hotcast.cn/import%2F20160616%2Fmp3%2Fbjnmnstxx20160617.mp3',
//    vname: '比基尼美女沙滩嬉戏',
//    category: '20160616',
//    show_times: 772,
//    created_at: 1466135107,
//    numbers: 1247,
//    price: '0',
//    type: 'vr',
//    post_url: 'http://cdn.hotcast.cn/image%2F20160617%2F576379aa54a5e%2F750_458_%E6%AF%94%E5%9F%BA%E5%B0%BC%E7%BE%8E%E5%A5%B3%E6%B2%99%E6%BB%A9%E5%AC%89%E6%88%8F.jpg',
//    total_page: 17 }

