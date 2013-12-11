/**
 * Created by sander.struijk on 10.12.13.
 */
/// <reference path="./hangman.io.js"/>
"use strict";
var from = require('fromjs'),
    S = require('string'),
    io = require('./hangman.io');

var wordFactory = (function (io, S, from) {

    function createAnonymousWord(word) {
        if (!word) throw new Error('word parameter was null or empty.');
        var aw = [];
        for (var i = 0; i < word.length; i++) {
            var w = word[i];
            // 65279 = BOM - Byte Order Mark, typically the first char read from file when encoding is utf8
            if (word.charCodeAt(i) !== 65279) {
                aw.push({
                    anonymousChar: '_',
                    realChar: w,
                    matching: false
                });
            }
        }
        return aw;
    }

    function displayWord(anonymousWord) {
        if (!anonymousWord) throw new Error('word parameter was null or empty.');
        var displayWord = '';
        displayWord = from(anonymousWord).aggregate(displayWord, '(dw, c) => dw += c.anonymousChar + " "');
        displayWord = S(displayWord).trim().s;
        return displayWord;
    }

    function matchChar(matchedChars, anonymousWord, c) {
        c = c.toUpperCase();

        if (!c) throw new Error('char parameter was null or blank.');
        if (!anonymousWord) throw new Error('word parameter was null or empty.');
        if (from(matchedChars).contains(c)) throw new Error('Can not match the same char more then once.');

        var chars = from(anonymousWord).where('$.realChar === @', c).each(function(_char){
            _char.anonymousChar = _char.realChar;
            _char.matching = true;
        }).toArray();
        if (chars.length > 0) {
            matchedChars.push(c);
            return true;
        } else {
            return false;
        }
    }

    function isSolved(anonymousWord) {
        if (!anonymousWord) throw new Error('word parameter can not be null or empty.');
        return from(anonymousWord).all('$.matching');
    }

    function revealWord(word) {
        return S(from(word).aggregate('', '(rw, c) => rw += c + " "')).trim().s;
    }

    function matchWord(originalWord, guessWord, anonymousWord) {
        if (!guessWord) throw new Error('guess word can not be null or blank.');
        if (originalWord === guessWord){
            from(anonymousWord).each(function(_char){
                _char.anonymousChar = _char.realChar;
                _char.matching = true;
            });
            return true;
        }
        return false;
    }

    function createWord(line) {
        if (!line) throw new Error('line parameter was null or empty.');

        var splittedLine = line.split(' ');

        var word = splittedLine[0];
        var type = splittedLine[1];
        var matchedChars = [];
        var anonymousWord = createAnonymousWord(word);

        return {
            word: word,
            type: type,
            matchedChars: matchedChars,
            anonymousWord: anonymousWord,
            displayWord: function () {
                return displayWord(anonymousWord);
            },
            matchChar: function (c) {
                return matchChar(matchedChars, anonymousWord, c);
            },
            matchWord: function(w) {
                return matchWord(word, w, anonymousWord);
            },
            solved: function () {
                return isSolved(anonymousWord);
            },
            reset: function () {
                matchedChars = [];
                anonymousWord = createAnonymousWord(word);
            },
            revealWord: function () {
                return revealWord(word);
            }
        };
    }

    return {
        createWord: createWord
    }
}(io, S, from));

module.exports = wordFactory;