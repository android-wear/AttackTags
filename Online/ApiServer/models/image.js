var client = require('google-images');
//var defaultImageUrl = "http://www.habeyusa.com/wp-content/uploads/2012/12/Network-Security.jpg";
var defaultImageUrl = "/images/1.jpg";
var defaultWidth = 300;
var defaultHeight = 225;
var Image = module.exports = function Image(image) {
    this.image = image;
}

Object.defineProperty(Image.prototype, "url", {
    get: function() {
        return this.image.url;
    }
});

Object.defineProperty(Image.prototype, "unescapedUrl", {
    get: function() {
        return this.image.unescapedUrl;
    }
});

Object.defineProperty(Image.prototype, "width", {
    get: function() {
        return this.image.width;
    }
});

Object.defineProperty(Image.prototype, "height", {
    get: function() {
        return this.image.height;
    }
});

Image.getImage = function(target, callback) {
   var defaultImg = new Image({
        "url": defaultImageUrl,
        "unescapedUrl": defaultImageUrl,
        "width": defaultWidth,
        "height": defaultHeight
    });
    return callback(false, defaultImg);    
}