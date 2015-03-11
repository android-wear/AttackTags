var mongoose = require('mongoose');
var HashtagToTweet = require('../hashtagToTweet.js');
var assert = require('assert');
mongoose.set('debug', true);
var startTimeInMs = 1;
var endTimeInMs = 9999999999999;
mongoose.connect("mongodb://localhost/TestAttackTags", function printTrace(err, res) {
    assert.ifError(err);
    HashtagToTweet.getTweetId("crn", startTimeInMs, endTimeInMs, 
                              function verify(err, res) {
        assert.ifError(err);
        console.log(res);
    });
});
