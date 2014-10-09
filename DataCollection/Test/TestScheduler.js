var twitter = require('../../TwitterCrawler/twitterCrawler.js');
var MockTwitterModule = require('../../TwitterCrawler/Test/mockTwitterModule.js');
var Scheduler = require ('../Scheduler.js');
var assert = require('assert');

var testTweet = "testtest";
var mockTwitterModule = new MockTwitterModule(testTweet, 1000);
var testTwitterCrawler = new twitter.TwitterCrawler(
	mockTwitterModule, ["DmitriCyber"], 1);
var verify = function(content) {
	assert.equal(content.length, 1, "Should only return one tweet.");
	assert.equal(content[0], testTweet, "Tweet should be equal to " + testTweet);
	console.log("-----PASSED------");
}

var callbacks = [];
callbacks.push(verify);
var scheduler = new Scheduler(testTwitterCrawler, callbacks);
var id = scheduler.start(100);
scheduler.stop(id);
