// TweetInNeo4j model logic.

var neo4j = require('node-neo4j');
var db = new neo4j(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://localhost:7474'
);
var maxQueryResultLimit = 200;
var defaultQueryResultLimit = 10;

var TweetInNeo4j = module.exports = function TweetInNeo4j(tweet) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this.tweet = tweet;
}

Object.defineProperty(TweetInNeo4j.prototype, "id", {
    get: function () { return this.tweet.id; }
});

Object.defineProperty(TweetInNeo4j.prototype, "text", {
    get: function () {
        return this.tweet.text;
    },
    set: function (val) {
        this.tweet.text = val;
    }
});

Object.defineProperty(TweetInNeo4j.prototype, "created_at", {
    get: function () {
        return this.tweet.created_at;
    }
});

Object.defineProperty(TweetInNeo4j.prototype, "favorites", {
    get: function () {
        return this.tweet.favorites;
    }
});

Object.defineProperty(TweetInNeo4j.prototype, "link", {
    get: function () {
        return this.tweet.link;
    }
});

// static methods:
// Sample query:
// match (n:Tweet) where n.text=~'.*(?i)privacy.*' and n.text=~'.*(?i)phone.*' 
// return n order by n.id DESC limit 3;
TweetInNeo4j.getTopNByKeywords = function (keywords, n, callback) {
    if (!keywords || keywords.length == 0 || !keywords[0]) {
        return callback(new Error("Keywords are null or empty."));
    }
    if (!n) {
        n = defaultQueryResultLimit;
    }
    if (n > maxQueryResultLimit) {
        return callback(new Error("n must be smaller than " + maxQueryResultLimit));
    }
    
    var query = TweetInNeo4j.getSearchByKeywordsQuery(keywords, n);
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
TweetInNeo4j.getTopRetweetedWithKeywords = function (keywords, reTweetedCount, callback) {
    if (!keywords || keywords.length == 0 || !keywords[0]) {
        return callback(new Error("Keywords are null or empty."));
    }
    if (!reTweetedCount) {
        reTweetedCount = 1;
    }
    var query = 
        TweetInNeo4j.getTopRetweetCountAndFilterByKeywordQuery(keywords, reTweetedCount);
    console.log(query);
    db.cypherQuery(query, function(err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
}

// Only returns tweets with a link.
// Sample query:
// MATCH (n:Tweet) where n.text is not null return n order by n.created_at DESC limit 2;
TweetInNeo4j.getTweets = function (startDate, endDate, callback) {
    var query = TweetInNeo4j.getTweetsQuery(startDate, endDate);
    console.log(query);
    if (!query) {
        return callback(new Error("query is invalid."));
    }
    db.cypherQuery(query, function(err, result) {
        if (err) {
            return callback(err);
        }
        var output = [];
        result.data.forEach(function(data) {
            var tweet = data[0];
            var url = data[1];
            output.push({
                id: tweet.id,             
                text: tweet.text,
                created_at: tweet.created_at,
                favorites: tweet.favorites,
                link: url
            });
        });
        callback(null, output);
    });
}

// Sample query:
// match (n:Tweet) where n.text=~'.*(?i)shell.*' and 
// n.text=~'.*(?i)vu.*'return n order by n.id DESC limit 3;
TweetInNeo4j.getSearchByKeywordsQuery = function (keywords, limit) {
    if (!keywords) {
        return null;
    }
    var searchKeywords = [].concat(keywords);
    var query = 
        "match (n:Tweet) where " + 
        TweetInNeo4j.whereClauseWithKeywords(searchKeywords);
    query += " return n order by n.id DESC limit " + limit + ";";
    return query;
}

TweetInNeo4j.getTopRetweetCountAndFilterByKeywordQuery = function (keywords, reTweetedCount) {
    if (!keywords) {
        return null;
    }
    var searchKeywords = [].concat(keywords);
    var query = 
        "MATCH ()-[r:RETWEETS]->(n) where " +
        TweetInNeo4j.whereClauseWithKeywords(searchKeywords) +
        " WITH n, count(r) as rel_cnt order by rel_cnt DESC" +
        " WHERE rel_cnt >= " + reTweetedCount + 
        " RETURN rel_cnt as retweetCount, n as tweet limit 1;";
    return query;
}

//MATCH (n:Tweet)-[k:CONTAINS]-(url:Link) where n.text is not null 
//return n,url order by n.id DESC limit 2;
TweetInNeo4j.getTweetsQuery = function (startDate, endDate) {
 if (!startDate || isNaN(startDate) || !endDate || isNaN(endDate)) {
     return null;
 }
 var query = 
     "MATCH (t:Tweet)-[k:CONTAINS]-(url:Link) where t.text is not null " + 
     "and STR(t.created_at) >= '"+ startDate + "' "+ 
     "and STR(t.created_at) <= '"+ endDate + "' return t,url.url;";
 return query;
}


TweetInNeo4j.whereClauseWithKeywords = function (keywords) {
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