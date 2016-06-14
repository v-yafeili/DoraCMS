/**
 * Created by v-yaf_000 on 2016/5/27.
 */
var  superAgent =require('superagent');


var UtoVRUrl='http://api.utovr.com';

var UtoVRData = function(){

};

UtoVRData.prototype={
    // 获取分类
    getCategories:function(){

    },
    getVideoItem:function(){
        superAgent
            .get('http://api.utovr.com/v2/categories/13 ')
            .set('Authorization','Basic MzYxODY1QjU2MTdBRkM1MkQzQTNCMjRBRkE3NDZGRkU6KzNhSkRHTU9FZ3h1bkxOYTJMU2plYUl2Mzd4aDRyRlhvUmpWTk1mM215WTVrK2ROWk5HZ21zbks5N1drMTVaTnlRQ2ZScnJhZURtMWlOMkJ1WDFlUE9lemZ5Wm4zb0RIK0JYb252NTU2SVU9')
            .end(function(err,res){
                if (err){
                    console.log('请求出错：'+err);
                }
                console.log(res.text);
            })
    },
}


var utovrdata=new UtoVRData();
//utovrdata.getVideoItem();
//console.log(typeof undefined)
