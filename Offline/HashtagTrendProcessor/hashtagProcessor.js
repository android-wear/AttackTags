// Load hashtags from Neo4j to Mongodb.
var config = require('./config/config.json');
var env = process.env['NODE_ENV'] || 'development';
var debug = config[env].enableDebugLogging;
var port = config[env].port;
var uristring = config[env].uristring;
var skippableHashtags = config[env].skippableHashtags;

// neo4j references.
var neo4j = require('node-neo4j');
var db = new neo4j(config[env].neo4jConnectionString);

// Mongodb references.
var mongoose = require ('mongoose');
var HashtagTrend = require('./models/hashtagTrend.js');
var PopularHashtag = require('./models/popularHashtag.js');
var HashtagToTweet = require('./models/hashtagToTweet.js');
var async = require('async');

// Enable mongoose query level debugging for debug mode.
if (debug) {
    mongoose.set('debug', true);
}

// Runs getHashtagsForToday periodically. Mongodb connection
// will stay open.
mongoose.connect(uristring, function printTrace(err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        if (debug){
            console.log ('Succeeded connected to: ' + uristring);
        }
        setInterval(getHashtagsForToday,
                    config[env].runningIntervalInMs);
    }
});

//Today is the PST time 0:0:00 to 23:59:49.
var getHashtagsForToday = function getHashtagsForToday() {
    var startDateInMilSecond = getDateTimeInMilSeconds(0, true, false);
    var endDateInMilSecond = getDateTimeInMilSeconds(0, false, true);
    var query = getQuery(startDateInMilSecond, endDateInMilSecond, 
                         config[env].minFavoritesCount, 
                         config[env].minTweetCount);
    console.log(query);
    db.cypherQuery(query, function processData(err, result) {
        if (err) {
            console.log(err);
        } else {
            updateHashtagTrend(result.data, startDateInMilSecond);
        }
    });
}

// Generate a neo4j query for retrieving hashtag trends. 
var getQuery = function getQuery(startDate, endDate, minFavorites, minCounts) {
    if (!startDate || !endDate) {
        return null;
    }
    if (!minFavorites) {
        minFavorites = 0;
    }
    if (!minCounts) {
        minCounts = 0;
    }
    var query = 
        "match (n:Hashtag)-[r:TAGS]->(t:Tweet) where t.text is not null " + 
        "and t.favorites >= " + minFavorites + " and STR(t.created_at) >= '" + startDate +
        "' and STR(t.created_at) <= '" + endDate + "' with n, count(r) as cnt " + 
        "order by cnt DESC where cnt >= " + minCounts + " return n.name, cnt limit 20;";
    console.log(query);
    return query;
}

// Update the HashtagTrend document in mongodb.
var updateHashtagTrend = function updateHashtagTrend(hashtags, dateTimeInMilSeconds) {
    console.log("datetime: " + dateTimeInMilSeconds);
    if (!hashtags || !dateTimeInMilSeconds) {
        return;
    }
    //hashtags.forEach(function process(data) {
    for (var i = 0; i < hashtags.length; ++i) {
        var data = hashtags[i];
        var hashTagName = data[0];
        if (skippableHashtags.indexOf(hashTagName) != -1) {
            // Skip.
            continue;
        }
        HashtagToTweet.update(hashTagName, dateTimeInMilSeconds, 
                              hashTagToTweetMongoDone);
        // Update hashtag trend table, and then update popular hashtag table through the
        // updatePopularHashtags callback.
        // Skippable hashtags will not be written to the hashtag trend table, so they will
        // not show up in the popular hashtag table either.
        HashtagTrend.update({timeBucketId: dateTimeInMilSeconds, name: hashTagName},
                            {$set: {count: data[1], date: dateTimeInMilSeconds}},
                            {upsert: true},
                            updatePopularHashtags);        
    }
}

var updatePopularHashtags = function updatePopularHashtags(err, result) {
    if (err) {
        console.log("Err which would stop updating popular hashtags " + err);
    } else {
        var yesterdayBeginOfTheDay = getDateTimeInMilSeconds(-1, true, false);
        var beginOfTheDay = getDateTimeInMilSeconds(0, true, false);
        PopularHashtag.update(HashtagTrend, yesterdayBeginOfTheDay, beginOfTheDay,
                              updatePopularHashtagsDone);               
    }
}

var hashTagToTweetMongoDone = function hashTagToTweetMongoDone(err, result) {
    if (err) {
        console.log(err);
    }
}

var updatePopularHashtagsDone = function hashTagToTweetMongoDone(err, result) {
    if (err) {
        console.log(err);
    }
}
// Returns GMT time.
// delta is the difference to today. delta = 0 means get date time for 
// today.
// If beginningOfTheDay = true, it will set date time to the beginning of the day.
// If endOfTheDay = true, it will set date time to the end of the day.
var getDateTimeInMilSeconds = 
    function getDateTimeInMilSeconds(delta, beginningOfTheDay, endOfTheDay) {
    var date = new Date();
    date.setDate(date.getDate() + delta);
    if (beginningOfTheDay) {
        date.setHours(0,0,0,0);
        /*
        if (env == 'development') {
            return 1;
        }
        */
    } else if (endOfTheDay) {
        date.setHours(23,59,59,999);
        /*
        if (env == 'development') {
            return 9999999999999;
        }
        */
    }
    return date.getTime();
}