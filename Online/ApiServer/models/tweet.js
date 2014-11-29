// Tweet model logic.

var neo4j = require('node-neo4j');
var db = new neo4j(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://localhost:7474'
);
var maxQueryResultLimit = 20;
var defaultQueryResultLimit = 5;

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

Tweet.getTopNByKeywords = function (keywords, n, callback) {
    if (!keywords) {
        return callback("Searching keywords are null or empty.");
    }
    if (!n) {
        n = defaultQueryResultLimit;
    }
    if (n > maxQueryResultLimit) {
        return callback("Can only return 0 to maxQueryResultLimit tweets.");
    }
    
    var query = Tweet.getSearchByKeywordsQuery(keywords, n);
    if (!query) {
        return callback("Cannot generte a query from keywords: " + keywords);
    }
    db.cypherQuery(query, function(err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result.data);
    })
};

Tweet.getSearchByKeywordsQuery = function (keywords, limit) {
    if (!keywords) {
        return null;
    }
    var searchKeywords = [].concat(keywords);
    var query = "match (n:Tweet) where";
    var len = searchKeywords.length;
    for (var i = 0; i < len; ++i) {
        query += " n.text=~'.*" + searchKeywords[i] + ".*'";
        if (i != len - 1) {
            query += " and";
        }
    }
    query += " return n order by n.id DESC limit " + limit + ";";    
    return query;
}