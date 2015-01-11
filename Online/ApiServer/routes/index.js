var async = require('async');
var express = require('express');
var router = express.Router();
var Tweet = require('../models/tweet');
var Image = require('../models/image');
var PopularHashtag = require('../models/popularHashtag');

var env = 
    process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'development' ?
    process.env.NODE_ENV : 'development';
var config = require('../config.json')[env];

/* GET home page. */
router.get('/', function(req, res, next){
    var requestParams = {};    
    var n = req.param("n");
    if (!n) {
        n = config.numberOfTweetsOnHomePage;
    }
    requestParams.topN = n;
    async.parallel({
        n: function getN(callback) {
            callback(null, requestParams.topN);
        },
        hashtags: function getHashtags(callback) {
            PopularHashtag.getTags(callback);
        },
        tweetsWithImg: function getTweetsWithImage(callback) {
            getTweetsAndImages(res, requestParams, callback);
        }
    }, function callback(err, output) {
        postQuery(res, next, err, output);
    });
});

var postQuery = function postQuery(res, next, err, output) {
    if (err) {
        next(err);
    } else {
        res.render("index", output);
    }
}

var getTweetsAndImages = function getTweetsAndImages(res, requestParams, callback) {
    Tweet.getTweetsByCategoryAndDate('GENERAL', 
                                     getDateTimeInMilSeconds(-1),
                                     getDateTimeInMilSeconds(1),
                                     requestParams.topN, 
                                     function(err, tweetsWithUrl){
        if (err) {
            console.log(err);
            return callback(err);
        }
        
        // Remove url links from text.
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        var endsWithNonCharRegex = /\W+$/;
        // Sample:
        // before: RT @lengxiaohua: this is real text.
        // after: this is real text.
        var reTweetPatternRegex = /RT @\w+: /g;
        // Sample:
        // before: asdfasdf @yangsha @anotherguy qqqq.
        // after: both @yangsha and @anogherguy removed.
        var pingOtherPeoplePatternRegex = /@\w+/g;
        var existedUrls = [];
        var existedTitles = [];
        var imageList = [];
        for (var i = 0; i < tweetsWithUrl.length; ++i) {
            tweetsWithUrl[i].text = 
                tweetsWithUrl[i].text.replace(urlRegex, "")
                .replace(endsWithNonCharRegex, "")
                .replace(reTweetPatternRegex, "")
                .replace(pingOtherPeoplePatternRegex, "");
            if (!tweetsWithUrl[i].text || existedTitles.indexOf(tweetsWithUrl[i].text) >= 0 ||
                    existedUrls.indexOf(tweetsWithUrl[i].link) >= 0) {
                tweetsWithUrl.splice(i, 1);
                --i;
            } else {
                existedTitles.push(tweetsWithUrl[i].text);
                existedUrls.push(tweetsWithUrl[i].link);
                imageList.push(Image.getDefaultImage());
            }
        }
        
        callback(null,
                 {
                    tweetsWithUrl: tweetsWithUrl,
                    imgList: imageList
                 });
    });    
}

//Returns GMT time.
//delta is the difference to today. delta = 0 means get date time for 
//today.
//If beginningOfTheDay = true, it will set date time to the beginning of the day.
//If endOfTheDay = true, it will set date time to the end of the day.
var getDateTimeInMilSeconds = function getDateTimeInMilSeconds(delta) {
  var date = new Date();
  date.setDate(date.getDate() + delta);
  // Set to beginning of the day.
  date.setHours(0,0,0,0);
  return date.getTime();
}

module.exports = router;
