/**
 * Created by sander.struijk on 05.12.13.
 */
var fs = require('fs'),
    random = require('random-to'),
    from = require('fromjs');

var hangman = (function () {

    var wordlist = [];
    var typeWordlist = {};
    var pickedWords = [];

    function init(callback) {
        fs.readFile('lib/hangman/ordliste.txt', 'utf8', function (err, data) {
            if (err) console.log(err);
            else {
                var lines = data.split('\r\n');
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

    function pickRandomWord(type) {
        var wordlistByType = typeWordlist[type];
        if (!wordlistByType) wordlistByType = from(wordlist).where(function (x) { return x.type === type }).toArray();
        if (!wordlistByType) throw new Error('Could not find any words of given type in the dictionary.');
        var index = random.from0to(wordlistByType.length);
        var items =  wordlistByType.splice(index, 1);
        var item = items[0];
        pickedWords.push(item);
        return item;
    }

    return {
        init: init,
        pickRandomWord: pickRandomWord
    };
}());

module.exports = hangman;