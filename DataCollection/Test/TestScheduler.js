var twitter = require('../../TwitterCrawler/twitterCrawler.js');
var MockTwitterModule = require('../../TwitterCrawler/Test/mockTwitterModule.js');
var Scheduler = require ('../Scheduler.js');
var assert = require('assert');

var testTweet = "testtest";
var mockTwitterModule = new MockTwitterModule(testTweet, 1000);
var testTwitterCrawler = new twitter.TwitterCrawler(
    mockTwitterModule, ["DmitriCyber", "YANGSHA"], 2);

var totalRunningTimes = 0;
var verify = function(content) {
    assert.equal(content.length, 2, "Should only return one tweet.");
    content.forEach(function(data) {
        assert.equal(data, testTweet, "Tweet should be equal to " + testTweet);
    });
    ++totalRunningTimes;
    console.log("------PASSED--------");
}

var callbacks = [];
callbacks.push(verify);
var scheduler = new Scheduler(testTwitterCrawler, callbacks);

var finishRunAndVerify = function (scheduler, 
                                   id, 
                                   expectedRunningTimes) {
    scheduler.stop(id);
    assert.equal(totalRunningTimes, expectedRunningTimes, 
                 "actual: " + totalRunningTimes + " expected: " + expectedRunningTimes);
}
var runningIntervalInMs = 500;
var expectedRunningTimes = 3;
var id = scheduler.start(runningIntervalInMs);
setTimeout(finishRunAndVerify, runningIntervalInMs * expectedRunningTimes, scheduler, id,
           expectedRunningTimes);