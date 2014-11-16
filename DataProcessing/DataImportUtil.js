var EventEmitter = require('events').EventEmitter;
var eventEmitter = new EventEmitter();
var assert = require('assert');
var toBeProcessed = 0;
var processTweets = function processTweets(db, tweets, nodeLabel) {
    // nodeLabel cannot be null or empty.
    assert.notEqual(!nodeLabel, true, "nodeLabel cannot be null or empty.");
    toBeProcessed = tweets.length;
    var processed = 0;
    var valid = 0;
    var content = [];
    var idMap = [];
    if (!tweets) {
        eventEmitter.emit("data", null);
        return;
    }
    if (!tweets || !tweets.length) {
        eventEmitter.emit("data", null);
        return;
    }
    tweets.forEach(function(data) {
        if (data.id && data.text && data.user.id && idMap.indexOf(data.id) == -1) {
            idMap.push(data.id);
            db.readNodesWithLabelsAndProperties(nodeLabel, {id: data.id}, function(err, result){
                if(!err && (!result || result.length == 0)) {
                    ++valid;
                    content.push(data);
                }
                ++processed;
                if (processed == toBeProcessed) {
                    toBeProcessed = 0;
                    processed = 0;
                    if (content.length != 0) {
                        eventEmitter.emit("data", {tweets: content});
                    } else {
                        eventEmitter.emit("data", null);
                    }
                }
            });
        } else {
            ++processed;
            console.log(processed);
            if (processed == toBeProcessed) {
                toBeProcessed = 0;
                processed = 0;
                eventEmitter.emit("data", {tweets: content});
            }
        }
    });
}

module.exports.processTweets=processTweets;
module.exports.event=eventEmitter;