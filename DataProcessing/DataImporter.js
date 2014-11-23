var env = process.env['NODE_ENV'] || 'development';
console.log(env);
var config = require('./Configs/DataProcessingConfigs.json');
var neo4j = require('node-neo4j');
var db = new neo4j(config[env].neo4jConnectionString);
//var tweets = require('/home/yang/logs/twitterTestLogs/2014_10_1_1_50_307_148.json');
var fs = require('fs');
var DataImportUtil = require('./DataImportUtil');
var async = require('async');
var query = 
['UNWIND {tweets} AS t',
 '   WITH t',
 '   ORDER BY t.id',
 '    WITH t,',
 '       t.entities AS e,',
 '       t.user AS u,',
 '       t.retweeted_status AS retweet',
 '',
 '  MERGE (tweet:Tweet {id:t.id})',
 '  SET tweet.text = t.text,',
 '      tweet.created_at = t.created_at,',
 '      tweet.favorites = t.favorite_count',
 '  MERGE (user:User {screen_name:u.screen_name})',
 '  SET user.name = u.name,',
 '      user.location = u.location,',
 '      user.followers = u.followers_count,',
 '      user.following = u.friends_count,',
 '      user.statuses = u.statusus_count,',
 '      user.profile_image_url = u.profile_image_url',
 '  MERGE (user)-[:POSTS]->(tweet)',
 '  MERGE (source:Source {name:t.source})',
 '  MERGE (tweet)-[:USING]->(source)',
 '  FOREACH (h IN e.hashtags |',
 '    MERGE (tag:Hashtag {name:LOWER(h.text)})',
 '    MERGE (tag)-[:TAGS]->(tweet)',
 '  )',
 '  FOREACH (u IN e.urls |',
 '    MERGE (url:Link {url:u.expanded_url})',
 '    MERGE (tweet)-[:CONTAINS]->(url)',
 '  )',
 '  FOREACH (m IN e.user_mentions |',
 '    MERGE (mentioned:User {screen_name:m.screen_name})',
 '    ON CREATE SET mentioned.name = m.name',
 '    MERGE (tweet)-[:MENTIONS]->(mentioned)',
 '  )',
 '  FOREACH (r IN [r IN [t.in_reply_to_status_id] WHERE r IS NOT NULL] |',
 '    MERGE (reply_tweet:Tweet {id:r})',
 '    MERGE (tweet)-[:REPLY_TO]->(reply_tweet)',
 '  )',
 '  FOREACH (retweet_id IN [x IN [retweet.id] WHERE x IS NOT NULL] |',
 '      MERGE (retweet_tweet:Tweet {id:retweet_id})',
 '      MERGE (tweet)-[:RETWEETS]->(retweet_tweet)',
 '  )'].join("\n");

function processFile(fileToBeProcessed, cleanupFileName, cleanup) {
    if (fileToBeProcessed
        .indexOf(".json", fileToBeProcessed.length - ".json".length) == -1) {
        console.log(fileToBeProcessed + " is not a json file.");
        return;
    }
    console.log("Processing + " + fileToBeProcessed);
    try {
        var logs = require(fileToBeProcessed);
        async.each(logs, function(item, done) {
            var dataImportUtil = 
                new DataImportUtil(db, item.length, config[env]);
            dataImportUtil.setMaxListeners(config[env].maxEventListenerCount);
            dataImportUtil.processTweetsForOneUser(item, 'Tweet');
            dataImportUtil.on("data", function(tweetsForOneUser) {
                dataImportUtil.removeAllListeners('data');
                if (tweetsForOneUser) {
                    if (config[env].enableDebugLogging == true) {
                        tweetsForOneUser["tweets"].forEach(function(data) {
                            console.log("Got data event. Writing " + 
                                        data.user.screen_name + 
                                        ", tweet: " + data.id); 
                         });
                    }
                    db.cypherQuery(query, tweetsForOneUser, function(err, res) {
                        if (config[env].enableDebugLogging == true) {                        
                            tweetsForOneUser["tweets"].forEach(function(data) {
                                console.log("Writing to db: " + 
                                            data.user.screen_name +
                                            ", tweet: " + data.id); 
                             });
                        }
                        if (err) {
                            console.log("err!");
                            console.log(fileToBeProcessed);
                            console.log(err);
                            return done(null);
                        }
                    });
                }
            });
            return done();
        }, function(err) {
            if (cleanup && !err) {
                console.log("moved to " + cleanupFileName);
                fs.renameSync(
                    fileToBeProcessed,
                    cleanupFileName);
                console.log("Done processing: " + 
                            fileToBeProcessed);
            }
            if (err) {
                console.log("Processing error: " + err);
                console.log(cleanupFileName);
                fs.exists(cleanupFileName, function(exists) {
                    if (exists) {
                        console.log("Moving file: " +
                                    cleanupFileName + " back to " +
                                    fileToBeProcessed);
                        fs.renameSync(
                            cleanupFileName, fileToBeProcessed);                        
                    }
                });
            }
        });
    } catch (e) {
        console.log(e);
    }
}

var run = function run(root) {
    console.log("Start runner... ");
    var fileNames = fs.readdirSync(root);
    var fileToBeProcessed = '';
    for (var i = 0; i < fileNames.length; ++i) {
        if (fs.lstatSync(root + fileNames[i]).isDirectory()) {
            console.log("Skipping dir.");
            continue;
        }
        if (fileNames[i].indexOf(".json", fileToBeProcessed.length - ".json".length) 
                != -1) {
            fileToBeProcessed = fileNames[i];
            break;
        }
    }
    if (fileToBeProcessed) {
        processFile(
            root + fileToBeProcessed,
            root + "Processed/" + fileToBeProcessed,
            config[env].cleanUpFileAfterProcessing);
    } else {
        console.log("Folder is empty. No file to process.");
    }
}

var root = config[env].logRootPath;
// Set listerner count.
//dataImportUtil.event.setMaxListeners(config[env].maxEventListenerCount);
run(root);
setInterval(run,
            config[env].runningIntervalInMs,
            root);