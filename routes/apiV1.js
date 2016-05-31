/**
 * Created by v-yaf_000 on 2016/5/31.
 * 对外公布api接口
 *
 * */
var express = require('express');
var router = express.Router();
var contentApi=require('../api/v1/content');



// 获取vr 虽有分类
router.get('/getCategory',contentApi.getAllVrCategory);
router.get('/getContentByCategoryId',contentApi.getContentByCategory);

module.exports = router;