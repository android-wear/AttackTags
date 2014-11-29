var assert = require('assert');
var Tweet = require('../tweet.js');
assert.equal(
    Tweet.getSearchByKeywordsQuery(["privacy", "phone"], 3), 
    "match (n:Tweet) where n.text=~'.*privacy.*' and n.text=~'.*phone.*'" + 
    " return n order by n.id DESC limit 3;");

assert.equal(
    Tweet.getSearchByKeywordsQuery("privacy", 3), 
    "match (n:Tweet) where n.text=~'.*privacy.*'" + 
    " return n order by n.id DESC limit 3;");

console.log("==========PASSED===============");