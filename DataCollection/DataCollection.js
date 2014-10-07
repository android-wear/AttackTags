//Set env through "NODE_ENV=production node DataCollection.js",
//or "NODE_ENV=development node DataCollection.js".
var env = 
	process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'development' ?
		process.env.NODE_ENV : 'development';
// Set up twitter login credentials.
var twitterCredential = require('./TwitterCredentials.json')[env];
var TwitterAuth = require('../TwitterCrawler/twitterAuthToken.js');
var twitterAuthToken = new TwitterAuth(
	twitterCredential.consumerKey,
	twitterCredential.consumerSecret, 
	twitterCredential.accessTokenKey,
	twitterCredential.accessTokenSecret);

// Initialize twitter api.
var twitter = require('../TwitterCrawler/twitterCrawler.js');
var twitterApi = new twitter.TwitterApi();
twitterApi.on('error', function(err) {
	console.log("Log in failed: " + err + ", " + twitterAuthToken);
	process.exit(1);
});

// Get all users
var getScreenNames = function (userNameToScreenName) {
	if (!userNameToScreenName) {
		return [];
	}
	var screenNames = [];
	for (var i=0; i<userNameToScreenName.length; ++i) {
		screenNames.push(userNameToScreenName[i].screenName);
	}
	console.log(screenNames);
	return screenNames;
}

var twitterUserList = require('./TwitterUserList.json')[env];
var dataCollectionConfig = require('./DataCollectionConfigs.json')[env];
var twitterCrawler = new twitter.TwitterCrawler(
	twitterApi.withAuthToken(twitterAuthToken), getScreenNames(twitterUserList),
	dataCollectionConfig.maxTweetsPerCrawl);
twitterCrawler.on('error', function(err) {
	console.log(err);
});

// Write to file.
var fs = require('fs');
var writeToFile = function (fs, fileName, data) {
	console.log("writing " + fileName + data);
	fs.writeFile(filename, data, function (err) {
		if (err) {
			console.log("Failed to write: " + fileName);
		}
	});
}

var getFileName = function (root) {
	var date = new Date();
	return root + date.getUTCFullYear() + "_" + date.getUTCMonth() + "_" + date.getUTCDate() + 
	"_" + date.getHours() + "_" + date.getMinutes() + ".log";
}

var content = [];
twitterCrawler.on('data', function(screenName, data) {
	content.push(data);
});
twitterCrawler.on('done', function(counts) {
	writeToFile(fs, getFileName(), content);
	console.log(getFileName(dataCollectionConfig.logRootPath));
	content = [];
});

setInterval(twitterCrawler.crawl(), dataCollectionConfig.runningInterval);