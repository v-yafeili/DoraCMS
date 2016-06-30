/**
 * Created by v-lyf on 2016/6/21.
 */
    // 抓取519vr 上面的资源
var  superAgent =require('superagent');
var cheerio = require('cheerio');
var async=require("async");
var  config=require('./spiderConfig').vrTimes;
var vrlisttUrl='http://www.591vr.com/category1.html?acid=2&sort=0&eid=&phid=&rid=&page=10#';
var downFileUrl='http://video.vrtimes.com/';
var contentModel=require("../models/Content");
var categoryModel=require('../models/ContentCategory');
var Dbopt=require('../models/Dbopt');

String.prototype.trim = function(){ return this.replace(/^\s+|\s+$/g,"")}
String.prototype.ltrim = function(){ return this.replace(/^\s+/g,"")}
String.prototype.rtrim = function(){ return this.replace(/\s+$/g,"")}
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

            getVideoUrl({id:ID},function(err,data){

            })

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

httpReqirest(vrlisttUrl,"",function(err,data){
    console.log(data);
   // parseHtml(data,function(err,vrdata){
   //     console.log(vrdata);
   // })
});