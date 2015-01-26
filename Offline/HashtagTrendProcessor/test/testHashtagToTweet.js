var HashtagToTweet = require('../models/hashtagToTweet.js');
var assert = require('assert');
var mongoose = require ('mongoose');
mongoose.set('debug', true);
mongoose.connect("mongodb://localhost/TestAttackTags", function printTrace(err, res) {
    HashtagToTweet.update("cybersecurity", 0, console.log);
});