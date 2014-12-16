var Image = require('../image.js');
var assert = require('assert');
Image.getImage({"text": "hello my friend"}, function(err, image) {
    assert.ifError(err);
    if (!image) {
        throw new Error("image is not valid.");
    }
    if (!image.url) {
        throw new Error("image.url is not valid.");
    }
    console.log(image);
    assert.equal(image.width > 0, true, "width is 0.");
    assert.equal(image.height > 0, true, "height is 0.");
});