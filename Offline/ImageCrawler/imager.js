var client = require('google-images');
client.search("hi my friend", function(err, content) {
    content.forEach(function(img) {
        console.log(img.url);
    });
});

