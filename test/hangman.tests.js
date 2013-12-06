/**
 * Created by sander.struijk on 05.12.13.
 */
var should = require('should'),
    hangman = require('../lib/hangman/hangman');

describe('hangman', function () {
    describe('init()', function () {
        it('should load all the words from file into dictionary', function (done) {
            hangman.init(function (ordliste) {
                //noinspection BadExpressionStatementJS
                ordliste.should.not.be.empty;
                done();
            });
        });
    });
    describe('functions', function () {
        hangman.init();
        describe('pickRandomWord(\'subst\')', function () {
            it('should return a random word from the dictionary', function () {
                var word = hangman.pickARandomWord('subst');
                word.should.not.be.null;
                word.should.not.be.undefined;
                word.word.should.not.be.undefined;
                word.type.should.not.be.undefined;
                word.type.should.eql('subst');
            });
        });
        describe('pickRandomWord(\'subst\') two times', function () {
            it('should not return the same word twice, in fact never!', function () {
                var firstWord = hangman.pickARandomWord('subst');
                var secondWord = hangman.pickARandomWord('subst');
                firstWord.should.not.be.eql(secondWord);
            });
        });
        describe('createWord(string)', function () {
            it('should return a word object which has attributes and functions to manipulate and test the word', function () {
                var word = hangman.privates.createWord('SKAPDØR subst');
                word.should.not.be.null;
                word.should.not.be.undefined;
                word.word.should.not.be.undefined;
                word.type.should.not.be.undefined;
                word.word.should.eql('SKAPDØR');
                word.type.should.eql('subst');
                word.solved.should.be.false;
            });
        });
    });
});
