/**
 * Created by v-lyf on 2016/7/17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid');
var Content = require('./Content');
var User = require('./User');

var FavoriteContentSchema = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    userId : { type : String , ref : 'User'},
    contentId : { type : String , ref : 'Content'},
    date: { type: Date, default: Date.now },

});

var FavoriteContent = mongoose.model("FavoriteContent",FavoriteContentSchema);

module.exports = FavoriteContent;