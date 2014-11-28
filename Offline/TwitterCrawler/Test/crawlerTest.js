var TwitterAuth = require('../twitterAuthToken.js');
var twitter = require('../twitterCrawler.js');
var MockTwitterModule = require('./mockTwitterModule.js');
var testAuth = new TwitterAuth(
    'Sf2w36x3LVCcD5T5POEzny6zl',
    'ZqGqFO5Hv2onOPkXOdpLqk4bu2CsFAAWXVWALBxAjDX0VZJW80',
    '22407058-heCtmNOiTym1yqADH0Vzg0kbBbBkuThfNsLkpPnBu',
    'NgfLW4RAXJCKEU8Jbrf3dutCy458Q0lLI50RxPMgMXHJS');
var assert = require('assert');

// Verify the TwitterApi.
var testTwitterApi = new twitter.TwitterApi();
testTwitterApi.on('error', function(err){
    console.log("Failed to get twitter api.");
    process.exit(1);
});
testTwitterApi.withAuthToken(testAuth);

// Use the mock twitter api (a.k.a. MockTwitterApi) to verify the 
// TwitterCrawler.
var verifyTwitterCrawler = function(screenNames,
                                    testTweet,  // all users share the same test tweets
                                    maxTweetsToCrawl,
                                    expectedCrawledTweetCount) {
    var mockTwitterModule = new MockTwitterModule(testTweet, 1);
    var testTwitterCrawler = new twitter.TwitterCrawler(
    	mockTwitterModule, screenNames, 1, maxTweetsToCrawl);
    testTwitterCrawler
    .on('data', function(userName, data) {
        assert.notEqual(screenNames.indexOf(userName), -1,
                        "Unexpected user: " + userName);
        assert.deepEqual(data,
                         testTweet,
                         data + " not equals to " + testTweet);
    });
    testTwitterCrawler.on('done', function(actualCount) {
        assert.equal(actualCount,
                     expectedCrawledTweetCount, 
                     "crawled " + actualCount + " tweets, not equal" + 
                     " to " + expectedCrawledTweetCount);
    });
    testTwitterCrawler.crawl();
}

// Verify crawler crawled all the users.
verifyTwitterCrawler(["DmitriCyber"], "testtesttweet", 10, 1);
verifyTwitterCrawler(["testUser1", "testUser2", "testUser3"], 
                     "testtweet", 30, 3);
verifyTwitterCrawler(["testUser1", "testUser2", "testUser3", "user4"], 
                     "testtweet", 2, 2);