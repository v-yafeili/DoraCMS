/**
 * Created by v-lyf on 2016/6/28.
 */
// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('main'));

// 指定图表的配置项和数据
option = {
    title: {
        text: 'YouToVR数据来源统计分析',
    },
    tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        },
        formatter: function (params) {
            var tar = params[1];
            return tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value;
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: {
        type : 'category',
        splitLine: {show:false},
        data : []
    },
    yAxis: {
        type : 'value'
    },
    series: [
        {
            name: '辅助',
            type: 'bar',
            stack:  '总量',
            itemStyle: {
                normal: {
                    barBorderColor: 'rgba(0,0,0,0)',
                    color: 'rgba(0,0,0,0)'
                },
                emphasis: {
                    barBorderColor: 'rgba(0,0,0,0)',
                    color: 'rgba(0,0,0,0)'
                }
            },
            data: []
        },
        {
            name: '数量',
            type: 'bar',
            stack: '总量',
            label: {
                normal: {
                    show: true,
                    position: 'inside'
                }
            },
            data:[]
        }
    ]
};

$.get("dataAnalyse/getMain",function(data,status){
    if(status=='success') {
        if(data.type==0){
            alert("查询数据出错");
        }else{
            var vrdata=data.data;
            var vrname=[];
            var vrcount=[];
            var leftcount=[];
            var totalcount=0;
            for(var i= 0;i<vrdata.length;i++){
                vrname.push(vrdata[i]._id);
                vrcount.push(vrdata[i].vrdatacount);
                leftcount.push(0);
                totalcount=totalcount+vrdata[i].vrdatacount;
            }
            vrname.push("总共");
            vrcount.push(totalcount);
            leftcount.push(0);
            option.xAxis.data=vrname;
            option.series[1].data=vrcount;
            option.series[0].data=leftcount;
            //console.log(vrname);
            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
        }
    }
});


// 各个数据源项变化

$.get("dataAnalyse/sourceList",function(data,status){
    if(status=='success') {
        if(data.type==0){
            alert("查询数据出错");
        }else{
            parsedata(data.data);
        }
    }
});

var parsedata=function(vrdata){
    for (item in vrdata){
        console.log(item);
        $("#vrsourcelist").append('<div id='+item+' style="width: auto; height: 500px"></div>');
        var vrdate=[];
        var vrcount=[];
        var leftcount=[];
        for(var i= 0;i<vrdata[item].length;i++){
            vrdate.push(new Date(vrdata[item][i].date).Format('MM/dd'));
            vrcount.push(vrdata[item][i].vrcount);
            leftcount.push(0);
        }
        option.title.text=item+"数据源变化趋势图";
        option.xAxis.data=vrdate;
        option.series[1].data=vrcount;
        option.series[0].data=leftcount;
        //console.log(vrname);
        // 使用刚指定的配置项和数据显示图表。
        var myChart = echarts.init(document.getElementById(item));
        myChart.setOption(option);
    }
}


Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}