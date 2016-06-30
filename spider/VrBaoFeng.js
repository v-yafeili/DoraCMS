/**
 * Created by liyafei on 2016/6/15.
 */
// 抓取暴风魔镜资源

var  superAgent =require('superagent');
var async=require("async");
var  config=require('./spiderConfig').vrBaofengConfig;
var contentModel=require("../models/Content");
var categoryModel=require('../models/ContentCategory');
var Dbopt=require('../models/Dbopt');
var baseFun=require('./baseFun');
var totalcount=0;
var synccount=0;

var VrBaofengData = function(){

};

var   httpReqirest=function(url,senddata,callback){
    superAgent
        .get(url)
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .query(senddata)
        .end(function(err,res){
            var jsdata="";
            res.on("data",function (data){
                jsdata=jsdata+data;
            });
            res.on("end",function (){
               //console.log(jsdata.toString());
                var  jsonData=JSON.parse(jsdata.toString());
                return callback(err,jsonData);
            });
        })
};
var saveVrData=function(hotCastData,cotegory,callback){
    totalcount++;
    Dbopt.findOneObj(contentModel,{'source':'baofengvr','foreignKeyId':hotCastData.res_id},function(err,data){
        if (data)
        {
            callback();
        }
        else {
            var temdata={
                title:  hotCastData.res_title,
                stitle : hotCastData.res_subtitle,
                category : cotegory._id, //文章类别
                sortPath : cotegory.sortPath, //存储所有父节点结构
                tags : cotegory.name, // 标签
                keywords : "",
                sImg : hotCastData.res_thumb, // 文章小图
                discription : "",
                date: new Date(),
                updateDate: new Date(), // 更新时间
                author : "HkIiCzVQ", // 文档作者
                state : true,  // 是否在前台显示，默认显示
                isTop : 0,  // 是否推荐，默认不推荐 0为不推荐，1为推荐
                clickNum : hotCastData.res_download_count,
                comments :"",
                commentNum : 0, // 评论数
                likeNum : 0, // 喜欢数
                from : 2, // 来源 1为原创 2为转载
                source:"baofengvr", // 来源网站  hotcast  utovr
                foreignKeyId:hotCastData.res_id , // 网站唯一 id
                //uhd_url:hotCastData[dataCount].uhd_url, // 超高清
                hd_url:hotCastData.res_high_playurl, //高清
                sd_url:hotCastData.res_standard_playurl, //标清
                videoTime:"",
                syncDate: new Date(),
            };
            Dbopt.addOneObj(contentModel,temdata,function(err){
                synccount++;
                console.log("同步一条数据"+err);
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
            console.log('开始同步第'+pagecount+'条数据VrBaofengData ' );
            saveVrData(vrdatalist[pagecount],cotegory,function(err,data){
                pagecount++;
                cb();
            })
        },
        function(err) {
            if(err){
                console.log('同步出错第'+pagecount+'条form：VrBaofengData ', err);
            }
            console.log("单一元素同步完成");
            return callback(err);

        }
    )
};
VrBaofengData.prototype={
    // 获取分类
    getCategories:function(){

    },
    getVideoItem:function( callback){
        try {
            totalcount=0;
            synccount=0;
            var itemcount = 0;
            async.whilst(
                function () {
                    return itemcount < config.length
                },
                function (cb) {
                    console.log(" 开始同步VrBaofengData：" + config[itemcount].name);

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
                            httpReqirest(config[itemcount].url, "", function (err, vrdata) {

                                if (vrdata !== undefined && vrdata.list.length> 0) {
                                     console.log(vrdata.list.length);
                                    getVrDetialData(vrdata.list, n, function (err) {
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
                            console.log(" 同步VrBaofengData出错：" + config[itemcount].name);
                            itemcount = config.length;
                        }
                        itemcount++;
                        cb(err);
                    });

                },
                function (err) {
                    if (err) {
                        console.log('出错同步VrBaofengData： ', err);
                    }
                    else {
                        console.log("完成同步VrBaofengData");
                        baseFun.updateVrData("baofengvr", totalcount, synccount, function (err, data) {
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
module.exports=VrBaofengData;
//var hotcast=new VrBaofengData();
//hotcast.getVideoItem(function(err,data){
//
//});


//{ res_id: '200640',
//    res_title: '韩女团火辣热舞',
//    res_type: 2,
//    res_subtitle: '韩国性感小野猫！',
//    res_SD_filesize: '156MB',
//    res_HD_filesize: '276MB',
//    res_downloadSD_url: 'http://dl.mojing.baofeng.com/xianchang/150929/1443496447_SD.mp4',
//    res_downloadHD_url: 'http://dl.mojing.baofeng.com/xianchang/150929/1443496447_HD.mp4',
//    res_video_dimension: '2D',
//    res_video_duration: '0',
//    res_video_is_live: '0',
//    res_is_panorama: 1,
//    res_general_playurl: '',
//    res_standard_playurl: 'http://dl.mojing.baofeng.com/xianchang/150929/1443496447_SD.mp4',
//    res_high_playurl: 'http://dl.mojing.baofeng.com/xianchang/150929/1443496447_HD.mp4',
//    res_video_play_mode: '2',
//    res_pov_heading: '0',
//    res_subtitle_file: '',
//    res_download_count: '29319',
//    res_is_payment: '0',
//    res_payment: '0.0',
//    res_business_id: '6',
//    res_producter_id: '2',
//    res_business_name: '暴风魔镜',
//    res_thumb: 'http://img.static.mojing.cn/picture/151009/1444376284.jpg',
//    res_thumb_large: '',
//    res_creat_time: '2015-10-09 15:31:50',
//    res_new_flag: '0',
//    res_score: '4.7',
//    res_score_count: '129' }