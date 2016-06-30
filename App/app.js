var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var http = require('http');
/*模板引擎*/
var partials = require('express-partials');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var apiRouterV1=require('./routes/apiv1');
var authenticate=require('./routes/authenticate');
var BaseReturnInfo = require('../util/apiDataModel.js');



var app = express();

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type, Authorization');
    if (req.method.toUpperCase() === 'OPTIONS') {
        return res.end();
    }
    next();
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(partials());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use(authenticate.apiAccessLog);
app.use('/api/v1', apiRouterV1);
//app.use('/api/', apiRouterV1);
//app.use('/api/v2', apiRouterV2);
//app.use('/api/headmaster', apiRouterHeadMaster);
//app.use('/api/pushtest', apipushtest);




// catch 404 anid forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        console.log(err);
        //log.writeLog(req, err, logType.err);
        res.json(new BaseReturnInfo(0, "服务器内部错误", ""));
        /*res.render('error', {
         message: err.message,
         error: {}
         });*/
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.status);
    //log.writeLog(req,err,logType.err);
    res.json(new BaseReturnInfo(0,"服务器内部错误",""));
    /*res.render('error', {
     message: err.message,
     error: {}
     });*/
});

//============================server on==============================

app.set('port', normalizePort(process.env.PORT || '8181'));
/**
 * Create HTTP server.
 */

var server = http.createServer(app);
server.listen( normalizePort(process.env.PORT || '8181'));
server.on('error', onError);
server.on('listening', onListening);
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}
/**
 * Created by v-lyf on 2016/6/28.
 */
