var mongoose = require("mongoose");

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

var HashtagToTweet = module.exports = function HashtagToTweet() {
}

/**
 * Returns {tweetId : 12345}.
 */
HashtagToTweet.getTweetId = function getTweetId(hashtag, startTimeInMs, endTimeInMs, callback) {
    HashtagToTweetModel.where('name').equals(hashtag)
                       .where('dateTimeInMilSeconds').gte(startTimeInMs).lte(endTimeInMs)
		       .select('-_id tweetId' /* deselects _id. returns {tweetId : 12345} */)
                       .exec(callback);
}
