var mongoose = require("mongoose");

//Schema for the hash tag.
var hashtagSchema = new mongoose.Schema({
    dateTimeInMilSeconds: {
        type: Number        
    },
    name: {
        type: String
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
hashtagSchema.index({dateTimeInMilSeconds: 1, name: 1}, {unique: true});
// Table for popular hashtags.
var HashtagModel = mongoose.model("PopularHashtag", hashtagSchema);

var PopularHashtag = module.exports = function PopularHashtag() {
}

PopularHashtag.getTags = function getTags(callback) {
    PopularHashtag.getTagsFromTimeRange(
         // Start date sets to 3 days ago.
         getDateTimeInMilSeconds(-1),
         getDateTimeInMilSeconds(0),
         callback);
}

PopularHashtag.getTagsFromTimeRange = function getTagsFromTimeRange(
    startDate, endDate, callback) {
    HashtagModel.where('dateTimeInMilSeconds').gte(startDate).lte(endDate)
                .sort('-weight').exec(callback);
}

//Returns GMT time.
//delta is the difference to today. delta = 0 means get date time for 
//today.
//If beginningOfTheDay = true, it will set date time to the beginning of the day.
//If endOfTheDay = true, it will set date time to the end of the day.
var getDateTimeInMilSeconds = function getDateTimeInMilSeconds(delta) {
    var date = new Date();
    date.setDate(date.getDate() + delta);
    // Set to beginning of the day.
    date.setHours(0,0,0,0);
    return date.getTime();
}
