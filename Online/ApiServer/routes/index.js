var async = require('async');
var express = require('express');
var router = express.Router();
var Tweet = require('../models/tweet');
var Image = require('../models/image');

var env = 
    process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'development' ?
    process.env.NODE_ENV : 'development';
var config = require('../config.json')[env]

/* GET home page. */
router.get('/', function(req, res, next){
    var n = req.param("n");
    if (!n) {
        n = config.numberOfTweetsOnHomePage;
    }
    Tweet.getLatestNTweets(n, function(err, tweetsWithUrl){
        if(err) {
            next(err);
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
            }
        }
        async.mapSeries(tweetsWithUrl, Image.getImage, function(err, imageList) {
            res.render('index', {"n": n, "tweetsWithUrl": tweetsWithUrl, "imgList": imageList});
        });
    });
});
module.exports = router;
