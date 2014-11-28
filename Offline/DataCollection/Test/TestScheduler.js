var twitter = require('../../TwitterCrawler/twitterCrawler.js');
var MockTwitterModule = require('../../TwitterCrawler/Test/mockTwitterModule.js');
var Scheduler = require ('../Scheduler.js');
var assert = require('assert');

var testTweets = ["test tweet 1", "test tweet 2"];
var mockTwitterModule = new MockTwitterModule(testTweets, 1000);
var testUserList = ["DmitriCyber", "YANGSHA", "TestUser3", "TestUser4"];
var perUserTweetCrawlingCount = 2;
var maxTweetsToCrawl = 2;
var testTwitterCrawler = new twitter.TwitterCrawler(
    mockTwitterModule, testUserList, perUserTweetCrawlingCount,
    maxTweetsToCrawl);

var totalRounds = 0;
var verify = function(content) {
    assert.equal(content[0], testTweets,
                 content[0] + " not equal to " + testTweets);
    ++totalRounds;
    console.log("------PASSED--------");
}

var callbacks = [];
callbacks.push(verify);
var scheduler = new Scheduler(testTwitterCrawler, callbacks);

var finishRunAndVerify = function (scheduler, 
                                   id, 
                                   expectedRounds) {    
    scheduler.stop(id);
    assert.equal(totalRounds, expectedRounds, 
                 "actually ran " + totalRounds + 
                 " times, not equals to the expected " + expectedRounds +
                 " times.");
}
var runningIntervalInMs = 5000;
var expectedRounds = 1;
var id = scheduler.start(runningIntervalInMs);

setTimeout(finishRunAndVerify, runningIntervalInMs * expectedRounds, 
           scheduler, id, expectedRounds);