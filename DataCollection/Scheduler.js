// Set up twitter login credentials.
var Scheduler = function Scheduler(twitterCrawler, callbacks) {
    this.callbacks = callbacks;
    this.twitterCrawler = twitterCrawler;
    this.twitterCrawler.setMaxListeners(10);
}

var content = [];
var runOnce = function (twitterCrawler, callbacks) {
    twitterCrawler.on('data', function(screenName, data) {
        content.push(data);
	});
    twitterCrawler.on('done', function(counts) {
    	if (!callbacks) {
            return;
		}
    	console.log("processed names: " + counts);
        for (var i=0; i < callbacks.length; ++i) {
            // process tweets with callback function.
            callbacks[i](content);
        }
        twitterCrawler.removeAllListeners('data');
        twitterCrawler.removeAllListeners('done');
        content = [];
    });
    twitterCrawler.crawl();
}

Scheduler.prototype.start = function (runningInterval) {
    return setInterval(runOnce, runningInterval, this.twitterCrawler, this.callbacks);
}

Scheduler.prototype.stop = function (id) {
    clearInterval(id);
}

module.exports = Scheduler;