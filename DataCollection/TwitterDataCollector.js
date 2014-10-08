// Set up twitter login credentials.
var TwitterDataCollector = function TwitterDataCollector(twitterCrawler, callbacks) {
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

TwitterDataCollector.prototype.run = function (runningInterval) {
	return setInterval(runOnce(this.twitterCrawler, [], this.callbacks), runningInterval);
}

TwitterDataCollector.prototype.stop = function (id) {
	clearInterval(id);
}

module.exports = TwitterDataCollector;