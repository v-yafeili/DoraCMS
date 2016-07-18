/**
 * Created by v-lyf on 2016/6/29.
 */
var express = require('express');
var router = express.Router();
var contentApi=require('../controller/content');
var userApi=require('../controller/user');
var systemInfotApi=require('../controller/systemInfo');
var BaseReturnInfo = require('../../util/apiDataModel.js');
var ensureAuthorizedController = require('./authenticate');

// 获取接口测试
router.get('/test',function(req,res){
    return res.json(new BaseReturnInfo(1,"","test success"));
});
// 获取手机验证码
router.get('/getMobileCode',systemInfotApi.fetchCode);

// 获取vr 虽有分类
router.get('/getCategory',contentApi.getAllVrCategory);
router.get('/getContentByCategoryId',contentApi.getContentByCategory);
// 获取主页列表
router.get('/getMainList',contentApi.getMainPageDate);
router.get('/searchVr',contentApi.searchResult);


// 获取我喜欢的视频
router.get("/userinfo/favoritevr",ensureAuthorizedController.ensureAuthorized,contentApi.getMyFavoritVr);
// 添加我喜欢的视频
router.put('/userinfo/favoritevr/:id', ensureAuthorizedController.ensureAuthorized,contentApi.putFavorVr);
// 删除我喜欢的视频
router.delete('/userinfo/favoritevr/:id',ensureAuthorizedController.ensureAuthorized, contentApi.delFavorrVr);


//======================用戶相關的操作=============================
router.post('/userLogin',userApi.doLogin);

module.exports = router;