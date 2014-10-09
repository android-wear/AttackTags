var path = require('path');
var ConfigManager = function ConfigManager(root) {
	this.root = root;
	this.twitterCredential = require(path.join(root, 'TwitterCredentials.json'));
	this.twitterUserList = require(path.join(root, 'TwitterUserList.json'));
	this.dataCollectionConfig = require(path.join(root, 'DataCollectionConfigs.json'));
}

ConfigManager.prototype.getTwitterCredential = function(env) {
	return this.twitterCredential[env];
}

ConfigManager.prototype.getTwitterUserList = function(env) {
	return this.twitterUserList[env];
}

ConfigManager.prototype.getDataCollectionConfig = function(env) {
	return this.dataCollectionConfig[env];
}

module.exports = ConfigManager;