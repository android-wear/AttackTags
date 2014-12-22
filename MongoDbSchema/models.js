var mongoose = require("mongoose");
var Schema = mongoose.Schema;
// Table for images.
var imageSchema = new Schema({
    id: {
        type: Number, 
        min: 0,
        index: { unique: true }
    },
    url: {
        type: String, trim: true
    },
    width: {
        type: Number,
        min: 0
    },
    height: {
        type: Number,
        min: 0
    }
});
// Table for crawled images.
var CrawledImage = mongoose.model("CrawledImage", imageSchema);

//Schema for the hash tag.
var hashtagSchema = new Schema({
    name: {
        type: String,
        index: { unique: true }
    },
    count: {
        type: Number,
        min: 0
    },
    // Date when the record is created.
    date: {
        type: Date,
        'default': Date.now
    }, 
    weight: {
        type: Number,
        min: 0,
        'default': 0
    }
});
// Table for popular hashtags.
var PopularHashtag = mongoose.model("PopularHashtag", hashtagSchema);

// Hashtag trend history.
// Indexed by both timeBucketId.
// This is the intermediate table used for computing the 
// popularHashtagSchema table.
var hashtagTrendSchema = new Schema({
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
var HashtagTrend = mongoose.model("HashtagTrend", hashtagTrendSchema);

module.exports = {
    'CrawledImage': CrawledImage,
    'PopularHashtag': PopularHashtag,
    'HashtagTrend': HashtagTrend
}