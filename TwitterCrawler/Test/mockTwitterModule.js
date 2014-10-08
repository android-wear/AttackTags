var MockTwitterModule = function MockTwitterModule(fakeTweet, fakeNetworkDelaySeconds) {
    this.fakeTweet = fakeTweet;
    this.fakeNetworkDelaySeconds = fakeNetworkDelaySeconds ? fakeNetworkDelaySeconds : 1;
}

// Fake twitter login.
MockTwitterModule.prototype.login = function() {
    return;
}

// Fake the getUserTimeline.
MockTwitterModule.prototype.getUserTimeline = function(input, callback) {
    setTimeout(callback(this.fakeTweet), this.fakeNetworkDelaySeconds);
}

module.exports = MockTwitterModule;
