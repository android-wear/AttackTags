// Create unique constraints, which also serves as index.
// To set up Db with url: NODE_ENV=url node SetupDb.js
// To set up constraints in a local Db: node SetupDb.js
// 
// To verify, run "neo4j-shell" from command line, then type "schema".
var neo4j = require('node-neo4j');
/*
var db = new neo4j(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://localhost:7474'
);
*/
var db = new neo4j(
                   'http://localhost:7474'
               );

var assert = require('assert');

var setupNodeWithConstraint = function (db, node, property) {
    db.createUniquenessContstraint(
        node, property, function(err, data) {
        assert.ifError(err);
        if (data == false) {
            console.log(
                "Constraint " + node + ":" + property +
                " already exists.");
        } else {
            console.log(data);
        }
    });
}

setupNodeWithConstraint(db, "Tweet", "id");
setupNodeWithConstraint(db, "User", "screen_name");
setupNodeWithConstraint(db, "Hashtag", "name");

