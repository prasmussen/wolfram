/**
 * Created by sander.struijk on 10.12.13.
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
        return from(wordLists).select(function (wordListFileName) {
            return basePath + '/' + wordListFileName;
        }).toArray();
    }

    function getFilePathMatchingType(type) {
        if (!filePaths || !(filePaths instanceof Array) || !(filePaths.length > 0)) throw new Error('No file paths registered.');
        type = '/' + type + '.';
        var path = from(filePaths).singleOrDefault(function (filePath) {
            return filePath.indexOf(type) !== -1;
        }, '');
        if (!path || path.length === 0) throw new Error('Found no path matching the type provided.');
        return path;
    }

    function getFileContentSync(path) {
        return fs.readFileSync(path);
    }

    function retrieveTypeInFilePath(path) {
        // pattern: /type.country.wordlist.txt
        var re = /\/([a-zA-ZæøåÆØÅ]*)\.([a-zA-ZæøåÆØÅ]*)\.wordlist\.txt/;
        var type = path.match(re) || null;
        return type ? type[1] : null;
    }

    function getTypesFromPaths() {
        var types = [];
        for (var i = 0; i < filePaths.length; i++) {
            var path = filePaths[i];
            var type = retrieveTypeInFilePath(path);
            if (type && type !== 'test')
                types.push(type);
        }
        return types;
    }

    function getLine(path, line_no) {
        var fileContent = getFileContentSync(path);
        var lines = S(fileContent).lines();
        return lines[line_no];
    }

    function getLineCount(path) {
        if (!path) throw new Error('path can not be blank.');
        var fileContent = getFileContentSync(path);
        var lines = S(fileContent).lines();
        return lines.length;
    }

    function appendLineSync(path, line) {
        if (!path) throw new Error('path can not be blank.');
        if (!line) throw new Error('line can not be blank.');
        fs.appendFileSync(path, line);
    }

    function writeFileSync(path, content){
        if (!path) throw new Error('path can not be blank.');
        fs.writeFileSync(path, content);
    }

    function resetTakenIndexesWhenLengthExceedLineCountInFile(path, count) {
        var takenIndexes = pickedIndexes[path] || [];
        if (takenIndexes.length >= count)
            takenIndexes = [];
        return takenIndexes;
    }

    function addNewIndexToTakenIndexes(takenIndexes, index) {
        takenIndexes.push(index);
    }

    function storeTakenIndexesForPath(path, takenIndexes) {
        pickedIndexes[path] = takenIndexes;
    }

    function getRandomLineNumber(option) {
        if (!option) throw new Error('option can not be undefined.');
        if (!option.type && !option.path) throw new Error('option object need to have either type or path set.');
        var path = option.path || getFilePathMatchingType(option.type);
        var count = getLineCount(path);
        var takenIndexes = resetTakenIndexesWhenLengthExceedLineCountInFile(path, count);
        var index = random.from0to(count - 1);
        if (from(takenIndexes).contains(index))
            return getRandomLineNumber(option);
        addNewIndexToTakenIndexes(takenIndexes, index);
        storeTakenIndexesForPath(path, takenIndexes);
        return index;
    }

    return {
        init: init,
        getFilePathMatchingType: getFilePathMatchingType,
        getLine: getLine,
        appendLine: appendLineSync,
        writeFileSync: writeFileSync,
        getFileContentSync: getFileContentSync,
        getLineCount: getLineCount,
        getRandomLineNumber: getRandomLineNumber,
        getTypesFromPaths: getTypesFromPaths,
        defaultBasePath: defaultBasePath
    }
}(fs, S, from, random));

module.exports = io;