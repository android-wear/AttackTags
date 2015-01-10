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
    //PopularHashtag.update(HashtagTrend, oldTimeId, newTimeId);
    var oldData1 = {name: 'infosec', count: 2};
    var oldData2 = {name: 'test', count: 2};
    var newData1 = {name: 'infosec', count: 5};
    var newData2 = {name: 'test', count: 1};
    var newData3 = {name: 'test2', count: 1};
    PopularHashtag.compareAndUpdate([oldData1, oldData2], [newData1, newData2, newData3], 123456);
});

// Test compareAndUpdate
