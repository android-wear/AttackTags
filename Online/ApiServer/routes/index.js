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
        for (var i = 0; i < tweetsWithUrl.length; ++i) {
            tweetsWithUrl[i][0] = 
                tweetsWithUrl[i][0].replace(urlRegex, "")
                .replace(endsWithNonCharRegex, "");   
        }
        res.render('index', {"n": n, "tweetsWithUrl": tweetsWithUrl});
    });
});
module.exports = router;
