var FileWriter = require('../PostDataCollectionActions/FileWriter.js');
var assert = require('assert');
var fs = require('fs');
var root = "./";
var writer = new FileWriter(root);

var runTest = function (writer, testData, 
                        expectedFileCounts,
                        expectedOutputs) {
    var files = writer.process(testData);
    if (expectedOutputs instanceof Array) {
        var mergedFiles = [];
        mergedFiles = mergedFiles.concat.apply(mergedFiles, files);        
        assert.equal(mergedFiles.length, 
                     expectedFileCounts, 
                     "lengths not equal.");
        for(var i = 0; i < expectedFileCounts; ++i) {
            console.log(mergedFiles[i]);
            verify(writer, expectedOutputs[i], mergedFiles[i]);
        }
    } else {
        verify(writer, expectedOutputs, files);
    }
}

// Verifies file name pattern.

var verify = function (writer, expectedContent, fileName) {
    assert.equal(fs.existsSync(fileName), true,
                 "file: " + fileName + " not exists.");
    fs.readFile(fileName, 'utf8', function(err, data) {
        // Do not expect any error.
        assert.ifError(err);
        assert.equal(data, expectedContent, 
                     "expected: " + expectedContent + " actual: " + data);
        console.log("remove file: " + fileName);
        fs.unlink(fileName, function(err) {
            assert.ifError(err);
        });    
    });    
}

runTest(writer, "test test", 1, "test test");
runTest(writer, ["test message 1", "test message 2"], 2, 
        ["test message 1", "test message 2"])
runTest(writer, [["test message 1", "test message 2"]], 2, 
        ["test message 1", "test message 2"])

console.log("-----------PASSED-------------");