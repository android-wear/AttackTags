var TwitterAuth = require('../twitterAuthToken.js');
var twitter = require('../twitterCrawler.js');
var MockTwitterApi = require('./mockTwitterApi.js');
var testAuth = new TwitterAuth(
    'Sf2w36x3LVCcD5T5POEzny6zl',
    'ZqGqFO5Hv2onOPkXOdpLqk4bu2CsFAAWXVWALBxAjDX0VZJW80',
    '22407058-heCtmNOiTym1yqADH0Vzg0kbBbBkuThfNsLkpPnBu',
    'NgfLW4RAXJCKEU8Jbrf3dutCy458Q0lLI50RxPMgMXHJS');

// Verify the TwitterApi.
var testTwitterApi = new twitter.TwitterApi();

testTwitterApi.on('error', function(err){
    console.log("Failed to get twitter api.");
    process.exit(1);
});
testTwitterApi.withAuthToken(testAuth);

// Use the mock twitter api (a.k.a. MockTwitterApi) to verify the TwitterCrawler.
var verifyTwitterCrawler = function(screenNames, count) {
    var testTweet = "testtest";
    var mockApi = new MockTwitterApi(testTweet, 1000);
    var testTwitterCrawler = new twitter.TwitterCrawler(
        mockApi, screenNames, count);
    testTwitterCrawler
    .on('data', function(userName, data) {
	if (screenNames.indexOf(userName) == -1 ) {
	    console.log("Unexpected user: " + name + " not in " +
			screenNames);
	    process.exit(1);
        }
	if (data != testTweet) {
	    console.log("Fetched tweet: " + data + " not equal to expected: " +
			testTweet);
	    process.exit(1);
        }
    });
    testTwitterCrawler.on('done', function(actualCount) {
	if (actualCount != count) {
	    console.log(
		"actual screened: " + actualCount + 
		" not equal to expected: " + count);
	    process.exit(1);
	} else {
	    console.log("----------PASSED---------");
	}
    });
    testTwitterCrawler.crawl();
}

// Verify crawler crawled all the users.
verifyTwitterCrawler(["DmitriCyber"], 1);
verifyTwitterCrawler(["testUser1", "testUser2", "testUser3"], 3);
