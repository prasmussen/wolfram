/**
 * Created by sander.struijk on 05.12.13.
 */
"use strict";
var hangman = require('../lib/hangman/hangman'),
    should = require('should');

describe('hangman', function () {
    describe('init()', function () {
        it('wordGenerator should be initialized', function (done) {
            //Arrange and Act
            hangman.init('lib/hangman/ordliste_short.txt', function (wordlist) {
                //Assert
                wordlist.should.not.be.empty;
                done();
            });
        });
    });

    describe('start()', function () {
        it('should start a new game', function () {
            var response = hangman.start('subst');
            response.should.include('New game started! guess the word: ');
        });
        it('should throw an error if start() is called while a game is ongoing.', function(){
            (function(){
                hangman.start('subst');
            }).should.throwError('Can not start a new game while already playing, stop or end game to start a new one.');
        });
        describe('answer(nick, c)', function(){
            it('should return', function(){
                var response = hangman.answer('myNick', 'S');
                if (!response) throw new Error('no response generated, something is wrong!');
            });
        });
    });

    describe('stop()', function(){
       it('should end the current ongoing game.', function(){
           var response = hangman.stop('myNick');
           response.should.eql('myNick stopped the game, start a new one?');
       });
    });
});