// App references.
var config = require('./config/config.json');
var env = process.env['NODE_ENV'] || 'development';
var debug = config[env].enableDebugLogging;
var port = config[env].port;
var uristring = config[env].uristring;

// neo4j references.
var neo4j = require('node-neo4j');
var neo4jDb = new neo4j(
                        process.env['NEO4J_URL'] ||
                        process.env['GRAPHENEDB_URL'] ||
                        'http://localhost:7474'
                    );
var db = new neo4j(config[env].neo4jConnectionString);

// Mongodb references.
var mongoose = require ('mongoose');
var PopularHashtag = require('../../MongoDbSchema/models.js').PopularHashtag;
var HashtagTrend = require('../../MongoDbSchema/models.js').HashtagTrend;

// Connect to mongodb.
mongoose.connect(uristring, function printTrace(err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        if (debug){
            console.log ('Succeeded connected to: ' + uristring);
        }
        getHashtagsForToday();
    }
});

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
        "and t.favorites >= " + minFavorites + " and STR(t.created_at) > '" + startDate +
        "' and STR(t.created_at) < '" + endDate + "' with n, count(r) as cnt " + 
        "order by cnt DESC where cnt >= " + minCounts + " return n.name, cnt limit 20;";
    return query;
}

var updateHashtagTrend = function updateHashtagTrend(hashtags, timestamp) {
    if (!hashtags || !timestamp) {
        return;
    }
    hashtags.forEach(function process(data) {
        console.log({timeBucketId: timestamp, name: data[0]});
        HashtagTrend.findOne({timeBucketId: timestamp, name: data[0]}, found);
    });
    function found(err, hashtagTrend) {
        console.log("hahaha");
        console.log("err " + err);
        console.log("found :" + hashtagTrend);
    }
}

// Today is the PST time 0:0:00 to 23:59:49.
var getHashtagsForToday = function getHashtagsForToday() {
    var startDate = new Date();
    startDate.setHours(0,0,0,0);
    var endDate = new Date();
    endDate.setHours(23,59,59,999);
    //var query = getQuery(startDate.getTime(), endDate.getTime());
    var query = getQuery(1419049079000, endDate.getTime());
    db.cypherQuery(query, function processData(err, result) {
        if (err) {
            console.log(err);
        } else {
            updateHashtagTrend(result.data, startDate);
        }
    });
}