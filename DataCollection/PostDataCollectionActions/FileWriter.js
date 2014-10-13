// A utility class to 1) get file name based on date/time, and
// 2) write data to disk.
var fs = require('fs');
var FileWriter = function FileWriter (root) {
    this.root = root;
}

FileWriter.prototype.process = function (data) {
    write(this.getFileName(this.root), data);
}

FileWriter.prototype.getFileName = function (root) {
    var date = new Date();
    return root + date.getUTCFullYear() + "_" + date.getUTCMonth() + "_" +
    date.getUTCDate() + "_" + date.getUTCHours() + "_" + date.getUTCMinutes() + 
    "_" + date.getUTCSeconds() + ".log";
}

var write = function (fileName, data) {
    console.log("writing data to: " + fileName);
    fs.writeFileSync(fileName, data, 'ascii');
}

module.exports = FileWriter;