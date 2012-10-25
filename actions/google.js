var google = require("google");
var sprintf = require("sprintf").sprintf;

function _search(query, includeTitle, ctx) {
    google(query, function(err, next, links){
        if (err) {
            return console.error(err);
        }

        if (links.length > 0) {
            var first = links[0];
            var result = [];
            if (includeTitle) {
                result.push(sprintf("'%s' => %s", first.title, first.link));
            }
            result.push(first.description);
            ctx.callback(result);
        }
    });
}

function search(query, ctx) {
    _search(query, true, ctx);
}

function wikipedia(query, ctx) {
    query += sprintf("%s site:wikipedia.org", query);
    _search(query, false, ctx);
}

module.exports = {
    search: search,
    wikipedia: wikipedia
};
