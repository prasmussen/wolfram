/**
 * Created by sander.struijk on 06.12.13.
 */
"use strict";
var fs = require('fs'),
    random = require('random-to'),
    from = require('fromjs');

function getFilePath(type, filePaths){
    if (!filePaths || !(filePaths instanceof Array) || !(filePaths.length > 0)) throw new Error('No file paths registered.')
    var path = from(filePaths).singleOrDefault(function(value){
        return value.indexOf(type) !== -1;
    }, '');
    if (!path || path.length === 0) throw new Error('Found no path matching the type provided.');
    return path;
}

// windows uses \r\n for newline and unix uses just \n
function splitOnNewLines(data) {
    if (!data) throw new Error('data parameter was null or empty.');
    data = data.toString();
    var lines = {};
    if (data.indexOf('\r\n') !== -1) {
        lines = data.split('\r\n');
    } else {
        lines = data.split('\n');
    }
    return lines;
}

function getLine(type, line_no, filePaths, callback) {
    var path = getFilePath(type, filePaths);
    fs.readFile(path, 'utf8', function(err, data) {
        if (err) throw err;

        // Data is a buffer that we need to convert to a string
        // Improvement: loop over the buffer and stop when the line is reached
        var lines = splitOnNewLines(data);

        if(line_no > lines.length){
            return callback('File end reached without finding line', null);
        }

        callback(null, lines[line_no]);
    });
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
    if (!anonymousWord) throw new Error('word parameter can not be null or empty.');
    return from(anonymousWord).all('$.matching');
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

function getRandomIndex(count, pickedIndexes){
    if (!count) throw new Error('count parameter can not be 0, NaN or undefined.');
    if (!pickedIndexes) throw new Error('pickedIndexes parameter was null or undefined.');
    var index = random.from0to(count - 1);
    if (from(pickedIndexes).contains(index))
        return getRandomIndex(count, pickedIndexes);
    return index;
}

function updateLineCount(type, filePaths, callback){
    if (!type) throw new Error('type parameter can not be null or empty.');
    var path = getFilePath(type, filePaths);
    fs.readFile(path, 'utf8', function (err, data) {
        if (err) throw err;
        var lines = splitOnNewLines(data);
        callback(lines.length);
    });
}

var pickedIndexes = [];
var lineCount = 0;
var previousType = '';

function pickARandomWord(type, filePaths) {
    if (!type) throw new Error('type parameter can not be null or empty.');
    if (!lineCount || previousType !== type)
    updateLineCount(type, filePaths, function(lineCount){
        var index = getRandomIndex(lineCount, pickedIndexes);
        getLine(type, index, filePaths, function(err, line){
            if (err) throw err;
            pickedIndexes.push(index);
            return createWord(line);
        });
    });
}

module.exports = {
    pickARandomWord: pickARandomWord,
    privates: {
        getLine: getLine,
        isSolved: isSolved,
        matchChar: matchChar,
        createWord: createWord,
        displayWord: displayWord,
        getFilePath: getFilePath,
        getRandomIndex: getRandomIndex,
        updateLineCount: updateLineCount,
        splitOnNewLines: splitOnNewLines,
        createAnonymousWord: createAnonymousWord
    }
};
