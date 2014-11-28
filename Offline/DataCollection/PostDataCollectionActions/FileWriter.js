// A utility class to 1) get file name based on date/time, and
// 2) write data to disk.
var fs = require('fs');
var assert = require('assert');
var FileWriter = function FileWriter (root, fileExtension) {
    this.root = root;
    this.fileExtension = !fileExtension ? ".json" : fileExtension;
}

FileWriter.prototype.process = function process (data) {
    return write(this.root, this.fileExtension, data);
}

var getFileName = function (root, fileExtension) {
    var date = new Date();
    return root + date.getUTCFullYear() + "_" + date.getUTCMonth() + 
    "_" + date.getUTCDate() + "_" + date.getUTCHours() + "_" + 
    date.getUTCMinutes() + "_" + date.getUTCMilliseconds() + "_" + 
    Math.floor(Math.random() * 1000 + 1) + fileExtension;
}

var write = function write (root, fileExtension, data) {
    if (!data) {
        return null;
    } else if (data instanceof Array) {
        var fileNameList = [];
        for (var i = 0; i < data.length; ++i) {
            fileNameList.push(write(root, fileExtension, data[i]));
        }
        return fileNameList;
    } else {
        var fileName = getFileName(root, fileExtension);
        console.log("writing data to: " + fileName);
        fs.writeFileSync(fileName, data, 'utf8');
        return fileName;
    }
}

module.exports = FileWriter;