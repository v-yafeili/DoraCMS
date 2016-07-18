/**
 * Created by v-lyf on 2016/7/17.
 */
exports.resBaseUser=function(user){
    this._id=user._id;
    this.phoneNum=user.phoneNum;
    this.name=user.name;
    this.userName=user.userName;
    this.comments=user.comments;
    this.logo=user.logo;
    this.gender=user.gender;
    this.token=user.token;

};