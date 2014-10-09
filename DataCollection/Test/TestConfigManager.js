var ConfigManager = require('../ConfigManager.js');
var assert = require('assert');
var path = require('path');
var env_prod = "production";
var root = "../DataCollection/Configs";
var cm = new ConfigManager(root);
assert.equal(cm.getDataCollectionConfig(env_prod).logRootPath != '', true, "logRootPath is empty.");
assert.equal(cm.getTwitterCredential(env_prod).consumerKey != '', true, "consumerKey is empty.");
assert.equal(cm.getTwitterUserList(env_prod).length > 0, true, "twitter user list is empty.");
console.log("------PASSED----------");

