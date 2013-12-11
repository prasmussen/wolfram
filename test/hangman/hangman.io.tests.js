/**
 * Created by sander.struijk on 10.12.13.
 */
"use strict";
var should = require('should'),
    io = require('../../lib/hangman/hangman.io'),
    from = require('fromjs');

describe('hangman', function(){
    describe('io', function () {
        before(function () {
            io.init();
        });
        describe('getTypesFromPath()', function () {
            it('should return an array with all the types availaple.', function () {
                var types = io.getTypesFromPaths();
                types.should.be.ok;
                types.should.be.an.Array;
                types.length.should.be.above(0);
                var type = from(types).single(function (x) {
                    return x.indexOf('subst') !== -1;
                });
                type.should.be.ok;
                type.should.eql('subst');
            });
        });
        describe('getFilePathMatchingType(type)', function () {
            it('should return the path containing the type in its filename.', function () {
                var path = io.getFilePathMatchingType('subst');
                path.should.eql('lib/hangman/wordlists/subst.nor.wordlist.txt');
            });
        });
        describe('getLine(type, line_no, callback)', function () {
            it('should return the line at line number from a text file.', function () {
                var path = io.getFilePathMatchingType('test');
                var index = io.getRandomLineNumber({type: 'test'});
                var word = io.getLine(path, index);
                word.should.be.ok;
            });
            describe('getRandomLineNumber(option)', function () {
                it('should return a random number between 0 and 4 provided type', function () {
                    var index = io.getRandomLineNumber({type: 'test'});
                    index.should.be.an.Number;
                });
                it('should return a random number between 0 and 4 provided path', function () {
                    var path = io.getFilePathMatchingType('test');
                    var index = io.getRandomLineNumber({path: path});
                    index.should.be.an.Number;
                    index.should.be.within(0, 4);
                });
            });
            describe('getLineCount(path)', function () {
                it('', function(){
                    var path = io.getFilePathMatchingType('test');
                    var count = io.getLineCount(path);
                    count.should.be.an.Number;
                    count.should.be.eql(4);
                });
            });
        });
    });
});