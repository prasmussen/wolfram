/**
 * Created by sander.struijk on 10.12.13.
 */
var thesaurus = require('../actions/thesaurus'),
    should = require('should');

describe('TheSaurus', function () {
    describe('Find(word)', function () {
        describe('where word is "generator"', function () {
            it('should return a string with synonyms separated with comma and space', function () {
                thesaurus.ask('generator', {req: {source: {nick: 'myNick' }}, callback: function (str) {
                    str.should.not.be.empty;
                    str.should.eql('Synonyms @ generator => apparatus, setup, engine, source, author, maker, shaper, electronic device');
                }});
            });
        });
    });
});