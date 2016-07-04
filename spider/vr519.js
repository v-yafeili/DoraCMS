/**
 * Created by v-lyf on 2016/6/21.
 */
    // 抓取519vr 上面的资源
var  superAgent =require('superagent');
var cheerio = require('cheerio');
var async=require("async");
var vrlisttUrl='http://www.591vr.com/category1.html?sort=0&eid=&phid=&rid=&';
var contentModel=require("../models/Content");
var categoryModel=require('../models/ContentCategory');
var Dbopt=require('../models/Dbopt');
var baseFun=require('./baseFun');
var totalcount=0;
var synccount=0;

String.prototype.trim = function(){ return this.replace(/^\s+|\s+$/g,"")}
String.prototype.ltrim = function(){ return this.replace(/^\s+/g,"")}
String.prototype.rtrim = function(){ return this.replace(/\s+$/g,"")}

var config=[
    {
        name:"恐怖",
        categoryId:"BJu8ISrE",
        vrname:"恐怖",
        hotCastId:2,
    },
];


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
var  getVideoUrl=function(senddata,callback){
    superAgent
        .post("http://www.591vr.com/downloadApp.html")
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .send(senddata)
        .end(function(err,res){
            //console.log(res);
            var  jsonData=JSON.parse(res.text);
            return callback(err,jsonData.obj);
            //console.log(jsonData[0]);
        })
}
var parseHtml=function(htmlData,callback){
    $ = cheerio.load(htmlData);
    var vrData=[];
    $('li','ul[id="work-thumb"]').each(function(i, elem) {


        var imgdiv=$('div[class="img"] ',this);
        if($('img',imgdiv).attr("src")==undefined){
            return true;
        }
        var ID=$('div[class="work-upload"] a',this).attr("onclick");
        ID=ID.split('(')[1].split(')')[0];

            //getVideoUrl({id:ID},function(err,data){
            //
            //})

        var temp={
            vediourl:"",
            id:ID,
            picurl:$('img',imgdiv).attr("src"),
            comment:($('div[class="deatils-bd"] span',this).text()).trim(),
            title:$('div[class="deatils-title"] a',this).text(),
            size:$('div[class="work-upload"] p',this).text()
        };
        vrData.push(temp);
    });
    callback(null,vrData);
};

var vr519 = function(){};
vr519.prototype={
    // 获取分类
    getCategories:function(){

    },
    getVideoItem:function(callback){
        try {
            var lastvrid="";
            totalcount=0;
            synccount=0;
            var itemcount = 0;
            async.whilst(
                function () {
                    return itemcount < config.length
                },
                function (cb) {
                    console.log(" 开始同步vr519：" + config[itemcount].name);

                    async.waterfall([
                        function (waterCb) {
                            Dbopt.findOneObj(categoryModel,{_id: config[itemcount].categoryId}, function (err, data) {
                                waterCb(err, data);
                            })
                        },
                        function (n, waterCb) {
                            // 获取第一页数据
                            var pagelsit=[];
                            for(var i=1;i<5;i++){
                                pagelsit.push(i);
                            }
                            async.eachSeries(pagelsit, function(item, callback) {
                                //page=2&acid=2
                                console.log('开始请求第页数据'+item)
                                var searchdata='acid='+config[itemcount].hotCastId+'&page='+item;
                                console.log(vrlisttUrl+searchdata);
                               httpReqirest(vrlisttUrl+searchdata, '', function (err, vrdata) {
                                    if (vrdata  && vrdata.length > 0) {
                                        console.log(vrdata.length);
                                        //getVrDetialData(vrdata.data, n, function (err) {
                                        //    callback(err);
                                        //})
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
                            console.log(" 同步vr519出错：" + config[itemcount].name);
                            itemcount = config.length;
                        }
                        itemcount++;
                        cb(err);
                    });

                },
                function (err) {
                    if (err) {
                        console.log('出错同步vr519： ', err);
                    }
                    else {
                        console.log("完成同步vr519");
                        baseFun.updateVrData("vr519", totalcount, synccount, function (err, data) {
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



///=======================================开始测试================================
var hotcast=new vr519();
hotcast.getVideoItem(function(err,data){

});
//httpReqirest(vrlisttUrl,"",function(err,data){
//    console.log(data);
//   // parseHtml(data,function(err,vrdata){
//   //     console.log(vrdata);
//   // })
//});


//=======================================519 vr 内容解析==========================================
    //----------------------------------分类--------------------------------------------------
    //    <li ><a href="category1.html?sort=0&eid=&phid=&rid=">全部</a></li>
    //
    //    <li ><a href="category1.html?acid=2&sort=0&eid=&phid=&rid=">恐怖</a></li>
    //
    //    <li ><a href="category1.html?acid=37&sort=0&eid=&phid=&rid=">动漫</a></li>
    //
    //    <li ><a href="category1.html?acid=30&sort=0&eid=&phid=&rid=">综艺</a></li>
    //
    //    <li ><a href="category1.html?acid=23&sort=0&eid=&phid=&rid=">音乐</a></li>
    //
    //    <li ><a href="category1.html?acid=22&sort=0&eid=&phid=&rid=">新闻</a></li>
    //
    //    <li ><a href="category1.html?acid=18&sort=0&eid=&phid=&rid=">自然</a></li>
    //
    //    <li ><a href="category1.html?acid=17&sort=0&eid=&phid=&rid=">城市</a></li>
    //
    //    <li ><a href="category1.html?acid=16&sort=0&eid=&phid=&rid=">科幻</a></li>
    //
    //    <li ><a href="category1.html?acid=11&sort=0&eid=&phid=&rid=">冒险</a></li>
    //
    //    <li ><a href="category1.html?acid=8&sort=0&eid=&phid=&rid=">战争</a></li>
    //
    //    <li ><a href="category1.html?acid=7&sort=0&eid=&phid=&rid=">风景</a></li>
    //
    //    <li ><a href="category1.html?acid=6&sort=0&eid=&phid=&rid=">游戏</a></li>
    //
    //    <li ><a href="category1.html?acid=4&sort=0&eid=&phid=&rid=">运动</a></li>
    //
    //    <li ><a href="category1.html?acid=45&sort=0&eid=&phid=&rid=">音乐剧</a></li>
    //----------------------------------------------------------------------------------------
    //----------------------------------数据列表--------------------------------------------
    //    [
    //        { vediourl: '',
    //        id: '1325',
    //        picurl: 'http://resource.vr-store.cn/appicon/20160415174323S7Hv.jpg',
    //        comment: '不要在学校逗留太久，那些被留在学校的孩子的鬼魂早就不再单',
    //        title: '午夜闹鬼学校',
    //        size: '92.75M' }
    //    ]
    //--------------------------------------------------------------------------------------
//================================================================================================