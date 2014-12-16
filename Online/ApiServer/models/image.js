var client = require('google-images');
var defaultImageUrl = "http://www.habeyusa.com/wp-content/uploads/2012/12/Network-Security.jpg";
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
    client.search(target.text, function(err, imageList) {
        if (err) {
            return callback(err);
        }
        var defaultImg = new Image({
            "url": defaultImageUrl,
            "unescapedUrl": defaultImageUrl,
            "width": defaultWidth,
            "height": defaultHeight
        }); 
        if (err || !imageList || imageList.length == 0 || 
            !imageList[0].url || !imageList[0].width || !imageList[0].height) {
            return callback(false, defaultImg);
        }
        var img = defaultImg;
        for (var i = 1; i < imageList.length; ++i) {
            if (imageList[i].width > 200 && 
                    imageList[i].height < 400) {
                img = imageList[i];
                break;
            }
        }
        return callback(false, new Image({
            "url": img.url,
            "unescapedUrl": img.unescapedUrl,
            "width": parseInt(img.width), 
            "height": parseInt(img.height)
        }));
    });
}