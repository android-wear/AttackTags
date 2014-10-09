var twitter = require('../../TwitterCrawler/twitterCrawler.js');
var MockTwitterModule = require('../../TwitterCrawler/Test/mockTwitterModule.js');
var Scheduler = require ('../Scheduler.js');

var testTweet = "testtest";
var mockTwitterModule = new MockTwitterModule(testTweet, 1000);
var testTwitterCrawler = new twitter.TwitterCrawler(
	mockTwitterModule, ["DmitriCyber"], 1);
var verify = function(content) {
	if (content.length == 1 && content[0] == testTweet) {
		console.log("-----PASSED------");
	} else {
		console.log("-----FAILED------");
		process.exit(1);
	}
}
var callbacks = [];
callbacks.push(verify);
var scheduler = new Scheduler(testTwitterCrawler, callbacks);
var id = scheduler.start(100);
scheduler.stop(id);
