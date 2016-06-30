/**
 * Created by v-lyf on 2016/6/29.
 */
var mongoose = require('mongoose');
var shortid = require('shortid');
var Schema = mongoose.Schema;

var  SystemlogSchema = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    apiname: {type:String,default:''},
    creattime:{type:Date,default:Date.now()},
    ver:String,    // app 版本号
    os :Number,   //  请求手机  1 andriod 2 ios
    msid:String,  //手机唯一编码
    ip:String,
});

module.exports = mongoose.model('apiaccesslog', SystemlogSchema);