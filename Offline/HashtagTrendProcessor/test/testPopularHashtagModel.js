var PopularHashtag = require('../models/popularHashtag.js');
var HashtagTrend = require('../models/hashtagTrend.js');
var assert = require('assert');
//Mongodb references.
var mongoose = require ('mongoose');
mongoose.set('debug', true);
var oldTimeId = 1;
var newTimeId = 2;
mongoose.connect("mongodb://localhost/TestAttackTags", function printTrace(err, res) {
    assert.ifError(err);
    PopularHashtag.update(HashtagTrend, oldTimeId, newTimeId);
});
