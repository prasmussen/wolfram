/**
 * Created by sander.struijk on 10.12.13.
 */
"use strict";
var should = require('should'),
    wordFactory = require('../../lib/hangman/hangman.wordfactory'),
    from = require('fromjs');

describe('hangman', function(){
    describe('wordFactory', function () {
        describe('createWord(string)', function () {
            it('should return a word object which has attributes and functions to manipulate and test the word', function () {
                //Arrange and Act
                var word = wordFactory.createWord('SKAPDØR subst');

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
                var word = wordFactory.createWord('SKAPDØR subst');

                //Act
                var match = word.matchChar('O');

                //Assert
                match.should.be.false;
                word.displayWord().should.eql('_ _ _ _ _ _ _');
            });
            it('should return true if char is matched in word, and displayWord should reveal all chars in string matching the char', function () {
                //Arrange
                var word = wordFactory.createWord('SKAPDØR subst');

                //Act
                var match = word.matchChar('S');

                //Assert
                match.should.be.true;
                word.displayWord().should.eql('S _ _ _ _ _ _');
            });
            it('should throw an exception when trying to match same char twice', function () {
                (function () {
                    var word = wordFactory.createWord('SKAPDØR subst');
                    var match = word.matchChar('S');
                    match = word.matchChar('S');
                }).should.throwError('Can not match the same char more then once.');
            });
            it('should return true if char is matched in word, and displayWord should reveal all chars in string matching the char', function () {
                //Arrange
                var word = wordFactory.createWord('SKAPTØS subst');

                //Act
                var match = word.matchChar('S');

                //Assert
                match.should.be.true;
                word.displayWord().should.eql('S _ _ _ _ _ S');
            });
            it('should return the word reveal when revealWord() is called', function () {
                var word = wordFactory.createWord('SKAR test');
                word.displayWord().should.eql('_ _ _ _');
                word.revealWord().should.eql('S K A R');
            });
        });
        describe('when the whole word has been matched', function () {
            it('word.solved() should return true', function () {
                //Arrange
                var word = wordFactory.createWord('SKAP subst');

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
                    var word = wordFactory.createWord('SKAP subst');
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
});