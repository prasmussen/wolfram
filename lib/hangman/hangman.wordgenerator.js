/**
 * Created by sander.struijk on 06.12.13.
 */
"use strict";
var fs = require('fs'),
    random = require('random-to'),
    from = require('fromjs'),
    util = require('util');

var wordlist = [],
    pickedWords = [];

function init(filename, callback) {
    if (!filename) throw new Error('filename can not be null, blank or empty.');
    fs.readFile(filename, { encoding: 'utf8' }, function (err, data) {
        if (err) console.log(err);
        else {
            var lines = splitOnNewLines(data);
            lines.forEach(function (line) {
                wordlist.push(createWord(line));
            });
            if (callback) callback(wordlist);
        }
    });
}

// windows uses \r\n for newline and unix uses just \n
function splitOnNewLines(data) {
    if (!data) throw new Error('data parameter was null or empty.');
    var lines = {};
    if (data.indexOf('\r\n') !== -1) {
        lines = data.split('\r\n');
    } else {
        lines = data.split('\n');
    }
    return lines;
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
        }
    };
}

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
    anonymousWord.forEach(function (w) {
        displayWord += (w.anonymousChar + ' ');
    });
    displayWord = displayWord.substring(0, displayWord.length - 1);
    return displayWord;
}

function matchChar(matchedChars, anonymousWord, c) {
    c = c.toUpperCase();
    if (!c) throw new Error('char parameter was null or blank.');
    if (!anonymousWord) throw new Error('word parameter was null or empty.');
    if (from(matchedChars).contains(c)) throw new Error('Can not match the same char more then once.');
    var result = from(anonymousWord).where('$.realChar === @', c).toArray();
    result.forEach(function (x) {
        x.anonymousChar = x.realChar;
        x.matching = true;
    });
    if (result.length > 0) {
        matchedChars.push(c);
        return true;
    } else {
        return false;
    }
}

function isSolved(anonymousWord) {
    if (!anonymousWord) throw new Error('word parameter was null or empty.');
    return from(anonymousWord).all('$.matching');
}

function pickARandomWord(type) {
    var wordlistByType = wordlist.filter(function(x) {
        return x.type === type;
    });

    if (!wordlistByType) throw new Error('Could not find any words of given type in the dictionary.');
    var index = random.from0to(wordlistByType.length - 1);
    var items = wordlistByType.splice(index, 1);
    var item = items[0];
    pickedWords.push(item);
    return item;
}

function reset() {
    throw new Error('reset() has not been implemented yet.');
}

module.exports = {
    init: init,
    pickARandomWord: pickARandomWord,
    reset: reset,
    privates: {
        createWord: createWord
    }
};
