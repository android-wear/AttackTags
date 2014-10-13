var FileWriter = require('../PostDataCollectionActions/FileWriter.js');
var assert = require('assert');
var fs = require('fs');
var root = "./";
var writer = new FileWriter(root);
var fileName = writer.getFileName(root);
var testData = "test test";
writer.process(testData);
assert.equal(fs.existsSync(fileName), true, 
             "filename " + fileName + " exists.");
assert.notEqual(fileName.indexOf(".log"), -1);
fs.readFile(fileName, 'utf8', function(err, data) {
    // Do not expect any error.
    assert.ifError(err);
    assert.equal(data, testData);
    fs.unlink(fileName, function(err) {
        assert.ifError(err);
    });    
});

console.log("-----------PASSED-------------");