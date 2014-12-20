var mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
    id: {
        type: Number, 
        min: 0,
        index: { unique: true },
    },
    url: {
        type: String, trim: true
    },
    width: {
        type: Number,
        min: 0
    },
    height: {
        type: Number,
        min: 0
    }
});

var CrawledImage = mongoose.model("CrawledImage", imageSchema);

module.exports = CrawledImage;

