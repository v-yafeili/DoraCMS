/**
 * Created by liyafei on 2016/6/14.
 */
var watch = require('watch')
watch.createMonitor('./temp2', function (monitor) {
    //monitor.files['/home/mikeal/.zshrc'] // Stat object for my zshrc.
    console.log("begin watch");

    monitor.on("created", function (f, stat) {
        console.log("addfile");
        console.log(f);
        console.log(stat);
    })
    monitor.on("changed", function (f, curr, prev) {
        console.log("changed");
        console.log(f);
       // console.log(stat);
    })
    monitor.on("removed", function (f, stat) {
        console.log("removed");
        console.log(f);
        console.log(stat);
    })
    //monitor.stop(); // Stop watching
})