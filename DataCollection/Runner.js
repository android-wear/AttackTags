//Run "NODE_ENV=production node Runner.js" for production,
//or "NODE_ENV=development node Runner.js".
var env = 
	process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'development' ?
		process.env.NODE_ENV : 'development';
var ConfigManager = require('./ConfigManager.js');
var FileWriter = require('./PostDataCollectionActions/FileWriter.js');
var Twitter = require('../TwitterCrawler/twitterCrawler.js');
var Scheduler = require ('./Scheduler.js');

// Initialize configuration manager.
var configManager = new ConfigManager('../DataCollection/Configs');
var runnerConfigs = configManager.getDataCollectionConfig(env);

// Get twitter authentication token.
var twitterCredential = configManager.getTwitterCredential(env);
var TwitterAuth = require('../TwitterCrawler/twitterAuthToken.js');
var twitterAuthToken = new TwitterAuth(
	twitterCredential.consumerKey,
	twitterCredential.consumerSecret, 
	twitterCredential.accessTokenKey,
	twitterCredential.accessTokenSecret);

// Get all users from screen name config (TwitteruserList.json).
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

// Initialize twitter crawler.
var twitterApi = new Twitter.TwitterApi();
twitterApi.on('error', function(err) {
    console.log("Log in failed: " + err);
    process.exit(1);
});
var twitterCrawler = new Twitter.TwitterCrawler(
    twitterApi.withAuthToken(twitterAuthToken),
    getScreenNames(configManager.getTwitterUserList(env)),
    runnerConfigs.maxTweetsPerCrawl);
twitterCrawler.on('error', function(err) {
    console.log(err);
});

// Initialize post processors.
var fileWriter = new FileWriter(runnerConfigs.logRootPath);
var jsonFileWriterCallback = function(data) {
    var serializedData = JSON.stringify(data);
    fileWriter.process(serializedData);
}

// Start scheduler.
var callbacks = [];
callbacks.push(jsonFileWriterCallback);
var scheduler = new Scheduler(twitterCrawler, callbacks);
var finishRunAndVerify = function (scheduler, id) {
    scheduler.stop(id);
    var date = new Date();
    console.log("Completed this round at " + date.toDateString());
}
var id = scheduler.start(runnerConfigs.runningIntervalInMs);
setTimeout(finishRunAndVerify, 
           runnerConfigs.runningIntervalInMs * runnerConfigs.totalRounds, 
           scheduler, id);
