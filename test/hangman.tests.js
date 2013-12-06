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
            hangman.init('lib/hangman/ordliste.txt', function (ordliste) {
                //Assert
                ordliste.should.not.be.empty;
                done();
            });
        });
    });

    describe('start()', function () {
        it('should start a new game', function () {
            var respons = hangman.start('subst');
            respons.should.include('New game started! guess the word: ');
        });
    });
});