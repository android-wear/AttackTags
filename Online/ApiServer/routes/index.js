var express = require('express');
var router = express.Router();
var Tweet = require('../models/tweet');

/* GET home page. */
router.get('/', function(req, res, next){
    var n = req.param("n");
    if (!n) {
        n = 10;
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
            tweetsWithUrl[i][0] = 
                tweetsWithUrl[i][0].replace(urlRegex, "")
                .replace(endsWithNonCharRegex, "")
                .replace(reTweetPatternRegex, "")
                .replace(pingOtherPeoplePatternRegex, "");
            if (!tweetsWithUrl[i][0] || existedTitles.indexOf(tweetsWithUrl[i][0]) >= 0 ||
                    existedUrls.indexOf(tweetsWithUrl[i][1]) >= 0) {
                tweetsWithUrl.splice(i, 1);
                --i;
            } else {
                existedTitles.push(tweetsWithUrl[i][0]);
                existedUrls.push(tweetsWithUrl[i][1]);
            }
        }
        res.render('index', {"n": n, "tweetsWithUrl": tweetsWithUrl});
    });
});
module.exports = router;
