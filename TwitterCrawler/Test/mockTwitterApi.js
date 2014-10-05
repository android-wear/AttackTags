var MockTwitterApi = function MockTwitterApi(fakeTweet, fakeNetworkDelaySeconds) {
    this.fakeTweet = fakeTweet;
    this.fakeNetworkDelaySeconds = fakeNetworkDelaySeconds ? fakeNetworkDelaySeconds : 1;
}

// Fake twitter login.
MockTwitterApi.prototype.login = function() {
    return;
}

// Fake the getUserTimeline.
MockTwitterApi.prototype.getUserTimeline = function(input, callback) {
    setTimeout(callback(this.fakeTweet), this.fakeNetworkDelaySeconds);
}

module.exports = MockTwitterApi;
