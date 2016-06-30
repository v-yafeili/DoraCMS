/**
 * Created by liyafei on 2016/6/14.
 */
var watch = require('watch');
var path = require('path');
var qiniu=require('../util/qiniu');
var fs=require('fs');
var async=require("async");
var upfilelist=[];
var isUpFile=false;
watch.createMonitor('/root/srs/trunk/objs/nginx/html/hls', function (monitor) {
    //monitor.files['/home/mikeal/.zshrc'] // Stat object for my zshrc.
    console.log("begin watch");

    monitor.on("created", function (f, stat) {
        console.log("addfile");
        //console.log(f);
        fileUpdate(1,f);
    })
    monitor.on("changed", function (f, curr, prev) {
        console.log("changed");
        //console.log(f);
        fileUpdate(2,f);
    })
    monitor.on("removed", function (f, stat) {
        console.log("removed");
        fileUpdate(3,f);
    })
    //monitor.stop(); // Stop watching
})

var fileUpdate=function(type,f){
    var extname= path.extname(f);
    //console.log(extname);
    //console.log(extname=='.tmp');
    if(extname=='.tmp'){
        return;
    }else{
        var  filename=path.basename(f);
        console.log('开始上传'+filename);
        if(type==1||type==2){
            try{

                fs.stat(f, function(err, stat) {
                    if(err == null) {
                        if(stat.isDirectory()) {
                            console.log('文件夹存在');
                        } else if(stat.isFile()) {
                            fs.createReadStream("../../srs/trunk/objs/nginx/html/hls/"+filename)
                                .pipe(fs.createWriteStream("temp2/"+filename))
                                .on('close', function(err){
                                    upfilelist.push("temp2/"+filename);
                                    console.log("temp2/"+filename+'copy finish');
                                    upFileToQiniu();
                                });
                        } else {
                            console.log('路径存在，但既不是文件，也不是文件夹');
                            //输出路径对象信息
                            console.log(stat);
                        }
                    } else if(err.code == 'ENOENT') {
                        console.log(err.name);
                        console.log('路径不存在'+filename);
                    } else {
                        console.log('错误：' + err);
                    }
                });

            }catch (ex){
                console.error(ex);
            }
        }
        //qiniu.upFileToQiNiu(2, filename, f, function (err, data) {});
        //console.log(filename);
    }
}

var  upFileToQiniu=function() {
    if (isUpFile){
        return;
    }
    isUpFile= true;
    async.whilst(
        function () {
            return upfilelist.length > 0;
        },
        function (cb) {
            if (upfilelist.length > 0) {
                console.log("上传七牛队列" + upfilelist.length);
                var  filename=path.basename(upfilelist[0]);
                qiniu.upFileToQiNiu(2,filename ,upfilelist[0], function (err, data) {
                    var name = upfilelist.shift();
                    console.log(name + '上传七牛成功');
                    cb();
                });
            } else {
                cb();
                //setTimeout(cb(),500);
            }
        },
        function (err) {
            if (err) {
                console.log('出错同步hotcast： ', err);
            }
            isUpFile=false;
            console.log("完成同步hotcast")

        }
    )
}