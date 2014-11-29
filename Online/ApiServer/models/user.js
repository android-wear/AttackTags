// User model logic.

var neo4j = require('node-neo4j');
var db = new neo4j(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://localhost:7474'
);

// private constructor:

var User = module.exports = function User(node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this.node = node;
}

Object.defineProperty(User.prototype, "screen_name", {
    get: function () { return this.node.screen_name; }
});

Object.defineProperty(User.prototype, "name", {
    get: function () {
        return this.node.name;
    }
});

Object.defineProperty(User.prototype, "location", {
    get: function () {
        return this.node.location;
    }
});

Object.defineProperty(User.prototype, "followers", {
    get: function () {
        return this.node.followers;
    }
});

Object.defineProperty(User.prototype, "following", {
    get: function () {
        return this.node.following;
    }
});

Object.defineProperty(User.prototype, "statuses", {
    get: function () {
        return this.node.statuses;
    }
});

Object.defineProperty(User.prototype, "profile_image_url", {
    get: function () {
        return this.node.profile_image_url;
    }
});

// static methods:
User.get = function (screen_name, callback) {
    db.readNodesWithLabelsAndProperties("User", {screen_name: screen_name}, function (err, node) {
        if (err) return callback(err);
        callback(null, new User(node));
    });
};