/**
 * Created by v-lyf on 2016/6/21.
 */
// 抓取vr times 虚拟时代上面的vr 资源

var  superAgent =require('superagent');
var cheerio = require('cheerio');
var async=require("async");
var  config=require('./spiderConfig').vrTimes;
var vrlisttUrl='http://video.vrtimes.com/index.php?';
var downFileUrl='http://video.vrtimes.com/';
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
        .query(senddata)
        .end(function(err,res){
            //console.log(res.text);

            if(err){
                return callback(err);
            }else {
                parseHtml(res.text, function (err, vrdata) {
                   return callback(null,vrdata);
                })
            }
        })
};
var parseHtml=function(htmlData,callback){
   $ = cheerio.load(htmlData);
    var vrData=[];
    $('li','ul[class="video-ul"]').each(function(i, elem) {
      //console.log(i);
        var temp={
            vediourl:$('a  ',this).attr("href"),
            picurl:$('img[class="pic"]',this).attr("data-src"),
            times:$('em[class="time"]',this).text(),
            title:$('span[class="title"]',this).text(),
        };
        if(temp.vediourl) {
            var id = temp.vediourl.split('=');
            temp.id = id[id.length - 1];
            temp.vediourl = downFileUrl + temp.vediourl.replace('play', 'down');
            vrData.push(temp);
        }
        //console.log($('a  ',this).attr("href"));
        //console.log($('img[class="pic"]',this).attr("data-src"));
        //console.log($('em[class="time"]',this).text());
        //console.log($('span[class="title"]',this).text());
      //console.log(elem);
    });
    callback(null,vrData);
};
var saveVrData=function(hotCastData,cotegory,callback){
    totalcount++;
    Dbopt.findOneObj(contentModel,{'source':'vrtimes','foreignKeyId':hotCastData.id},function(err,data){
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
                sImg : hotCastData.picurl, // 文章小图
                discription : hotCastData.title,
                date: new Date(),
                updateDate: new Date(), // 更新时间
                author : "HkIiCzVQ", // 文档作者
                state : true,  // 是否在前台显示，默认显示
                isTop : 0,  // 是否推荐，默认不推荐 0为不推荐，1为推荐
                clickNum : 0,
                comments :hotCastData.title,
                commentNum : 0, // 评论数
                likeNum : 0, // 喜欢数
                from : 2, // 来源 1为原创 2为转载
                source:"vrtimes", // 来源网站  hotcast  utovr 720yun vrtimes
                foreignKeyId:hotCastData.id , // 网站唯一 id
                //uhd_url:hotCastData[dataCount].uhd_url, // 超高清
                hd_url:hotCastData.vediourl, //高清
                //sd_url:hotCastData.mobile_track, //标清
                videoTime:hotCastData.times,
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
            console.log('开始同步第'+pagecount+' VrTimesData ' );
            saveVrData(vrdatalist[pagecount],cotegory,function(err,data){
                pagecount++;
                cb();
            })
        },
        function(err) {
            if(err){
                console.log('同步出错第'+pagecount+'条form：VrTimesData ', err);
            }
            console.log("单一元素同步完成");
            return callback(err);

        }
    )
};

var VrTimesData = function(){

};

VrTimesData.prototype={
    // 获取分类
    getCategories:function(){

    },
    getVideoItem:function(callback){
        try {
            totalcount=0;
            synccount = 0;
            var itemcount = 0;
            async.whilst(
                function () {
                    return itemcount < config.length
                },
                function (cb) {
                    console.log(" 开始同步VrTimesData：" + config[itemcount].name);

                    async.waterfall([
                        function (waterCb) {
                            Dbopt.findOneObj(categoryModel,{_id: config[itemcount].categoryId}, function (err, data) {
                                //console.log(data)
                                waterCb(err, data);
                            })

                        },
                        function (n, waterCb) {
                            // 获取第一页数据
                            //act=list&classid=1&page=1
                            var pagelsit=[];
                            for(var i=0;i<21;i++){
                                pagelsit.push(i);
                            }
                            async.eachSeries(pagelsit, function(item, callback) {
                                var searchdata="act=list&classid="+config[itemcount].hotCastId+"&page="+item;
                                httpReqirest(vrlisttUrl+searchdata, "", function (err, vrdata) {
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
                        console.log('出错同步VrTimesData： ', err);
                    }
                    else {
                        console.log("完成同步VrTimesData");
                        baseFun.updateVrData("vrtimes", totalcount, synccount, function (err, data) {
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


module.exports=VrTimesData;
//var hotcast=new VrTimesData();
//hotcast.getVideoItem(function(err,data){
//
//});



//{ vediourl: 'http://video.vrtimes.com/index.php?act=down&ID=32',
//    picurl: 'http://www.vrtimes.com/source/20150930/print_screen/6fc49286a0a2e36c913a11ad57b5b022_1280x640.jpg',
//    times: '00:02:18',
//    title: '今年夏天',
//    id: '32' }