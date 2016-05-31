/**
 * Created by v-yaf_000 on 2016/5/31.
 * 有关文章操作所有
 */

var ApiDataModel=require('../../util/apiDataModel');
var DbSiteFunc=require('../../models/db/siteFunc');
var  DbOpt = require("../../models/Dbopt");
var ContentModel=require("../../models/Content");

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
    var filed='title stitle tags sImg date isTop  clickNum commentNum likeNum uhd_url hd_url sd_url';
    var searchinfo={"category":categoryid};
   var query=DbOpt.getApiPaginationResult(ContentModel,req,searchinfo,filed);
    console.log(query);
    query.exec(function(err,data){
        if(err){
            return res.json(new ApiDataModel(0,"查询出错"+err,""));
        }
        else {
            return res.json(new ApiDataModel(1,"",data));
        }
    })
}
