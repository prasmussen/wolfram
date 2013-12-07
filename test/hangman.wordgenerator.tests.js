/**
 * Created by sander.struijk on 06.12.13.
 */
"use strict";
var should = require('should'),
    wordGenerator = require('../lib/hangman/hangman.wordengine'),
    from = require('fromjs');

describe.only('wordGenerator', function () {

    describe('functions', function () {
        describe('pickRandomWord(type)', function () {
            it('should return a random word from the wordlist', function () {
                //Arrange and Act
                var word = wordGenerator.pickARandomWord('subst');

                //Assert
                word.should.not.be.undefined;
                word.should.not.be.undefined;
                word.word.should.not.be.undefined;
                word.type.should.not.be.undefined;
                word.type.should.eql('subst');
            });
            it('should not return the same word twice, in fact never!', function () {
                //Arrange and Act
                var firstWord = wordGenerator.pickARandomWord('subst');
                //wordGenerator.privates.printDebug();
                var secondWord = wordGenerator.pickARandomWord('subst');
                //wordGenerator.privates.printDebug();

                //Assert
                firstWord.should.not.be.eql(secondWord);
            });
            it('should pick all the 4 words in the list!', function () {
                for (var i = 0; i < 4; i++) {
                    wordGenerator.pickARandomWord('subst');
                }
            });
        });

        describe('privates', function () {
            describe('createWord(string)', function () {
                it('should return a word object which has attributes and functions to manipulate and test the word', function () {
                    //Arrange and Act
                    var word = wordGenerator.privates.createWord('SKAPDØR subst');

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
                    var word = wordGenerator.privates.createWord('SKAPDØR subst');

                    //Act
                    var match = word.matchChar('O');

                    //Assert
                    match.should.be.false;
                    word.displayWord().should.eql('_ _ _ _ _ _ _');
                });
                it('should return true if char is matched in word, and displayWord should reveal all chars in string matching the char', function () {
                    //Arrange
                    var word = wordGenerator.privates.createWord('SKAPDØR subst');

                    //Act
                    var match = word.matchChar('S');

                    //Assert
                    match.should.be.true;
                    word.displayWord().should.eql('S _ _ _ _ _ _');
                });
                it('should throw an exception when trying to match same char twice', function () {
                    (function () {
                        var word = wordGenerator.privates.createWord('SKAPDØR subst');
                        var match = word.matchChar('S');
                        match = word.matchChar('S');
                    }).should.throwError('Can not match the same char more then once.');
                });
                it('should return true if char is matched in word, and displayWord should reveal all chars in string matching the char', function () {
                    //Arrange
                    var word = wordGenerator.privates.createWord('SKAPTØS subst');

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
                    var word = wordGenerator.privates.createWord('SKAP subst');

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
                        var word = wordGenerator.privates.createWord('SKAP subst');
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
            describe('getFilePath(type)', function () {
                it('should return the path containing the type in its filename.', function () {
                    var path = wordGenerator.privates.getFilePath('subst');
                    path.should.eql('lib/hangman/ordliste.subst.txt');
                });
            });
            describe('getLine(type, line_no, callback)', function () {
                it('should return the line at line number from a text file.', function () {
                    wordGenerator.privates.getLine('subst', 10, function (err, line) {
                        if (err) throw err;
                        if (!line) throw new Error('returned a blank line.');
                    });
                });
            });
            describe('splitOnNewLines(data)', function () {
                it('should split multiple lines into an array of lines.', function () {
                    var arrayOfSplitLines = wordGenerator.privates.splitOnNewLines('LINE 1\nLINE 2\nLINE 3');
                    arrayOfSplitLines.length.should.eql(3);
                    arrayOfSplitLines[0].should.eql('LINE 1');
                });
                it('should split multiple lines into an array of lines.', function () {
                    var arrayOfSplitLines = wordGenerator.privates.splitOnNewLines('LINE 1\r\nLINE 2\r\nLINE 3');
                    arrayOfSplitLines.length.should.eql(3);
                    arrayOfSplitLines[0].should.eql('LINE 1');
                });
            });
            describe('createAnonymousWord(word)', function () {
                it('should return an anonymous word object', function () {
                    var aw = wordGenerator.privates.createAnonymousWord('WORD');
                    aw.should.be.an.instanceOf(Array);
                    aw.length.should.eql(4);
                    var c = aw[0];
                    c.anonymousChar.should.eql('_');
                    c.realChar.should.eql('W');
                    c.matching.should.be.false;
                });
            });
            describe('getRandomIndex(count, pickedIndexes)', function () {
                it('should return a random number between 0 and (count - 1) that does not exist in pickedIndexes.', function () {
                    var index = wordGenerator.privates.getRandomIndex(5, [0, 1, 2, 3]);
                    index.should.eql(4);
                });
                it('should return a random number between 0 and 4', function () {
                    var index = wordGenerator.privates.getRandomIndex(5, []);
                    index.should.be.within(0, 4);
                });
            });
            describe.skip('updateLineCount(type)', function () {
                wordGenerator.privates.updateLineCount('adv', ['lib/hangman/ordliste.adv.txt'], function (lineCount) {
                    lineCount.should.be.above(0);
                });
            });
        });
    });
});