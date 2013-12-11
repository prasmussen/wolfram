/**
 * Created by sander.struijk on 10.12.13.
 */
/// <reference path="./hangman.io.js"/>
"use strict";
var from = require('fromjs'),
    S = require('string'),
    os = require('os'),
    io = require('./hangman.io');

var wordFactory = (function (io, S, os, from) {

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

    function getLinesInFileSync(path) {
        path = path || io.getBlackListFilePath();
        var fileContent = io.getFileContentSync(path);
        var lines = S(fileContent).lines();
        return lines;
    }

    function blackListWord(word, path) {
        var lines = getLinesInFileSync(path);
        if (!from(lines).contains(word)) {
            io.appendLine(path, word + os.EOL);
            return word + ' has been blacklisted.';
        } else {
            throw new Error('Word has already been blacklisted.');
        }
    }

    function whiteListWord(word, path) {
        path = path || io.getBlackListFilePath();
        var fileContent = io.getFileContentSync(path);
        var lines = S(fileContent).lines();
        if (from(lines).contains(word)) {
            var multipleEOLs = new RegExp('(' + os.EOL + '){2,}');
            var wordRegex = new RegExp('^' + word + '$', 'mi');
            fileContent = S(fileContent).replace(wordRegex, '')
                                        .replace(multipleEOLs, os.EOL).s; //replace multiple newlines with single newline
            io.writeFileSync(path, fileContent);
            return word + ' has been removed from the blacklist.';
        } else {
            throw new Error('Could not find word in blacklist.');
        }
    }

    function doesBlackListContainWord(word, path){
        path = path || io.getBlackListFilePath();
        var fileContent = io.getFileContentSync(path);
        var lines = S(fileContent).lines();
        return from(lines).contains(word);
    }

    return {
        createWord: createWord,
        blackListWord: blackListWord,
        whiteListWord: whiteListWord,
        doesBlackListContainWord: doesBlackListContainWord
    }
}(io, S, os, from));

module.exports = wordFactory;