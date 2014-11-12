var EventEmitter = require('events').EventEmitter;
var eventEmitter = new EventEmitter();
var assert = require('assert');
var toBeProcessed = 0;
var processTweets = function processTweets(db, tweets, nodeLabel) {
    // nodeLabel cannot be null or empty.
    assert.notEqual(!nodeLabel, true, "nodeLabel cannot be null or empty.");
    toBeProcessed = tweets.length;
    var processed = 0;
    var content = [];
    tweets.forEach(function(data) {
        if (data.id && data.text && data.user.id) {
            db.readNodesWithLabelsAndProperties(nodeLabel, {id: data.id}, function(err, result){
                if(!err && result == false) {
                    content.push(data);
                }
                ++processed;
                if (processed == toBeProcessed) {
                    toBeProcessed = 0;
                    console.log({tweets: content});
                    eventEmitter.emit("data", {tweets: content});
                }
            });
        } else {
            ++processed;
            if (processed == toBeProcessed) {
                toBeProcessed = 0;
                eventEmitter.emit("data", {tweets: content});
            }
        }
    });
}

module.exports.processTweets=processTweets;
module.exports.event=eventEmitter;