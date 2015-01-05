var mongoose = require("mongoose");

// Schema for the tweet.
// Created 2 independent indexes on id and createdTimeInMilSec to 
// optimize searching by id or date range. Note this is different from
// the mongodb compound index which is a index on both fields.
// See Mongodb index intersection for details.
var tweetSchema = new mongoose.Schema({
    id: {
        type: Number,
        index: { unique: true }
    },
    text: {
        type: String
    },
    // Date when the record is created.
    createdTimeInMilSec: {
        type: Number,
        index: true
    },
    createdTime: {
        type: Date,
        'default': Date.now        
    },
    link: {
        type: String
    },
    favorites: {
        type: Number,
        min: 0,
        'default': 0        
    },
    weight: {
        type: Number,
        min: 0,
        'default': 0
    },
    // Category of the tweet. Tweet only belongs to one category.
    category: {
        type: String,
        enum: ['UNKNOWN', 'GENERAL', 'TRAINING', 'NEWS']
    }
});
var TweetModel = mongoose.model("Tweet", tweetSchema);

var Tweet = module.exports = function Tweet() {
}

Tweet.insertOrUpdate = function insertOrUpdate(tweetInNeo4j, callback) {
    if (!tweetInNeo4j) {
        return callback("Null or empty tweetInNeo4j object.");
    }
    if (!tweetInNeo4j.id || isNaN(tweetInNeo4j.id)) {
        return callback("Invalid id: " + tweetInNeo4j.id);
    }
    if (!tweetInNeo4j.created_at || isNaN(tweetInNeo4j.created_at)) {
        return callback("Invalid tweet created_at timestamp: " + 
                        tweetInNeo4j.created_at);
    }
    if (!tweetInNeo4j.favorites || isNaN(tweetInNeo4j.favorites)) {
        tweetInNeo4j.favorites = 0;
    }
    var weight = getTweetWeight(tweetInNeo4j);
    var category = getTweetCategory(tweetInNeo4j);
    
    TweetModel.update({id: tweetInNeo4j.id},
                      {$set: {
                          text: tweetInNeo4j.text,
                          createdTimeInMilSec: tweetInNeo4j.created_at,
                          createdTime: tweetInNeo4j.created_at,
                          link: tweetInNeo4j.link,
                          favorites: tweetInNeo4j.favorites,
                          weight: weight,
                          category: category}},
                      {upsert: true},
                      callback);
}

var getTweetWeight = function getTweetWeight(tweetInNeo4j) {
    if (!tweetInNeo4j || !tweetInNeo4j.favorites || 
            isNaN(tweetInNeo4j.favorites)) {
        return 0;
    }

    return tweetInNeo4j.favorites;
}

// Hardcode to GENERAL for now.
var getTweetCategory = function getTweetCategory(tweetInNeo4j) {
    if (!tweetInNeo4j) {
        return "GENERAL";
    }
    
    return "GENERAL";
 }