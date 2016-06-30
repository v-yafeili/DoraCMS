/**
 * Created by v-lyf on 2016/6/28.
 */
//vr 数据源统计
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid');

var VrSourceSchema = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    vrsource:String,
    vrcount:{ type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    updateDate: { type: Date, default: Date.now }, // 更新时间
});

var VrSource = mongoose.model("VrSource",VrSourceSchema);

module.exports = VrSource;