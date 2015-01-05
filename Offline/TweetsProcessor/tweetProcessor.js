// Load tweets from Neo4j into Mongodb.
var mongoose = require('mongoose');
var env = 
    process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'development' ?
    process.env.NODE_ENV : 'development';
var config = require('./config/config.json')[env];
var Tweet = require('./models/tweet.js');
var TweetInNeo4j = require('./models/tweetInNeo4j.js');

//Start mongodb.
if (env != 'production') {
    mongoose.set('debug', true);
}

mongoose.connect(config.uristring);
mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + 
                config.uristring);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

//If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

var loadTweets = function loadTweets() {
    var now = (new Date()).getTime();
    // 2 hour ago.
    var startDate = getPastDateTimeInMilSec(now, 0, 2, 0);
    console.log(startDate);
    TweetInNeo4j.getTweets(startDate, now, function(err, tweets) {
        tweets.forEach(write);
    });
    
    function write(tweetInNeo4j) {
        Tweet.insertOrUpdate(tweetInNeo4j, function callback(err, result) {
            if (err) {
                console.log(err);
            }
            if (config.enableDebugLogging) {
                console.log(result);
            }
        });
    }
}

var getPastDateTimeInMilSec = function getPastDateTimeInMilSec(timestamp, 
                                                               dayAgo, 
                                                               hourAgo, 
                                                               minuteAgo) {
    var oneSec = 1000;
    var oneMinute = 60 * oneSec;
    var oneHour = 60 * oneMinute;
    var oneDay = 24 * oneHour;    
    return timestamp - dayAgo * oneDay - hourAgo * oneHour - minuteAgo * oneMinute; 
}

loadTweets();

setInterval(loadTweets,
            config.runningIntervalInMs);