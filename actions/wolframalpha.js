var request = require("request");
var sprintf = require("sprintf").sprintf;
var decode = require("entities").decodeHTML5;

var appid;

function init(ctx) {
    appid = ctx.config.actions.wolframalpha.appid;
}

function getUrl(query) {
    query = encodeURIComponent(query);
    return sprintf("http://api.wolframalpha.com/v2/query?appid=%s&input=%s&format=plaintext", appid, query);
}

function parseXML(data) {
    var re = /<plaintext>([\s\S]*?)<\/plaintext>/g;
    var results = [];
    var match;
    while (match = re.exec(data)) {
        if (match && match[1] !== "") {
            var text = decode(match[1])
                .replace(/  \|  /g, ", ")
                .replace(/ \| /g, ": ")
                .replace(/\n/g, " | ");
            results.push(text);
        }
    }
    return results.slice(1, 2);
}

function search(query, ctx) {
    var url = getUrl(query);
    request(url, function(err, res, body) {
        var result = parseXML(body);
        if (result.length > 0) {
            ctx.callback(result);
        }
    });
}

module.exports = {
    init: init,
    search: search
};
