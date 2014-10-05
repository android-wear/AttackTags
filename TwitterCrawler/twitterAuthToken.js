var TwitterAuthToken = function TwitterAuthToken(
    consumerKey, consumerSecret, accessTokenKey, accessTokenSecret) {
	this.consumerKey = consumerKey;
	this.consumerSecret = consumerSecret;
	this.accessTokenKey = accessTokenKey;
	this.accessTokenSecret = accessTokenSecret;
};

TwitterAuthToken.prototype.isValid = function() {
    if (!this.consumerKey || !this.consumerSecret || !this.accessTokenKey ||
	!this.accessTokenSecret) {
	return false;
    }
    return true;
}

module.exports = TwitterAuthToken;
