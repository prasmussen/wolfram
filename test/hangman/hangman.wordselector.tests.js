/**
 * Created by sander.struijk on 06.12.13.
 */
"use strict";
var should = require('should'),
    wordSelector = require('../../lib/hangman/hangman.wordselector');

describe('wordFactory', function () {
    describe('public', function () {
        describe('pickARandomWord(type)', function () {
            it('should return a random word from the wordlist', function () {
                //Arrange and Act
                var word = wordSelector.pickARandomWord('test');

                //Assert
                word.should.not.be.undefined
                word.should.be.an.Object;
                word.word.should.not.be.empty;
                word.type.should.not.be.undefined;
                word.type.should.eql('test');
            });
            it('should not return the same word twice, in fact never!', function () {
                //Arrange and Act
                var firstWord = wordSelector.pickARandomWord('test');
                //wordFactory.privates.printDebug();
                var secondWord = wordSelector.pickARandomWord('test');
                //wordFactory.privates.printDebug();

                //Assert
                firstWord.should.not.be.eql(secondWord);
            });
            it('should pick 4 words in the list!', function () {
                var words = [];
                for (var i = 0; i < 4; i++) {
                    words.push(wordSelector.pickARandomWord('test'));
                }
                words.length.should.eql(4);
                for (var i = 0; i < 4; i++) {
                    var w = words[i];
                    w.should.not.be.undefined;
                }
            });
        });
    });
});