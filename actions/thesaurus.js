/**
 * Created by sander.struijk on 10.12.13.
 */
var thesaurus = require("thesaurus"),
    from = require('fromjs'),
    S = require('string');

function ask(word, ctx) {
    try {
        var synonyms = thesaurus.find(word);
        var synonymsString = S(from(synonyms).aggregate('', '(sw, w) => sw += w + ", "')).chompRight(', ').s;
        ctx.callback('Synonyms @ ' + word + ' => ' + synonymsString);
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    ask: ask
}