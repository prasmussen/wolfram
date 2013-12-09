/**
 * Created by sander.struijk on 06.12.13.
 */
"use strict";
var fs = require('fs'),
    random = require('random-to'),
    from = require('fromjs'),
    S = require('string');

var io = (function (fs, S, from, random) {
    var pickedIndexes = {};
    var filePaths = [];
    var defaultBasePath = 'lib/hangman/wordlists';

    function init(basePath) {
        basePath = basePath || defaultBasePath;
        filePaths = loadWordListPaths(basePath);
    }

    function loadWordListPaths(basePath) {
        var wordLists = fs.readdirSync(basePath);
        return from(wordLists).select(function (x) {
            return basePath + '/' + x;
        }).toArray();
    }

    function getFilePathMatchingType(type) {
        if (!filePaths || !(filePaths instanceof Array) || !(filePaths.length > 0)) throw new Error('No file paths registered.');
        type = '/' + type + '.';
        var path = from(filePaths).singleOrDefault(function (x) {
            return x.indexOf(type) !== -1;
        }, '');
        if (!path || path.length === 0) throw new Error('Found no path matching the type provided.');
        return path;
    }

    function getBlackListFilePath(basePath) {
        basePath = basePath || defaultBasePath;
        return basePath + '/blacklist.txt';
    }

    function getFileContent(path) {
        return fs.readFileSync(path);
    }

    function getTypesFromPaths() {
        var types = [];
        var re = /\/([a-zA-ZæøåÆØÅ]*)\.([a-zA-ZæøåÆØÅ]*)\./;
        for (var i = 0; i < filePaths.length; i++) {
            var path = filePaths[i];
            var type = path.match(re);
            types.push(type[1]);
        }
        return types;
    }

    function getLine(path, line_no) {
        var fileContent = getFileContent(path);
        var lines = S(fileContent).lines();
        return lines[line_no];
    }

    function getLineCount(path) {
        if (!path) throw new Error('path can not be blank.');
        var fileContent = getFileContent(path);
        var lines = S(fileContent).lines();
        return lines.length;
    }

    function appendLine(path, line) {
        if (!path) throw new Error('path can not be blank.');
        if (!line) throw new Error('line can not be blank.');
        fs.appendFile(path, line, function(err){
            if (err) throw err;
        });
    }

    function getRandomLineNumber(option) {
        if (!option) throw new Error('option can not be undefined.');
        if (!option.type && !option.path) throw new Error('option object need to have either type or path set.');
        var path = option.path || getFilePathMatchingType(option.type);
        var takenIndexes = pickedIndexes[path] || [];
        var count = getLineCount(path);
        if (takenIndexes.length >= count) takenIndexes = [];
        var index = random.from0to(count - 1);
        if (from(takenIndexes).contains(index))
            return getRandomLineNumber(option);
        takenIndexes.push(index);
        pickedIndexes[path] = takenIndexes;
        return index;
    }

    return {
        init: init,
        getFilePathMatchingType: getFilePathMatchingType,
        getLine: getLine,
        appendLine: appendLine,
        getFileContent: getFileContent,
        getLineCount: getLineCount,
        getRandomLineNumber: getRandomLineNumber,
        getTypesFromPaths: getTypesFromPaths,
        getBlackListFilePath: getBlackListFilePath
    }
}(fs, S, from, random));

var wordFactory = (function (io, S) {

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

    function blackListWord(word) {
        var path = io.getBlackListFilePath();
        var fileContent = io.getFileContent(path);
        var words = S(fileContent).lines();
        if (!from(words).contains(word)) {
            io.appendLine(word);
        } else {
            throw new Error('Word has already been blacklisted.');
        }
    }

    function verifyIfBlackListContainWord(word){
        var path = io.getBlackListFilePath();
        var fileContent = io.getFileContent(path);
        var words = S(fileContent).lines();
        return from(words).contains(word);
    }

    return {
        createWord: createWord,
        blackListWord: blackListWord,
        verifyIfBlackListContainWord: verifyIfBlackListContainWord
    }
}(io, S));

var wordPicker = (function (io, wordFactory) {
    var lineCount = 0;
    var previousType = '';
    io.init();

    function pickARandomWord(type) {
        if (!type) throw new Error('type parameter can not be null or empty.');
        var path = io.getFilePathMatchingType(type);
        if (!lineCount || previousType !== type)
            lineCount = io.getLineCount(path);
        var index = io.getRandomLineNumber({path: path});
        var line = io.getLine(path, index);
        var word = {};
        if (wordFactory.verifyIfBlackListContainWord(type))
            word = pickARandomWord(type);
        else
            word = wordFactory.createWord(line);
        return word;
    }

    return {
        pickARandomWord: pickARandomWord
    }
}(io, wordFactory));

module.exports = {
    pickARandomWord: wordPicker.pickARandomWord,
    getTypesFromPaths: io.getTypesFromPaths,
    blackListWord: wordFactory.blackListWord,
    privates: {
        io: io,
        wordFactory: wordFactory
    }
};
