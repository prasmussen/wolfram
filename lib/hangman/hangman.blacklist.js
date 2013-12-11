/**
 * Created by sander.struijk on 11.12.13.
 */
"use strict";
var io = require('./hangman.io'),
    S = require('string'),
    from = require('fromjs'),
    os = require('os'),
    path = require('path');

var blacklist = (function (io, S, from, os, path) {
    var defaultBasePath = io.defaultBasePath || 'lib/hangman/wordlists';
    var blacklistFileName = 'blacklist.txt';

    function getBlackListFilePath(basePath) {
        basePath = basePath || defaultBasePath;
        return path.join(basePath, blacklistFileName);
    }

    function blackListWord(word, path) {
        var lines = io.getLinesInFileSync(path || getBlackListFilePath());
        if (!from(lines).contains(word)) {
            io.appendLine(path, word + os.EOL);
            return word + ' has been blacklisted.';
        } else {
            throw new Error('Word has already been blacklisted.');
        }
    }

    function whiteListWord(word, path) {
        path = path || getBlackListFilePath();
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
        path = path || getBlackListFilePath();
        var fileContent = io.getFileContentSync(path);
        var lines = S(fileContent).lines();
        return from(lines).contains(word);
    }

    return {
        blackListWord: blackListWord,
        whiteListWord: whiteListWord,
        doesBlackListContainWord: doesBlackListContainWord
    }
}(io, S, from, os, path));

module.exports = blacklist;