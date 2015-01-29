var mongoose = require("mongoose");
var config = require('../config/config.json');
var env = process.env['NODE_ENV'] || 'development';

//Schema for the hash tag.
var hashtagToTweetSchema = new mongoose.Schema({
    dateTimeInMilSeconds: {
        type: Number        
    },
    name: {
        type: String
    },
    // Date when the record is created.
    date: {
        type: Date,
        'default': Date.now
    }, 
    tweetId: {
        type: Number,
        min: 0,
        'default': 0
    }
});
hashtagToTweetSchema.index({dateTimeInMilSeconds: 1, name: 1});
// Table for popular hashtags.
var HashtagToTweetModel = mongoose.model("HashtagToTweet", hashtagToTweetSchema);

// Neo4j. TODO: move this to a separate js.
var neo4j = require('node-neo4j');
var db = new neo4j(config[env].neo4jConnectionString);


var HashtagToTweet = module.exports = function HashtagToTweet() {
}

HashtagToTweet.update = function update(hashtagName, dateTimeInMs,
                                        callback) {
    var query = 
        "match (h:Hashtag)-[]-(t:Tweet) where h.name= '" + hashtagName + "' " + 
        "and STR(t.created_at) >= '" + dateTimeInMs + "' return t.id;";
    console.log(query);
    db.cypherQuery(query, function processData(err, result) {
        if (err) {
            console.log(err);
        } else {
            HashtagToTweet.updateMongoDb(hashtagName,
                                         result.data,
                                         dateTimeInMs,
                                         callback);
        }
    });
}

HashtagToTweet.updateMongoDb = function updateMongoDb(hashtagName, 
                                                      tweetIdList,
                                                      dateTimeInMs, 
                                                      callback) {
    tweetIdList.forEach(updateTable);
    function updateTable(tweetId) {
        HashtagToTweetModel.update(
            {name: hashtagName, dateTimeInMilSeconds: dateTimeInMs, tweetId: Number(tweetId)},
            {$set: {date: dateTimeInMs}},
            {upsert: true},
            callback);
    }
}
