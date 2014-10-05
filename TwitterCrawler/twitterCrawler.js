var util = require('util'),
    twitter = require('twitter'),
    EventEmitter = require('events').EventEmitter;
/*
var twit = new twitter({
    consumer_key: 'Sf2w36x3LVCcD5T5POEzny6zl',
    consumer_secret: 'ZqGqFO5Hv2onOPkXOdpLqk4bu2CsFAAWXVWALBxAjDX0VZJW80',
    access_token_key: '22407058-heCtmNOiTym1yqADH0Vzg0kbBbBkuThfNsLkpPnBu',
    access_token_secret: 'NgfLW4RAXJCKEU8Jbrf3dutCy458Q0lLI50RxPMgMXHJS'
});

twit.login();
*/

var maxSupportedTweetsCount = 5;

// Emits 'error' event through this.validate(). 
// Emits 'data' event through this.crawlOneUser().
// Emits 'done' event when all tweets have been crawled.
var Crawler = function Crawler(twitterApi, screenNames, tweetsCount) {	
    this.twitterApi = twitterApi;
    this.screenNames = screenNames;
    this.tweetsCount = tweetsCount;
    this.processed = 0;
    this.maxToProcess = screenNames ? screenNames.length : 0;
    // Register for event handling.
    EventEmitter.call(this);
}

// Enable event handling.
util.inherits(Crawler, EventEmitter);

Crawler.prototype.validate = function() {
    if (!this.twitterApi || !this.screenNames || !this.tweetsCount || 
    		isNaN(this.tweetsCount)) {    	
		this.emit('error', new Error(
		    "twitterAuth or screenName or tweetsCount are null."));
		return false;
    }
    if (this.tweetsCount > maxSupportedTweetsCount) {
		this.emit('error', new Error(
		    "tweetsCount is larger than " + maxSupportedTweetsCount));
		return false;
    }
    return true;
}

// Crawl data from user (a.k.a. screenName) home page.
// Emit 'data' event with screenName and data.
var crawlOneUser = function(twitterApi, screenName, tweetsCount, crawler) {
    twitterApi.getUserTimeline(
		{screen_name:screenName, count:tweetsCount}, 
		function(data) {
		    crawler.processTweet(screenName, data);
		});
}

Crawler.prototype.processTweet = function(screenName, data) {
    if(!data) {
    	return;
    }
    this.emit('data', screenName, data);
    ++this.processed;
    if (this.processed == this.maxToProcess) {
    	this.emit('done', this.maxToProcess);
    }
}

// Crawl data from twitter.
Crawler.prototype.crawl = function() {
    if(!this.validate()) {
    	return;
    }
    this.twitterApi.login();
    for (var i=0; i<this.screenNames.length; ++i) {
    	crawlOneUser(this.twitterApi, this.screenNames[i], this.tweetsCount, this);
    }
}

// TwitterApi initializes the api with auth tokens.
// Emits 'error' event with error messages.
var TwitterApi = function TwitterApi(twitterAuth) {
    this.twitterAuth = twitterAuth;
    EventEmitter.call(this);
}

util.inherits(TwitterApi, EventEmitter);

TwitterApi.prototype.getApi = function() {
    if(!this.twitterAuth.isValid()) {
		this.emit('error', new Error("twitter tokens are not valid."));
		return null;
    }
    return new twitter({
        consumer_key: this.twitterAuth.consumerKey,
        consumer_secret: this.twitterAuth.consumerSecret,
        access_token_key: this.twitterAuth.accessTokenKey,
        access_token_secret: this.twitterAuth.accessTokenSecret});
}

module.exports.TwitterCrawler = Crawler;
module.exports.TwitterApi = TwitterApi;
