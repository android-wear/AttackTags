var MockTwitterModule = 
    function MockTwitterModule(fakeTweet, fakeNetworkDelayMiliSeconds) {
    this.fakeTweet = fakeTweet;
    this.fakeNetworkDelayMiliSeconds = 
        fakeNetworkDelayMiliSeconds ? fakeNetworkDelayMiliSeconds : 1000;
}

// Fake twitter login.
MockTwitterModule.prototype.login = function() {
    return;
}

// Fake the getUserTimeline.
MockTwitterModule.prototype.getUserTimeline = function(input, callback) {
    var fakeTweet = this.fakeTweet;
    var fakeNetworkDelayMiliSeconds = this.fakeNetworkDelayMiliSeconds;
    setTimeout(function() {
        callback(fakeTweet);
    }, fakeNetworkDelayMiliSeconds);
}

module.exports = MockTwitterModule;
