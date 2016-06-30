var mongoose = require('mongoose');
var shortid = require('shortid');
var Schema = mongoose.Schema;

var SmsVeirfyCodeSchema = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    mobile: { type: String, unique: true},
    smsCode: String,
    createdTime: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false}
});

SmsVeirfyCodeSchema.statics.findByMobile = function(_mobile, _date_min, _date_max, callback){

    //console.log('find: ' + _mobile);

    this.findOne({ mobile: _mobile, createdTime: { $gte: new Date(_date_min), $lt: new Date(_date_max) }}, function(err, result) { 
        //console.log(result);
        //if(result != null) console.log('found: ' + _mobile);
        callback(err, result, _mobile); 
    }); 

};



module.exports = mongoose.model('SmsVerifyCode', SmsVeirfyCodeSchema);