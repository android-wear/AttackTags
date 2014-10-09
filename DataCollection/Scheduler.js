// Set up twitter login credentials.
var Scheduler = function Scheduler(twitterCrawler, callbacks) {
    this.callbacks = callbacks;
    this.twitterCrawler = twitterCrawler;		
}

var runOnce = function (twitterCrawler, content, callbacks) {
    twitterCrawler.on('data', function(screenName, data) {
        content.push(data);
	});
    twitterCrawler.on('done', function(counts) {
    	if (!callbacks) {
            return;
		}
        for (var i=0; i < callbacks.length; ++i) {
            // process tweets with callback function.
            callbacks[i](content);
        }
    });
    twitterCrawler.crawl();
}

Scheduler.prototype.start = function (runningInterval) {
    return setInterval(runOnce(this.twitterCrawler, [], this.callbacks), runningInterval);
}

Scheduler.prototype.stop = function (id) {
    clearInterval(id);
}

module.exports = Scheduler;