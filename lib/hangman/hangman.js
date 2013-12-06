/**
 * Created by sander.struijk on 05.12.13.
 */
"use strict";
var fs = require('fs'),
    random = require('random-to'),
    from = require('fromjs');

// windows uses \r\n for newline and unix uses just \n
function splitOnNewLines(data) {
    var lines = {};
    if (data.indexOf('\r\n') !== -1) {
        lines = data.split('\r\n');
    } else {
        lines = data.split('\n');
    }
    return lines;
}

var hangman = (function () {

    var wordlist = [];
    var typeWordlist = {};
    var pickedWords = [];

    function init(callback) {
        fs.readFile('lib/hangman/ordliste.txt', 'utf8', function (err, data) {
            if (err) console.log(err);
            else {
                var lines = splitOnNewLines(data);
                lines.forEach(function (line) {
                    var splittedLine = line.split(' ');
                    wordlist.push(createWord(splittedLine));
                });
                if (callback) callback(wordlist);
            }
        });
    }

    function createWord(splittedLine) {

        var word = {
            word: splittedLine[0],
            type: splittedLine[1],
            anonymousWord: createAnonymousWord(splittedLine[0]),
            displayWord: displayWord,
            matchChar: matchChar,
            matchedChars: [],
            solved: isSolved
        };

        function createAnonymousWord(word) {
            var aw = [];
            for (var i = 0; i < word.length; i++) {
                aw.push({
                    anonymousChar: '_',
                    realChar: word[i],
                    matching: false
                });
            }
            return aw;
        }

        function displayWord() {
            var word = '';
            for (var w in word.anonymousWord) {
                word += (w.anonymousChar + ' ');
            }
            return word;
        }

        function matchChar(c) {
            if (from(word.matchedChars).contains(c)) throw new Error('Can not match the same char more then once.');
            from(word.anonymousWord).where(function (x) {
                return x.realChar === c;
            }).select(function (x) {
                    x.anonymousChar = x.realChar;
                    x.matching = true;
                    return x
                });
            word.matchedChars.push(c);
        }

        function isSolved() {
            return from(word.anonymousWord).all(function (x) {
                return x.matching;
            });
        }

        return word;
    }

    function pickARandomWord(type) {
        var wordlistByType = typeWordlist[type];
        if (!wordlistByType) wordlistByType = from(wordlist).where(function (x) {
            return x.type === type
        }).toArray();
        if (!wordlistByType) throw new Error('Could not find any words of given type in the dictionary.');
        var index = random.from0to(wordlistByType.length);
        var items = wordlistByType.splice(index, 1);
        var item = items[0];
        pickedWords.push(item);
        return item;
    }

    function start(type) {
        var rw = pickARandomWord(type);
    }

    return {
        init: init,
        pickARandomWord: pickARandomWord,
        privates: {
            createWord: createWord
        }
    };
}());

module.exports = hangman;