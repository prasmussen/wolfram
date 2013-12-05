/**
 * Created by sander.struijk on 05.12.13.
 */
var should = require('should'),
    hangman = require('../lib/hangman/hangman');

describe('hangman', function () {
    describe('init()', function () {
        it('should load all the words from file into dictionary', function (done) {
            hangman.init(function (ordliste) {
                ordliste.should.not.be.empty;
                done();
            });
        });
    });
    describe('function', function () {
        hangman.init();
        describe('pickRandomWord()', function () {
            it('should return a random word from the dictionary', function () {
                var word = hangman.pickRandomWord('subst');
                word.should.not.be.null;
                word.word.should.not.be.undefined;
                word.type.should.not.be.undefined;
            });
        });
    });
});
