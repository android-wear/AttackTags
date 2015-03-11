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

var Tweet = module.exports = function Tweet(tweet) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this.tweet = tweet;
}

Object.defineProperty(Tweet.prototype, "id", {
    get: function () { return this.tweet.id; }
});

Object.defineProperty(Tweet.prototype, "text", {
    get: function () {
        return this.tweet.text;
    },
    set: function (val) {
        this.tweet.text = val;
    }
});

Object.defineProperty(Tweet.prototype, "createdTime", {
    get: function () {
        return this.tweet.createdTime;
    }
});

Object.defineProperty(Tweet.prototype, "favorites", {
    get: function () {
        return this.tweet.favorites;
    }
});

Object.defineProperty(Tweet.prototype, "link", {
    get: function () {
        return this.tweet.link;
    }
});

Object.defineProperty(Tweet.prototype, "weight", {
    get: function () {
        return this.tweet.weight;
    }
});

Object.defineProperty(Tweet.prototype, "category", {
    get: function () {
        return this.tweet.category;
    }
});

Tweet.getTweetsByCategoryAndDate = function getTweetsByCategory(category,                                                                
                                                                startTimeInMiliSec,
                                                                endTimeInMiliSec,
                                                                n,
                                                                callback) {
    if (!category || !n || n <= 0) {
        return callback("Empty category.");
    }
    TweetModel.where({'category': category})
              .where('createdTimeInMilSec').gte(startTimeInMiliSec)
              .lte(endTimeInMiliSec)
              .sort('-weight').limit(n)
              .exec(processData);
    
    function processData(err, tweetList) {
        if (err) {
            return callback(err);
        }
        
        return convertTweetModelToTweet(tweetList, callback);
    }
}

Tweet.getTweetById = function getTweetById(id, callback) {
    TweetModel.where('id').equals(id).exec(callback);
    function processData(err, tweetList) {
        if (err) {
            return callback(err);
        }
        
        return convertTweetModelToTweet(tweetList, callback);
    }    
}

var convertTweetModelToTweet = function convertTweetModelToTweet(tweetList, callback) {
    if (!tweetList) {
        return callback("Did not get any tweets from DB.");
    }
    var tweets = [];
    for (var i = 0; i < tweetList.length; ++i) {
        var t = tweetList[i];
        tweets.push(new Tweet({
            id: t.id,
            text: t.text,
            createdTime: t.createdTimeInMilSec,
            favorites: t.favorites,
            link: t.link,
            weight: t.weight,
            category: t.category
        }));
    }
    
    return callback(null, tweets);
}