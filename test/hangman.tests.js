/**
 * Created by sander.struijk on 05.12.13.
 */
"use strict";
var hangman = require('../actions/hangman'),
    should = require('should');

describe('hangman', function () {
    describe('start(ctx)', function () {
        it('should start a new game', function () {
            hangman.start('test', {req: {source: {nick: 'myNick' }}, callback: function (str) {
                str.should.include('New game started by myNick! guess the word: ');
            }});
        });
        it('should throw an error if start() is called while a game is ongoing.', function () {
            hangman.start('test', {req: {source: {nick: 'myNick' }}, callback: function(str){
                str.should.eql('Can not start a new game while already playing, stupid person myNick! Stop or end game to start a new one.');
            }});
        });

    });
    describe('answer(c, ctx)', function () {
        it('should return', function () {
            hangman.answer('S', {req: {source: {nick: 'myNick' }}, callback: function(str){

            }});
        });
    });
    describe('stop(ctx)', function () {
        it('should end the current ongoing game.', function () {
            hangman.stop({req: {source: {nick: 'myNick' }}, callback: function(str){
                str.should.eql('myNick stopped the game, WHY DID YOU STOP THE GAME??!!?!1|||11');
            }});
        });
    });
});