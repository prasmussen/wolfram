/**
 * Created by sander.struijk on 06.12.13.
 */
"use strict";
var wordFactory = require('./hangman.wordfactory'),
    blacklist = require('./hangman.blacklist'),
    io = require('./hangman.io');

var wordSelector = (function (io, wordFactory, blacklist) {
    io.init();

    function getFirstWordOnLine(line) {
        return line.split(' ')[0];
    }

    function getRandomLine(option) {
        var index = io.getRandomLineNumber(option);
        var line = io.getLine(option.path, index);
        var word = getFirstWordOnLine(line);
        if (blacklist.doesBlackListContainWord(word))
            return getRandomLine(option);
        return line;
    }

    function createOptionObj(type) {
        return {
            type: type,
            path: io.getFilePathMatchingType(type)
        };
    }

    function pickARandomWord(type) {
        if (!type) throw new Error('type parameter can not be null or empty.');
        var option = createOptionObj(type);
        var line = getRandomLine(option);
        var word = wordFactory.createWord(line);
        return word;
    }

    return {
        pickARandomWord: pickARandomWord
    }
}(io, wordFactory, blacklist));

module.exports = wordSelector;
