var client = require('google-images');
var mongoose = require ('mongoose');
var config = require('./config/config.json');
var CrawledImage = require('./models/crawledImage.js');
var env = process.env['NODE_ENV'] || 'development';
var port = config[env].port;
var uristring = config[env].uristring;
var debug = config[env].enableDebugLogging;

mongoose.connect(uristring, function printTrace(err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else if (debug){
        console.log ('Succeeded connected to: ' + uristring);
    }
});

var ImageCrawler = module.exports = function ImageCrawler() {
}

// Crawl only when tweet does not exist.
ImageCrawler.crawl = function crawl(id, text, callback) {
    lookup(id, text, crawlImage, callback);
}

// Check if the tweet exists.
var lookup = function lookup(id, text, crawl, callback) {
    var query = CrawledImage.find({"id": id});
    query.findOne(find);
    function find(err, found) {
        if (err) {
            console.log("Failed to query Mongo with id " + id);
        }
        if (!found) {
            crawl(id, text, callback);
        } else {
            if (debug) {
                console.log("Entry " + id + " already exists.");
            }
        }
    }
}

// Crawl image and then save to db.
var crawlImage = function crawlImage(id, text, callback) {
    client.search(text, save);
    function save(err, imageList) {
        if (err) {
            return callback(err);
        }
        if (err || !imageList || imageList.length == 0 || 
            !imageList[0].url || !imageList[0].width || !imageList[0].height) {
            if (debug) {
                console.log("No image returned from google.");
            }
            return callback(false);
        }
        
        var selected = null;
        for (var i = 1; i < imageList.length; ++i) {
            if (imageList[i].width > 200 && 
                    imageList[i].height < 400) {
                selected = imageList[i];
                break;
            }
        }        
        if (!selected) {
            if (debug) {
                console.log("No valid image.");
            }
            return callback(false);
        }
        // Save to the database.
        var crawledImage = new CrawledImage({
            id: id,
            url: selected.unescapedUrl,
            width: parseInt(selected.width), 
            height: parseInt(selected.height)
        });
        crawledImage.save(function print(err) {
            if (err) {
                console.log("Failed to save image with id " + id);
                return callback(err);
            }
        });
        return callback("crawling succeeded.");
    }
}