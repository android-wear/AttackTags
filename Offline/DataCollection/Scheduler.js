var Scheduler = function Scheduler(crawler, callbacks) {
    this.callbacks = callbacks;
    this.crawler = crawler;
    this.crawler.setMaxListeners(10);
}

var content = [];
var runOnce = function (crawler, callbacks) {
    crawler.on('data', function(screenName, data) {
        content.push(data);
	});
    crawler.on('done', function(counts) {
    	if (!callbacks) {
            return;
		}
    	console.log("processed " + counts + ".");
        for (var i=0; i < callbacks.length; ++i) {
            callbacks[i](content);
        }
        crawler.removeAllListeners('data');
        crawler.removeAllListeners('done');
        content = [];
    });
    crawler.crawl();
}

Scheduler.prototype.start = function (runningInterval) {
    runOnce(this.crawler, this.callbacks);
    return setInterval(runOnce,
                       runningInterval,
                       this.crawler,
                       this.callbacks);
}

Scheduler.prototype.stop = function (id) {
    clearInterval(id);
}

module.exports = Scheduler;