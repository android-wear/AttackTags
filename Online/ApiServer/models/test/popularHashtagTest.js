var mongoose = require('mongoose');
var PopularHashtag = require('../popularHashtag.js');
var assert = require('assert');
mongoose.set('debug', true);
var oldTimeId = 1;
var newTimeId = 2;
mongoose.connect("mongodb://localhost/TestAttackTags", function printTrace(err, res) {
    assert.ifError(err);
    PopularHashtag.getTagsFromTimeRange(oldTimeId, newTimeId, function verify(err, res) {
        assert.ifError(err);
        console.log(res);
        assert.equal(res.length, 2);
        assert.equal(res[0].weight, 101);
        assert.equal(res[1].weight, 52);
    });
});
