var util = require('util'),
    twitterModule = require('twitter'),
    EventEmitter = require('events').EventEmitter;

// Emits 'error' event through this.validate(). 
// Emits 'data' event through this.crawlOneUser().
// Emits 'done' event when all tweets have been crawled.
// tweetsPerUser: number of tweets to crawl per user.
// maxTweetsToCrawl: max number of tweets to crawl. See
// https://dev.twitter.com/rest/public/rate-limiting for details.
var Crawler = function Crawler(twitterModule, 
                               screenNames, 
                               tweetsPerUser, 
                               maxTweetsToCrawl) {    
    this.twitterModule = twitterModule;
    this.screenNames = screenNames;
    this.totalUserCount = screenNames ? screenNames.length : 0;    
    this.tweetsPerUser = tweetsPerUser;
    this.maxTweetsToCrawl = 
        maxTweetsToCrawl ?
            Math.min(maxTweetsToCrawl, 
                     tweetsPerUser * this.totalUserCount) :0;
    this.unprocessedUserCount = 0;
    this.processedTweetCount = 0;    
    this.lastCrawledUserIndex = 0;
    // Register for event handling.
    EventEmitter.call(this);
}

// Enable event handling.
util.inherits(Crawler, EventEmitter);

Crawler.prototype.validate = function() {
    if (!this.twitterModule || !this.screenNames || !this.tweetsPerUser || 
    		isNaN(this.tweetsPerUser)) {    	
		this.emit('error', new Error(
		    "twitterAuth or screenName or tweetsPerUser are null."));
		return false;
    }
    return true;
}

// Crawl data from user (a.k.a. screenName) home page.
// Emit 'data' event with screenName and data.
var crawlOneUser = function(twitterModule, screenName, tweetsPerUser, crawler) {
    console.log("crawling " + screenName);
	twitterModule.getUserTimeline(
		{screen_name:screenName, count:tweetsPerUser}, 
		function(data) {
		    crawler.processTweet(screenName, data);
		});
}

Crawler.prototype.processTweet = function(screenName, data) {
    if(!data) {
    	return;
    }
    this.emit('data', screenName, data);
    --this.unprocessedUserCount;
    if (this.unprocessedUserCount == 0) {
    	this.emit('done', this.processedTweetCount);
    }
}

// Crawl data from twitter.
Crawler.prototype.crawl = function() {
    if(!this.validate()) {
    	return;
    }
    this.twitterModule.login();
    var i = this.lastCrawledUserIndex;
    this.processedTweetCount = 0;
    this.unprocessedUserCount = 0;
    while (this.processedTweetCount + this.tweetsPerUser 
               <= this.maxTweetsToCrawl) {
        ++this.unprocessedUserCount;
        this.processedTweetCount += this.tweetsPerUser;
        crawlOneUser(
            this.twitterModule,
            this.screenNames[i],
            this.tweetsPerUser,
            this);
        i = (i + 1) % this.totalUserCount;
        console.log("i: " + i);
        console.log("total: " + this.totalUserCount);
    }
    this.lastCrawledUserIndex = i;
}

// Twitter initializes a twitter module with auth tokens.
// Call TwitterApi.withAuthToken(authToken) to get the twitter module.
// Emits 'error' event with error messages.
var TwitterApi = function TwitterApi() {
    EventEmitter.call(this);
}

util.inherits(TwitterApi, EventEmitter);

TwitterApi.prototype.withAuthToken = function(authToken) {
    if(!authToken.isValid()) {
		this.emit('error', new Error("twitter tokens are not valid."));
		return null;
    }
    return new twitterModule({
        consumer_key: authToken.consumerKey,
        consumer_secret: authToken.consumerSecret,
        access_token_key: authToken.accessTokenKey,
        access_token_secret: authToken.accessTokenSecret});
}

module.exports.TwitterCrawler = Crawler;
module.exports.TwitterApi = TwitterApi;
