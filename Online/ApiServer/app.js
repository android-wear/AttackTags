var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var mongoose = require('mongoose');
var env = 
    process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'development' ?
    process.env.NODE_ENV : 'development';
var config = require('./config.json')[env];

var routes = require('./routes/index');
var users = require('./routes/users');
var tweets = require('./routes/tweets');

// Start mongodb.
if (env != 'production') {
    mongoose.set('debug', true);
}

mongoose.connect(config.mongodbConnectionUri);
mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + 
                config.mongodbConnectionUri);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
// Disable logging.
//app.use(logger('prod'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// Compress all responses with gzip.
app.use(compression());
// Cache static content.
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/user', users);
app.use('/tweet', tweets);
app.use('/tweets', tweets);
app.use('/search', tweets);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}, 
    });
});


module.exports = app;
