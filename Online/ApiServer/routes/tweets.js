var express = require('express');
var router = express.Router();
var Tweet = require('../models/tweet');

/* GET users listing. */
router.get('/', function(req, res) {
  res.send("Usage: /search/simple?q=shellshock or " + 
           "/search/simple?q=shellshock+phone or " +
           "/search/simple?q=shellshock+phone&n=5 or " +
           "/search/hot?q=shellshock&retweet_min=1 or " +
           "/search/today?n=10");
});

module.exports = router;

/*
 * (single keyword)
 * http://DOMAIN/tweets/simple?q=shellshock
 * (multiple keywords)
 * http://DOMAIN/tweets/simple?q=shellshock+phone
 * (keywords limited to top N)
 * http://DOMAIN/tweets/simple?q=shellshock+phone&n=5
 */
router.get('/simple', function(req, res, next){
    var n = req.param("n");
    Tweet.getTopNByKeywords(req.param("q").split(" "), n, function(err, tweet){
        if(err) {
            next(err);
            //next({message: err, status: 200, stack: "tweets.js"});
        }
        res.send(tweet);
    });
});

// Get the hottest tweet with min retweet counts.
// http://DOMAIN/search/hot?q=shellshock&retweet_min=10
router.get('/hot', function(req, res, next){
    var n = req.param("retweet_min");
    Tweet.getTopRetweetedWithKeywords(req.param("q").split(" "), n, function(err, tweet){
        if(err) {
            next(err);
        }
        res.send(tweet);
    });
});

// Get today's latest N tweets.
//http://DOMAIN/search/today?n=10.
router.get('/today', function(req, res, next){
    Tweet.getLatestNTweets(req.param("n"), function(err, tweet){
        if(err) {
            next(err);
        }
        res.send(tweet);
    });
});