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

// Define weights.
var smallWeight = 1;
var mediumWeight = 50;
var largeWeight = 100;
var blacklistedTags = ["infosec", "cybersecurity", "cyber", "happynewyear", "newyear", 
                     "socialmedia", "security", "hacking", "datasecurity", "news"];

PopularHashtag.update = function update(hashtagTrendModel, preDatetimeId, curDatetimeId) {
    var baselineTags = [];
    var newTags = [];
    findHashtags(hashtagTrendModel, preDatetimeId, function findNewTags(err, tags) {
        if (err) {
            console.log(err);
        } else {
            baselineTags = tags;
            findHashtags(hashtagTrendModel, curDatetimeId, mergeTags);
        }
    });
    function mergeTags(err, tags) {
        if (err) {
            console.log(err);
        } else {
            newTags = tags;
            PopularHashtag.compareAndUpdate(baselineTags, newTags, curDatetimeId);
        }
    }
}

var findHashtags = function findHashtags(hashtagTrendModel, dateInMilSecond, callback) {
    hashtagTrendModel
    .find({'timeBucketId': dateInMilSecond}, 'timeBucketId count name')
    .exec(callback);
}

PopularHashtag.compareAndUpdate = function compareAndUpdate(baselineTrends, newTrends, dateTimeInMilSeconds) {
    var nameCollections = [];
    for (var i = 0; i < baselineTrends.length; ++i) {
        nameCollections.push(baselineTrends[i].name);
    }
    console.log("oldTrends: " + baselineTrends.length);
    console.log("newTrends: " + newTrends.length);
    if (newTrends.length == 0) {
        newTrends = baselineTrends;
    }
    for (var i = 0; i < newTrends.length; ++i) {
        if (blacklistedTags.indexOf(newTrends[i].name) != -1) {
            // Skip.
            console.log("Skipping " + newTrends[i].name);
            continue;
        }
        var index = nameCollections.indexOf(newTrends[i].name);
        if (index == -1) {
            console.log("Add: " + newTrends[i].name);
            update(newTrends[i].name,
                   dateTimeInMilSeconds,
                   newTrends[i].count,
                   largeWeight + newTrends[i].count,
                   done);
        } else {
            var countDifference = newTrends[i].count - baselineTrends[index].count;
            if (countDifference > 0) {
                update(newTrends[i].name,
                       dateTimeInMilSeconds,
                       newTrends[i].count,
                       mediumWeight + countDifference,
                       done);
            }
        }
    }
    
    function done(err, res) {
        if (err) {
            console.log(err);
        }
    }
}

var update = function update(name, dateTimeInMilSeconds, count, weight, callback) {
    HashtagModel.update({name: name}, 
                        {$set: {
                            dateTimeInMilSeconds: dateTimeInMilSeconds, 
                            count: count, 
                            date: dateTimeInMilSeconds,
                            weight: weight}}, 
                        {upsert: true},
                        callback);    
}