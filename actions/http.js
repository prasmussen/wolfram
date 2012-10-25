var request = require("request");
var sprintf = require("sprintf").sprintf;
var decode = require("entities").decodeHTML5;

function clean(title) {
    return decode(title)
        .replace(/\r?\n/g, "")
        .replace("\n", "");
}

function title(url, ctx) {
    var titlePattern = /<title>([^<]+)<\/title>/im;
    var found = false;
    var data = "";

    request(url).on("data", function(chunk) {
        if (found) {
            return;
        }
        data += chunk.toString();
        var match = titlePattern.exec(data);
        if (match && match.length > 1) {
            found = true;
            ctx.callback(sprintf("[%s]", clean(match[1])));
        }
    });
}

function head(url, ctx) {
    request.head(url, function(err, res) {
        if (err) {
            return;
        }
        var lines = [];
        var headers = res.headers;
        for (var name in headers) {
            if (headers.hasOwnProperty(name)) {
                var value = headers[name];
                lines.push(sprintf("%s: %s", name, value));
            }
        }
        ctx.callback(lines);
    });
}

module.exports = {
    title: title,
    head: head
};
