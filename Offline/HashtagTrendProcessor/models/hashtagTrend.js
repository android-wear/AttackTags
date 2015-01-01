var mongoose = require("mongoose");

// Hashtag trend history.
// Indexed by both timeBucketId.
// This is the intermediate table used for computing the 
// popularHashtagSchema table.
var hashtagTrendSchema = new mongoose.Schema({
    // Records from the same day will have same time bucket id.
    timeBucketId: {
        type: String,
        index: true
    },
    name: {
        type: String
    },
    count: {
        type: Number
    },
});
// Table for hashtag trends.
var HashtagTrend = module.exports = mongoose.model("HashtagTrend", hashtagTrendSchema);