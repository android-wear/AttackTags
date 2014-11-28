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
        return this.node.data["name"];
    },
    set: function (name) {
        this.node.data["name"] = name;
    }
});

Object.defineProperty(User.prototype, "location", {
    get: function () {
        return this.node.data["location"];
    },
    set: function (location) {
        this.node.data["location"] = location;
    }
});

Object.defineProperty(User.prototype, "followers", {
    get: function () {
        return this.node.data["followers"];
    },
    set: function (followers) {
        this.node.data["followers"] = followers;
    }
});

Object.defineProperty(User.prototype, "following", {
    get: function () {
        return this.node.data["following"];
    },
    set: function (followers) {
        this.node.data["following"] = followers;
    }
});

Object.defineProperty(User.prototype, "statuses", {
    get: function () {
        return this.node.data["statuses"];
    },
    set: function (statuses) {
        this.node.data["statuses"] = statuses;
    }
});

Object.defineProperty(User.prototype, "profile_image_url", {
    get: function () {
        return this.node.data["profile_image_url"];
    },
    set: function (profile_image_url) {
        this.node.data["profile_image_url"] = profile_image_url;
    }
});

// public instance methods:
/*
// calls callback w/ (err, following, others) where following is an array of
// users this user follows, and others is all other users minus him/herself.
User.prototype.getFollowingAndOthers = function (callback) {
    // query all users and whether we follow each one or not:
    var query = [
        'MATCH (user:User), (other:User)',
        'OPTIONAL MATCH (user) -[rel:follows]-> (other)',
        'WHERE ID(user) = {userId}',
        'RETURN other, COUNT(rel)', // COUNT(rel) is a hack for 1 or 0
    ].join('\n')

    var params = {
        userId: this.screen_name,
    };

    var user = this;
    db.query(query, params, function (err, results) {
        if (err) return callback(err);

        var following = [];
        var others = [];

        for (var i = 0; i < results.length; i++) {
            var other = new User(results[i]['other']);
            var follows = results[i]['COUNT(rel)'];

            if (user.screen_name === other.screen_name) {
                continue;
            } else if (follows) {
                following.push(other);
            } else {
                others.push(other);
            }
        }

        callback(null, following, others);
    });
};
*/
// static methods:

User.get = function (screen_name, callback) {
    db.readNodesWithLabelsAndProperties("User", {screen_name: screen_name}, function (err, node) {
        if (err) return callback(err);
        console.log(node);
        callback(null, new User(node));
    });
};

User.getAll = function (callback) {
    var query = [
        'MATCH (user:User)',
        'RETURN user',
    ].join('\n');

    db.query(query, null, function (err, results) {
        if (err) return callback(err);
        var users = results.map(function (result) {
            return new User(result['user']);
        });
        callback(null, users);
    });
};

// creates the user and persists (saves) it to the db, incl. indexing it:
User.create = function (data, callback) {
    // construct a new instance of our class with the data, so it can
    // validate and extend it, etc., if we choose to do that in the future:
    var node = db.createNode(data);
    var user = new User(node);

    // but we do the actual persisting with a Cypher query, so we can also
    // apply a label at the same time. (the save() method doesn't support
    // that, since it uses Neo4j's REST API, which doesn't support that.)
    var query = [
        'CREATE (user:User {data})',
        'RETURN user',
    ].join('\n');

    var params = {
        data: data
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        var user = new User(results[0]['user']);
        callback(null, user);
    });
};