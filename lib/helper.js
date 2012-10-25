var sprintf = require("sprintf").sprintf;
var crypto = require("crypto");

function noop() {}

function log(type, message) {
    var d = new Date();
    var ts = sprintf("%04d-%02d-%02d %02d:%02d:%02d", d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
    console.log(sprintf("%s {%s} %s", ts, type, message));
}

function createId(str) {
    var shasum = crypto.createHash("sha1");
    shasum.update(str);
    return shasum.digest("hex");
}

module.exports = {
    noop: noop,
    log: log,
    createId: createId
}
