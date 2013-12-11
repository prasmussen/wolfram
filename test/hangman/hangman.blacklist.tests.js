/**
 * Created by sander.struijk on 11.12.13.
 */
"use strict";
var should = require('should'),
    blacklist = require('../../lib/hangman/hangman.blacklist');

describe('blacklist', function(){
    describe('blackListWord(word)', function () {
        it('should write word to blacklist file if the word is not already blacklisted.', function () {
            blacklist.blackListWord('BLACKLIST', 'lib/hangman/wordlists/blacklist_test.txt');
        });
        it('should verify that a word has been blacklisted or not.', function () {
            blacklist.doesBlackListContainWord('BLACKLIST').should.eql.true;
        });
        it('should write word to blacklist file if the word is not already blacklisted.', function () {
            (function () {
                blacklist.blackListWord('BLACKLIST_THROW_ERROR', 'lib/hangman/wordlists/blacklist_test.txt');
                blacklist.blackListWord('BLACKLIST_THROW_ERROR', 'lib/hangman/wordlists/blacklist_test.txt');
            }).should.throwError('Word has already been blacklisted.');
        });
    });
    describe('whiteListWord(word)', function () {
        it('should remove the word from blacklist if the word is whitelisted', function () {
            blacklist.whiteListWord('BLACKLIST', 'lib/hangman/wordlists/blacklist_test.txt');
        });
        it('should verify that a word has been blacklisted or not.', function () {
            blacklist.doesBlackListContainWord('BLACKLIST').should.eql.false;
        });
        it('should write word to blacklist file if the word is not already blacklisted.', function () {
            (function () {
                blacklist.whiteListWord('BLACKLIST_THROW_ERROR', 'lib/hangman/wordlists/blacklist_test.txt');
                blacklist.whiteListWord('BLACKLIST_THROW_ERROR', 'lib/hangman/wordlists/blacklist_test.txt');
            }).should.throwError('Could not find word in blacklist.');
        });
    });
});