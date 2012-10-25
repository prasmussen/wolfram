var imdb = require('imdb-api');
var sprintf = require("sprintf").sprintf;

function search(title, ctx) {
    imdb.get(title, function(err, data) {
        if (err) {
            return ctx.callback(sprintf("Failed to get imdb info for '%s'", title));
        }
        ctx.callback(format(data));
    });
}

function lookup(id, ctx) {
    imdb.getById(id, function(err, data) {
        if (err) {
            return ctx.callback(sprintf("Failed to get imdb info for '%s'", title));
        }
        ctx.callback(format(data));
    });
}

function format(data) {
    var genres = data.genres.replace(/,/g, "/");
    var runtime = function() {
        var i = data.runtime.indexOf(",");
        return (i > -1) ? data.runtime.slice(0, i) : data.runtime;
    }();

    return [
        sprintf("Title: %s - Genre: %s - Rating: %s (%s)", data.title, genres, data.rating, data.votes),
        sprintf("Runtime: %s - Year: %s - Url: %s", runtime, data.year, data.imdburl)
    ];
}

module.exports = {
    search: search,
    lookup: lookup
};

