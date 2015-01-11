var Tweet = require('../tweet.js');
var mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.connect('mongodb://localhost/TestAttackTags', function printTrace(err, res) {
    Tweet.getTweetsByCategoryAndDate('GENERAL', 1, 3, 1, function(err, data) {
        console.log(data);
    });
    }
);