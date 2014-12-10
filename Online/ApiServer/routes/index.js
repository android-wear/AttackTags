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
        for (var i = 0; i < tweetsWithUrl.length; ++i) {
            tweetsWithUrl[i][0] = 
                tweetsWithUrl[i][0].replace(urlRegex, "")
                .replace(endsWithNonCharRegex, "")
                .replace(reTweetPatternRegex, "")
                .replace(pingOtherPeoplePatternRegex, "");
        }
        res.render('index', {"n": n, "tweetsWithUrl": tweetsWithUrl});
    });
});
module.exports = router;
