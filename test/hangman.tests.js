/**
 * Created by sander.struijk on 05.12.13.
 */
var should = require('should'),
    hangman = require('../lib/hangman/hangman'),
    from = require('fromjs');

describe('hangman', function () {

    describe('init()', function () {
        it('should load all the words from file into dictionary', function (done) {
            //Arrange and Act
            hangman.init('lib/hangman/ordliste.txt', function (ordliste) {
                //Assert
                ordliste.should.not.be.empty;
                done();
            });
        });
    });

    describe('functions', function () {

        before(function (done) {
            hangman.init('lib/hangman/ordliste_short.txt');
            done();
        });

        describe('pickRandomWord(\'subst\')', function () {
            it('should return a random word from the dictionary', function () {
                //Arrange and Act
                var word = hangman.pickARandomWord('subst');

                //Assert
                word.should.not.be.undefined;
                word.should.not.be.undefined;
                word.word.should.not.be.undefined;
                word.type.should.not.be.undefined;
                word.type.should.eql('subst');
            });
        });

        describe('pickRandomWord(\'subst\') two times', function () {
            it('should not return the same word twice, in fact never!', function () {
                //Arrange and Act
                var firstWord = hangman.pickARandomWord('subst');
                var secondWord = hangman.pickARandomWord('subst');

                //Assert
                firstWord.should.not.be.eql(secondWord);
            });
        });

        describe('createWord(string)', function () {
            it('should return a word object which has attributes and functions to manipulate and test the word', function () {
                //Arrange and Act
                var word = hangman.privates.createWord('SKAPDØR subst');

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
                var word = hangman.privates.createWord('SKAPDØR subst');

                //Act
                var match = word.matchChar('O');

                //Assert
                match.should.be.false;
                word.displayWord().should.eql('_ _ _ _ _ _ _');
            });
            it('should return true if char is matched in word, and displayWord should reveal all chars in string matching the char', function(){
                //Arrange
                var word = hangman.privates.createWord('SKAPDØR subst');

                //Act
                var match = word.matchChar('S');

                //Assert
                match.should.be.true;
                word.displayWord().should.eql('S _ _ _ _ _ _');
            });
            it('should throw an exception when trying to match same char twice', function(){
                (function(){
                    var word = hangman.privates.createWord('SKAPDØR subst');
                    var match = word.matchChar('S');
                    match = word.matchChar('S');
                }).should.throwError('Can not match the same char more then once.');
            });
            it('should return true if char is matched in word, and displayWord should reveal all chars in string matching the char', function(){
                //Arrange
                var word = hangman.privates.createWord('SKAPTØS subst');

                //Act
                var match = word.matchChar('S');

                //Assert
                match.should.be.true;
                word.displayWord().should.eql('S _ _ _ _ _ S');
            });
        });

        describe('when the whole word has been matched', function(){
            it('word.solved() should return true', function(){
                //Arrange
                var word = hangman.privates.createWord('SKAP subst');

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

            describe('and reset is called afterwards',function(){
                it('the word should be reset', function(){
                    //Arrange
                    var word = hangman.privates.createWord('SKAP subst');
                    var match = word.matchChar('S');
                        match = word.matchChar('K');
                        match = word.matchChar('A');
                        match = word.matchChar('P');
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
