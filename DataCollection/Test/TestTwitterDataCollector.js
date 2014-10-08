var twitter = require('../../TwitterCrawler/twitterCrawler.js');
var MockTwitterModule = require('../../TwitterCrawler/Test/mockTwitterModule.js');
var TwitterDataCollector = require ('../TwitterDataCollector.js');

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
var twitterDataCollector = new TwitterDataCollector(testTwitterCrawler, callbacks);
var id = twitterDataCollector.run(100);
twitterDataCollector.stop(id);
