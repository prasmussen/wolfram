/**
 * Created by sander.struijk on 05.12.13.
 */
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
                    wordlist.push({
                        word: splittedLine[0],
                        type: splittedLine[1]
                    });
                });
                if (callback) callback(wordlist);
            }
        });
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

    }

    return {
        init: init,
        pickARandomWord: pickARandomWord
    };
}());

module.exports = hangman;