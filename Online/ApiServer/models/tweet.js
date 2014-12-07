// Tweet model logic.

var neo4j = require('node-neo4j');
var db = new neo4j(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://localhost:7474'
);
var maxQueryResultLimit = 200;
var defaultQueryResultLimit = 10;

// private constructor:
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
    }
});

Object.defineProperty(Tweet.prototype, "created_at", {
    get: function () {
        return this.tweet.created_at;
    }
});

Object.defineProperty(Tweet.prototype, "favorites", {
    get: function () {
        return this.tweet.favorites;
    }
});

// static methods:
// Sample query:
// match (n:Tweet) where n.text=~'.*(?i)privacy.*' and n.text=~'.*(?i)phone.*' 
// return n order by n.id DESC limit 3;
Tweet.getTopNByKeywords = function (keywords, n, callback) {
    if (!keywords || keywords.length == 0 || !keywords[0]) {
        return callback(new Error("Keywords are null or empty."));
    }
    if (!n) {
        n = defaultQueryResultLimit;
    }
    if (n > maxQueryResultLimit) {
        return callback(new Error("n must be smaller than " + maxQueryResultLimit));
    }
    
    var query = Tweet.getSearchByKeywordsQuery(keywords, n);
    if (!query) {
        return callback(new Error("Cannot generte a query from keywords: " + keywords));
    }
    db.cypherQuery(query, function(err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result.data);
    });
};

// Sample query:
// MATCH ()-[r:RETWEETS]->(n) 
// WHERE n.text=~'.*keyword.*'
// WITH n, count(r) as rel_cnt order by rel_cnt DESC
// WHERE rel_cnt > = 3
// RETURN n limit 1;
Tweet.getTopRetweetedWithKeywords = function (keywords, reTweetedCount, callback) {
    if (!keywords || keywords.length == 0 || !keywords[0]) {
        return callback(new Error("Keywords are null or empty."));
    }
    if (!reTweetedCount) {
        reTweetedCount = 1;
    }
    var query = 
        Tweet.getTopRetweetCountAndFilterByKeywordQuery(keywords, reTweetedCount);
    console.log(query);
    db.cypherQuery(query, function(err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
}

// Sample query:
// MATCH (n:Tweet) where n.text is not null return n order by n.created_at DESC limit 2;
Tweet.getLatestNTweets = function (n, callback) {
    if (!n) {
        n = defaultQueryResultLimit;
    }
    var query = Tweet.getLatestNTweetsQuery(n);
    console.log(query);
    db.cypherQuery(query, function(err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result.data);
    });    
}

// Sample query:
// match (n:Tweet) where n.text=~'.*(?i)shell.*' and 
// n.text=~'.*(?i)vu.*'return n order by n.id DESC limit 3;
Tweet.getSearchByKeywordsQuery = function (keywords, limit) {
    if (!keywords) {
        return null;
    }
    var searchKeywords = [].concat(keywords);
    var query = 
        "match (n:Tweet) where " + 
        Tweet.whereClauseWithKeywords(searchKeywords);
    query += " return n order by n.id DESC limit " + limit + ";";
    return query;
}

Tweet.getTopRetweetCountAndFilterByKeywordQuery = function (keywords, reTweetedCount) {
    if (!keywords) {
        return null;
    }
    var searchKeywords = [].concat(keywords);
    var query = 
        "MATCH ()-[r:RETWEETS]->(n) where " +
        Tweet.whereClauseWithKeywords(searchKeywords) +
        " WITH n, count(r) as rel_cnt order by rel_cnt DESC" +
        " WHERE rel_cnt >= " + reTweetedCount + 
        " RETURN rel_cnt as retweetCount, n as tweet limit 1;";
    return query;
}

//MATCH (n:Tweet) where n.text is not null return n order by n.created_at DESC limit 2;
Tweet.getLatestNTweetsQuery = function (n) {
    if (!n) {
        return null;
    }
    return "MATCH (n:Tweet) where n.text is not null return n" + 
           " order by n.id DESC limit " + n + ";";
}

Tweet.whereClauseWithKeywords = function (keywords) {
    if (!keywords) {
        return null;
    }
    var searchKeywords = [].concat(keywords);
    var query = "";
    var len = searchKeywords.length;
    for (var i = 0; i < len; ++i) {
        // Use (?i) to create a case insensitive query.
        query += "n.text=~'.*(?i)" + searchKeywords[i] + ".*'";
        if (i != len - 1) {
            query += " and ";
        }
    }
    return query;
}