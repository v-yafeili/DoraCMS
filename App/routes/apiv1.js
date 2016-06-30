/**
 * Created by v-lyf on 2016/6/29.
 */
var express = require('express');
var router = express.Router();
var contentApi=require('../controller/content');
var systemInfotApi=require('../controller/systemInfo');
var BaseReturnInfo = require('../../util/apiDataModel.js');

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

module.exports = router;