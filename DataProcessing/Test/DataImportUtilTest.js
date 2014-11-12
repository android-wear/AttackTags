var util = require('../DataImportUtil');
var assert = require('assert');
var neo4j = require('node-neo4j');
var db = new neo4j("http://localhost:7474");

var testTweets = require('./TestContent.json');
var testNewTweetsDb = testTweets[0];
var testTweetId = 12;
db.deleteNodesWithLabelsAndProperties(
    'TestNode', 
    {id: testTweetId}, 
    function(err, data) {
        assert.ifError(err);
        console.log(data);
});
db.insertNode({id: 12, text: 'test'}, 
              'TestNode', 
              function(err, data) {});

testNewTweetsDb[0]["id"] = testTweetId;
testNewTweetsDb[1]["id"] = 13;
util.processTweets(db, testNewTweetsDb, 'TestNode');
util.event.on("data", function(data) {
    assert.equal(
        data["tweets"].length,
        1);
});

var testTweetWithNullId = testTweets[0];
testTweetWithNullId[0]["id"] = null;
testTweetWithNullId[1]["id"] = testTweetId;
util.processTweets(db, testTweetWithNullId, 'TestNode');
util.event.on("data", function(data) {
    assert.equal(data["tweets"].length, 1);
});

var testTweetWithNullText = testTweets[0];
testTweetWithNullText[0]["text"] = null;
testTweetWithNullText[1]["id"] = testTweetId;
util.processTweets(db, testTweetWithNullText, 'TestNode');
util.event.on("data", function(data) {
    assert.equal(data["tweets"].length, 1);
});

var testTweetWithNullUser = testTweets[0];
testTweetWithNullUser[0]["user"]["id"] = null;
testTweetWithNullUser[1]["id"] = testTweetId;
util.processTweets(db, testTweetWithNullUser, 'TestNode');
util.event.on("data", function(data) {
    assert.equal(data["tweets"].length, 1);
});
