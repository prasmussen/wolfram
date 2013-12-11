/**
 * Created by sander.struijk on 10.12.13.
 */
var thesaurus = require("thesaurus"),
    from = require('fromjs'),
    S = require('string');

module.exports = {
    ask: function(word, ctx){
        try {
            var synonymes = thesaurus.find(word);
            var synonymeString = S(from(synonymes).aggregate('', '(sw, w) => sw += w + ", "')).chompRight(', ').s;
            ctx.callback('Synonymes @ ' + word + ' => ' + synonymeString);
        } catch(e) {
            console.log(e);
        }
    }
}