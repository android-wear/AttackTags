var assert = require('assert');
var Tweet = require('../tweet.js');
assert.equal(
    Tweet.getSearchByKeywordsQuery(["privacy", "phone"], 3), 
    "match (n:Tweet) where n.text=~'.*(?i)privacy.*' and n.text=~'.*(?i)phone.*'" + 
    " return n order by n.id DESC limit 3;");

assert.equal(
    Tweet.getSearchByKeywordsQuery("privacy", 3), 
    "match (n:Tweet) where n.text=~'.*(?i)privacy.*'" + 
    " return n order by n.id DESC limit 3;");

assert.equal(
    Tweet.whereClauseWithKeywords(["privacy", "phone"]),
    "n.text=~'.*(?i)privacy.*' and n.text=~'.*(?i)phone.*'");

assert.equal(
    Tweet.getLatestNTweetsQuery(3),
    "MATCH (n:Tweet) where n.text is not null return n order by n.id DESC limit 3;");
console.log("==========PASSED===============");