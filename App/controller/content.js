/**
 * Created by v-yaf_000 on 2016/5/31.
 * 有关文章操作所有
 */

var ApiDataModel=require('../../util/apiDataModel');
var DbSiteFunc=require('../../models/db/siteFunc');
var  DbOpt = require("../../models/Dbopt");
var ContentModel=require("../../models/Content");
var FavoriteContent=require('../../models/UserFavoriteContent');
var url=require('url');
var  serverDate={
    // 获取顶部推荐数据
    getTopData:function(req,filed,callback){
        req.page=1;
        searchinfo={"isTop":true}
        var query=DbOpt.getApiPaginationResult(ContentModel,req,searchinfo,filed,{clickNum:-1});
        query.exec(function(err,data){
            var returndata={};
            if(data){
                returndata.topList=data.slice(0,4);
                returndata.recommendList=data.slice(5,-1);
            }
            return callback(err,returndata);
        })
    }
};
var filed='title stitle tags sImg date isTop  clickNum commentNum likeNum uhd_url' +
    ' hd_url sd_url videoTime source';
//获取所有分类
exports.getAllVrCategory=function(req,res){
    var data=  DbSiteFunc.getCategoryList();
    var returndata=[];
    data.exec(function(err,categoryData){
        if(categoryData){
            categoryData.forEach(function(r,index){
                var oneCategory={
                    id: r._id,
                    name: r.name,
                }
                returndata.push(oneCategory);
            });
            return res.json(new ApiDataModel(1,"",returndata));
        }else {
            return res.json(new ApiDataModel(0,"没有查到数据"));
        }
    })
};
// 获取分类下面的文章
exports.getContentByCategory=function(req,res){
    var categoryid=req.query.categoryid;
    if(categoryid===undefined){
        return res.json(new apiDataModel(0,"参数错误"));
    }
    //var filed='title stitle tags sImg date isTop  clickNum commentNum likeNum uhd_url hd_url sd_url videoTime';
    var category={"category":categoryid};
    if(categoryid=="B18a0R-_"){
        category={"isTop":1};
    }
    var query=DbOpt.getApiPaginationResult(ContentModel,req,category,filed,"");
    query.exec(function(err,data){
        if(err){
            return res.json(new ApiDataModel(0,"查询出错"+err,""));
        }
        else {
            return res.json(new ApiDataModel(1,"",data));
        }
    })
};
// app 主页数据
exports.getMainPageDate=function(req,res){
    //var filed='title stitle tags sImg date isTop  clickNum commentNum likeNum uhd_url hd_url sd_url videoTime';
    var searchinfo={"isTop":false};
    var query=DbOpt.getApiPaginationResult(ContentModel,req,searchinfo,filed,"");
    query.exec(function(err,data){
        if(err){
            return res.json(new ApiDataModel(0,"查询出错"+err,""));
        }
        else {
            serverDate.getTopData(req,filed,function(err,topdata){
                if(err){
                    return res.json(new ApiDataModel(0,"查询出错"+err,""));
                }else{
                    return res.json(new ApiDataModel(1,"",{topData:topdata,Datalist:data}));
                }
            })
        }
    })
}


// 模糊搜索vr
exports.searchResult=function(req, res){
    var params = url.parse(req.url,true);
    var searchKey = params.query.searchKey;
    var area = params.query.area;

    var keyPr = [];
    var reKey = new RegExp(searchKey, 'i');
//    模糊查询名称和内容
    if(area === "tags"){
        keyPr = {'tags' : { $regex: reKey } };
    }else{
        keyPr = [];
        keyPr.push({'comments' : { $regex: reKey } });
        keyPr.push({'tags' : { $regex: reKey } });
        keyPr.push({'title' : { $regex: reKey } })
    }

   // var filed='title stitle tags sImg date isTop  clickNum commentNum likeNum uhd_url hd_url sd_url videoTime';
    var query=DbOpt.getApiPaginationResult(ContentModel,req,keyPr,filed,"");
    query.exec(function(err,data){
        if(err){
            return res.json(new ApiDataModel(0,"查询出错"+err,""));
        }
        else {
            return res.json(new ApiDataModel(1,"",data));
        }
    })
}

exports.getMyFavoritVr=function(req, res){
    var  msid=req.query._msid;
    FavoriteContent.find({msid:msid})
        .populate("contentId",filed)
        .exec(function(err,data){
            if(err){
                return res.json(new ApiDataModel(0,"查询出错"+err,""));
            }
            else{
                console.log(data);
                var returnmodel=[];
                data.forEach(function(r,index){
                    if(r.contentId) {
                        returnmodel.push(r.contentId)
                    }
                })
                return res.json(new ApiDataModel(1,"",returnmodel));
            }
        })

}
exports.putFavorVr=function(req, res){
    var  msid=req.query._msid;
    var  contentId=req.query.contentId;
    DbOpt.findOneObj(FavoriteContent,{'msid':msid,'contentId':contentId},function(err,data){
        if(err){
            return res.json(new ApiDataModel(0,"收藏出错"+err,""));
        }
        if(data){
            return res.json(new ApiDataModel(1,"",""));
        }else{
            DbOpt.addOneObj(FavoriteContent,{'msid':msid,'contentId':contentId,date:new Date()},function(err){
                if(err){
                    return res.json(new ApiDataModel(0,"收藏出错"+err,""));
                }else{
                    return res.json(new ApiDataModel(1,"",""));
                }
            })
        }
    })
}
exports.delFavorrVr=function(req, res){

}