/**
 * Created by v-lyf on 2016/6/29.
 */

//  定义工具方法

module.exports={
    getClientIp:function (req){
        var ipAddress;
        var headers = req.headers;
        var forwardedIpsStr = headers['x-real-ip'] || headers['x-forwarded-for'];
        forwardedIpsStr ? ipAddress = forwardedIpsStr : ipAddress = null;
        if (!ipAddress) {
            ipAddress = req.connection.remoteAddress;
        }
        return ipAddress;
    }
}