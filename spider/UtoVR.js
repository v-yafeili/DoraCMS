/**
 * Created by v-yaf_000 on 2016/5/27.
 */

var  superAgent =require('superagent');
var async=require("async");
var  config=require('./spiderConfig').utoVRConfig;
var vrlisttUrl='http://www.utovr.com/Ajax/CategoryMore';
var vrDataDetial='http://www.utovr.com/Ajax/GetVideoPageInfo';
var contentModel=require("../models/Content");
var categoryModel=require('../models/ContentCategory');
var Dbopt=require('../models/Dbopt');
var baseFun=require('./baseFun');
var totalcount=0;
var synccount=0;


var   httpReqirest=function(url,senddata,callback){
    superAgent
        .post(url)
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        .send(senddata)
        .end(function(err,res){
            var  jsonData=JSON.parse(res.text);
            return callback(err,jsonData);
            //console.log(jsonData[0]);
        })
};
var saveVrData=function(listitemifo,hotCastData,cotegory,callback){
    //console.log(listitemifo);
    //console.log(hotCastData);
    //console.log(hotCastData.video.addresses);
    totalcount++;
    Dbopt.findOneObj(contentModel,{'source':'utovr','foreignKeyId':hotCastData.video.id},function(err,data){
        if (data)
        {
            callback();
        }
        else {
            var temdata={
                title:  hotCastData.video.name,
                stitle : listitemifo.Item3,
                category : cotegory._id, //文章类别
                sortPath : cotegory.sortPath, //存储所有父节点结构
                tags : cotegory.name, // 标签
                keywords : "",
                sImg : listitemifo.Item5, // 文章小图
                discription : listitemifo.Item3,
                date: new Date(),
                updateDate: new Date(), // 更新时间
                author : "HkIiCzVQ", // 文档作者
                state : true,  // 是否在前台显示，默认显示
                isTop : 0,  // 是否推荐，默认不推荐 0为不推荐，1为推荐
                clickNum : 1,
                comments : listitemifo.Item3,
                commentNum : 0, // 评论数
                likeNum : 0, // 喜欢数
                from : 2, // 来源 1为原创 2为转载
                source:"utovr", // 来源网站  hotcast  utovr
                foreignKeyId:hotCastData.video.id , // 网站唯一 id
                uhd_url:"", // 超高清
                hd_url:"", //高清
                sd_url:"", //标清
                videoTime:listitemifo.Item4,
                syncDate: new Date(),
            };
            for (var i=0;i<hotCastData.video.addresses.length;i++){
                if (hotCastData.video.addresses[i].tag=='高清'){
                    temdata.hd_url=hotCastData.video.addresses[i].mp4;
                }else  if (hotCastData.video.addresses[i].tag=='标清'){
                    temdata.sd_url=hotCastData.video.addresses[i].mp4;
                }else{  // 极速
                    temdata.uhd_url=hotCastData.video.addresses[i].mp4;
                }
            }

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
            console.log('开始同步第'+pagecount+'条数据vrseUTCVR ' );
            var senddata='param={"id":'+ vrdatalist[pagecount].Item1 +'}';
            httpReqirest(vrDataDetial,senddata,function(err,vrdata){
                //console.log(vrdata.length);
                if (vrdata!==undefined&&vrdata.Data!==undefined ){
                    //console.log(vrdata.data);
                    saveVrData( vrdatalist[pagecount],vrdata.Data,cotegory,function(err,data){
                        pagecount++;
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
var UtoVRData = function(){

};

UtoVRData.prototype={
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
                    return itemcount < config.length;
                },
                function (cb) {
                    console.log(" 开始同步UTCVR：" + config[itemcount].name);

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
                            var searchdata='param={"id":'+config[itemcount].hotCastId+',"index":1,"size":500}';
                            httpReqirest(vrlisttUrl, searchdata, function (err, vrdata) {
                                //console.log(vrdata);
                                if (vrdata !== undefined && vrdata.Data.Items.length > 0) {
                                     console.log(vrdata.Data.Items.length);
                                    getVrDetialData(vrdata.Data.Items, n, function (err) {
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
                            console.log(" 同步UTovr出错：" + config[itemcount].name);
                            itemcount = config.length;
                        }
                        itemcount++;
                        cb(err);
                    });

                },
                function (err) {
                    if (err) {
                        console.log('出错同步UTOVR： ', err);
                    }
                    else {
                        console.log("完成同步UTOVR");
                        baseFun.updateVrData("utovr", totalcount, synccount, function (err, data) {
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

module.exports=UtoVRData;
//var utovrdata=new UtoVRData();
//utovrdata.getVideoItem(function(err,data){
//});
//{ Item1: 924,
//    Item2: '校园少女恋爱韩舞《Lipstick》',
//    Item3: '性感学妹女团《Lipstick》',
//    Item4: '02:20',
//    Item5: 'http://img.utovr.com/2/20160620/jfoisobxgcu9rcab_224_126.jpg',
//    Item6: '/video/201306398196.html' }
//{ gid: '511dc2f50236d3500909f5e19ca5440e',
//    account: { id: 0, key: '' },
//    video:
//    { id: 924,
//        name: '校园少女恋爱韩舞《Lipstick》',
//        format: 0,
//        addresses: [ [Object], [Object], [Object] ] },
//    init: { address_index: 1 } }
//[ { tag: '极速',
//    mp4: 'http://cache.utovr.com/s1dt4aylfrrwmuwnhy/L1_1280_1_15.mp4',
//    m3u8: 'http://cache.utovr.com/s1dt4aylfrrwmuwnhy/L1_1280_1_15.m3u8' },
//    { tag: '标清',
//        mp4: 'http://cache.utovr.com/s1dt4aylfrrwmuwnhy/L2_1920_3_25.mp4',
//        m3u8: 'http://cache.utovr.com/s1dt4aylfrrwmuwnhy/L2_1920_3_25.m3u8' },
//    { tag: '高清',
//        mp4: 'http://cache.utovr.com/s1dt4aylfrrwmuwnhy/L3_2880_5_25.mp4',
//        m3u8: 'http://cache.utovr.com/s1dt4aylfrrwmuwnhy/L3_2880_5_25.m3u8' } ]
//开始同步第1条数据vrseUTCVR
//{ Item1: 896,
//    Item2: '女神课堂之鬼捉奸',
//    Item3: '都怪偷情惹的祸',
//    Item4: '06:10',
//    Item5: 'http://img.utovr.com/2/20160616/tbacos4is22laykp_224_126.jpg',
//    Item6: '/video/161306299395.html' }
//{ gid: '511dc2f50236d3500909f5e19ca5440e',
//    account: { id: 0, key: '' },
//    video:
//    { id: 896,
//        name: '女神课堂之鬼捉奸',
//        format: 0,
//        addresses: [ [Object], [Object], [Object] ] },
//    init: { address_index: 1 } }
//[ { tag: '极速',
//    mp4: 'http://cache.utovr.com/s1v2ehsogphdx7npoq/L1_1280_1_15.mp4',
//    m3u8: 'http://cache.utovr.com/s1v2ehsogphdx7npoq/L1_1280_1_15.m3u8' },
//    { tag: '标清',
//        mp4: 'http://cache.utovr.com/s1v2ehsogphdx7npoq/L2_1920_3_25.mp4',
//        m3u8: 'http://cache.utovr.com/s1v2ehsogphdx7npoq/L2_1920_3_25.m3u8' },
//    { tag: '高清',
//        mp4: 'http://cache.utovr.com/s1v2ehsogphdx7npoq/L3_2880_5_25.mp4',
//        m3u8: 'http://cache.utovr.com/s1v2ehsogphdx7npoq/L3_2880_5_25.m3u8' } ]