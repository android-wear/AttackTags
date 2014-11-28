var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    assert = require('assert');

var DataImportUtil = function DataImportUtil(db, toBeProcessed, config) {
    this.db = db;
    this.toBeProcessed = toBeProcessed;
    this.processed = 0;
    this.idMap = [];
    this.content = [];
    this.config = config;
    // Register for event handling.
    EventEmitter.call(this);
}

//Enable event handling.
util.inherits(DataImportUtil, EventEmitter);

DataImportUtil.prototype.processTweetsForOneUser = 
    function processTweetsForOneUser(tweets, nodeLabel) {
    // nodeLabel cannot be null or empty.
    assert.notEqual(!nodeLabel, true, "nodeLabel cannot be null or empty.");
    if (!tweets) {
        this.emit("data", null);
        return;
    }
    if (!tweets || !tweets.length) {
        this.emit("data", null);
        return;
    }
    for (var i = 0; i < tweets.length; ++i) {
        processOneTweet(this, tweets[i], nodeLabel);
    }
}

var processOneTweet =  
    function processOneTweet(dataImportUtil, data, nodeLabel) {
    if (data.id && data.text && data.user.id 
            && dataImportUtil.idMap.indexOf(data.id) == -1) {
        dataImportUtil.idMap.push(data.id);
        dataImportUtil.db.readNodesWithLabelsAndProperties(
            nodeLabel, {id: data.id}, function(err, result){
            if(!err && (!result || result.length == 0)) {
                dataImportUtil.content.push(data);
            }
            ++dataImportUtil.processed;
            if (dataImportUtil.processed == dataImportUtil.toBeProcessed) {
                if (dataImportUtil.content.length != 0) {
                    if (dataImportUtil.config &&
                            dataImportUtil.config.enableDebugLogging) {
                        console.log("emitted " + 
                                    dataImportUtil.content.length + " tweets.");
                    }
                    dataImportUtil.emit("data", {tweets: dataImportUtil.content});
                } else {
                    dataImportUtil.emit("data", null);
                }
            }
        });         
    } else {
        ++dataImportUtil.processed;
        if (dataImportUtil.processed == dataImportUtil.toBeProcessed) {
            dataImportUtil.emit("data", {tweets: dataImportUtil.content});
        }
    }
}

module.exports=DataImportUtil;