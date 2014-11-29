var express = require('express');
var router = express.Router();
var Tweet = require('../models/tweet');

/* GET users listing. */
router.get('/', function(req, res) {
  res.send("Usage: /tweets/simple?q=shellshock or " + 
           " /tweets/simple?q=shellshock+phone or " +
           " /tweets/simple?q=shellshock+phone&n=5");
});

module.exports = router;

/*
 * (single keyword)
 * /tweets/simple?q=shellshock
 * (multiple keywords)
 * /tweets/simple?q=shellshock+phone
 * (keywords limited to top N)
 * /tweets/simple?q=shellshock+phone&n=5
 */
router.get('/simple', function(req, res, next){
    var keywords = req.param("q").split("+");
    var n = req.param("n");
    console.log(keywords);
    console.log(n);
    Tweet.getTopNByKeywords(keywords, n, function(err, tweet){
        if(err) {
            next(err);
        }
        res.send(tweet);
    });
});