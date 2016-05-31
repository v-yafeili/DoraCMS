/**
 * Created by v-yaf_000 on 2016/5/31.
 */
function BaseReturnInfo(type,msg,data,extrainfo){
    this.type=type;
    this.msg=msg;
    this.data=data;
    this.extra=extrainfo;
}

module.exports=BaseReturnInfo;