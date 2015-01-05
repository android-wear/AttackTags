var Tweet = require('../models/tweet.js');
var mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.connect('mongodb://localhost/TestAttackTags', function printTrace(err, res) {
    Tweet.insertOrUpdate({
        id: 123,
        text: 'test',
        created_at: 1,
        favorites: 12,
        link: 'http://www.google.com'
    }, console.log);
    }
);