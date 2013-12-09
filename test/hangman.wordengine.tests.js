/**
 * Created by sander.struijk on 06.12.13.
 */
"use strict";
var should = require('should'),
    wordEngine = require('../lib/hangman/hangman.wordengine'),
    from = require('fromjs'),
    assert = require('assert');

describe('wordEngine', function () {
    describe('public', function () {
        describe('pickARandomWord(type)', function () {
            it('should return a random word from the wordlist', function () {
                //Arrange and Act
                var word = wordEngine.pickARandomWord('test');

                //Assert
                word.should.not.be.undefined
                word.should.be.an.Object;
                word.word.should.not.be.empty;
                word.type.should.not.be.undefined;
                word.type.should.eql('test');
            });
            it('should not return the same word twice, in fact never!', function () {
                //Arrange and Act
                var firstWord = wordEngine.pickARandomWord('test');
                //wordEngine.privates.printDebug();
                var secondWord = wordEngine.pickARandomWord('test');
                //wordEngine.privates.printDebug();

                //Assert
                firstWord.should.not.be.eql(secondWord);
            });
            it('should pick 4 words in the list!', function () {
                var words = [];
                for (var i = 0; i < 4; i++) {
                    words.push(wordEngine.pickARandomWord('test'));
                }
                words.length.should.eql(4);
                for (var i = 0; i < 4; i++) {
                    var w = words[i];
                    w.should.not.be.undefined;
                }
            });
        });
    });
    describe('private', function () {
        describe('wordFactory', function () {
            describe('createWord(string)', function () {
                it('should return a word object which has attributes and functions to manipulate and test the word', function () {
                    //Arrange and Act
                    var word = wordEngine.privates.wordFactory.createWord('SKAPDØR subst');

                    //Assert
                    word.should.not.be.null;
                    word.should.not.be.undefined;
                    word.word.should.not.be.undefined;
                    word.type.should.not.be.undefined;
                    word.word.should.eql('SKAPDØR');
                    word.type.should.eql('subst');
                    word.solved().should.be.false;
                    word.displayWord().should.eql('_ _ _ _ _ _ _');
                    word.matchedChars.should.be.empty;
                });
            });
            describe('word.matchChar(c)', function () {
                it('should return false if char is not matched in word, and displayWord should return a string witch no matches for char', function () {
                    //Arrange
                    var word = wordEngine.privates.wordFactory.createWord('SKAPDØR subst');

                    //Act
                    var match = word.matchChar('O');

                    //Assert
                    match.should.be.false;
                    word.displayWord().should.eql('_ _ _ _ _ _ _');
                });
                it('should return true if char is matched in word, and displayWord should reveal all chars in string matching the char', function () {
                    //Arrange
                    var word = wordEngine.privates.wordFactory.createWord('SKAPDØR subst');

                    //Act
                    var match = word.matchChar('S');

                    //Assert
                    match.should.be.true;
                    word.displayWord().should.eql('S _ _ _ _ _ _');
                });
                it('should throw an exception when trying to match same char twice', function () {
                    (function () {
                        var word = wordEngine.privates.wordFactory.createWord('SKAPDØR subst');
                        var match = word.matchChar('S');
                        match = word.matchChar('S');
                    }).should.throwError('Can not match the same char more then once.');
                });
                it('should return true if char is matched in word, and displayWord should reveal all chars in string matching the char', function () {
                    //Arrange
                    var word = wordEngine.privates.wordFactory.createWord('SKAPTØS subst');

                    //Act
                    var match = word.matchChar('S');

                    //Assert
                    match.should.be.true;
                    word.displayWord().should.eql('S _ _ _ _ _ S');
                });
            });
            describe('when the whole word has been matched', function () {
                it('word.solved() should return true', function () {
                    //Arrange
                    var word = wordEngine.privates.wordFactory.createWord('SKAP subst');

                    //Act
                    var match = word.matchChar('S');
                    match.should.be.true;
                    match = word.matchChar('K');
                    match.should.be.true;
                    match = word.matchChar('A');
                    match.should.be.true;
                    match = word.matchChar('P');
                    match.should.be.true;

                    //Assert
                    word.displayWord().should.eql('S K A P');
                    word.matchedChars.length.should.eql(4);
                    word.solved().should.be.true;
                    from(word.anonymousWord).all('$.matching === true').should.be.true;
                });
                describe.skip('and reset is called afterwards', function () {
                    it('the word should be reset', function () {
                        //Arrange
                        var word = wordEngine.privates.wordFactory.createWord('SKAP subst');
                        word.matchChar('S');
                        word.matchChar('K');
                        word.matchChar('A');
                        word.matchChar('P');
                        word.displayWord().should.eql('S K A P');
                        word.solved().should.be.true;
                        from(word.anonymousWord).all('$.matching').should.be.true;

                        //Act
                        word.reset();

                        //Assert
                        word.displayWord().should.eql('_ _ _ _');
                        word.solved().should.be.false;
                        from(word.anonymousWord).all('!$.matching').should.be.true;
                    });
                });
            });
        });
        describe('io', function () {
            before(function () {
                wordEngine.privates.io.init();
            });
            describe('getFilePathMatchingType(type)', function () {
                it('should return the path containing the type in its filename.', function () {
                    var path = wordEngine.privates.io.getFilePathMatchingType('subst');
                    path.should.eql('lib/hangman/wordlists/subst.nor.wordlist.txt');
                });
            });
            describe('getLine(type, line_no, callback)', function () {
                it('should return the line at line number from a text file.', function () {
                    var path = wordEngine.privates.io.getFilePathMatchingType('test');
                    var index = wordEngine.privates.io.getRandomLineNumber({type: 'test'});
                    var word = wordEngine.privates.io.getLine(path, index);
                    assert.notEqual(word, 'undefined');
                });
                describe('getRandomLineNumber(option)', function () {
                    it('should return a random number between 0 and 4 provided type', function () {
                        var index = wordEngine.privates.io.getRandomLineNumber({type: 'test'});
                        assert.notEqual(index, 'undefined');
                        assert.notEqual(index, 'NaN');
                    });
                    it('should return a random number between 0 and 4 provided path', function () {
                        var path = wordEngine.privates.io.getFilePathMatchingType('test');
                        var index = wordEngine.privates.io.getRandomLineNumber({path: path});
                        index.should.be.within(0, 4);
                    });
                });
                describe('getLineCount(path)', function () {
                    var path = wordEngine.privates.io.getFilePathMatchingType('test');
                    var count = wordEngine.privates.io.getLineCount(path);
                    count.should.be.eql(4);
                });
            });
        });
    });
});