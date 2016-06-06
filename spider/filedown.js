/**
 * Created by v-yaf_000 on 2016/6/6.
 */
// 同步图片和视频
var  request =require('superAgent');
var fs=require('fs');
var downloadImg = function(uri, filename, callback){
    request.get(uri)
    .end(function(err, res){
        // console.log('content-type:', res.headers['content-type']);  //这里返回图片的类型
        // console.log('content-length:', res.headers['content-length']);  //图片大小
        if (err) {
            console.log('err: '+ err);
            return false;
        }
        console.log('res: '+ res);
        request.get(uri).pipe(fs.createWriteStream('temp/'+filename)).on('close', callback);  //调用request的管道来下载到 images文件夹下
    });
};

var  testuri="http://cdn.hotcast.cn/image%2F20160519%2F573d7d9f73d91%2F750_458_%E6%9C%80%E7%BE%8E%E6%97%B6%E8%A3%85Show.jpg";
var  testuri2="http://cdn.hotcast.cn/import%2F20160526%2Fsd%2Fmnlsj20160526.mp4";
var  filename="test.jpg";
var  filename2="test.mp4";

downloadImg(testuri,filename,function(){
    console.log("finish");
})

downloadImg(testuri2,filename2,function(){
    console.log("finish2");
})