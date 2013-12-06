/**
 *  ___
 * ó   |
 *´|`  |
 *´ ` /|\
 * Created by sander.struijk on 05.12.13.
 */
"use strict";
var wordGenerator = require('hangman.wordgenerator');

var currentGame = {};

function init(filename, callback) {
    wordGenerator.init(filename, function (wordlist) {
        if (callback) callback(wordlist);
    });
}

function start(type) {
    if (currentGame.active) throw new Error('Can not start a new game while already playing, stop or end game to start a new one.');
    currentGame = newGame(type);
    return 'New game started! guess the word: ' + currentGame.word.displayWord();
}

function newGame(type, attempts) {
    type = type || 'subst';
    attempts = attempts || 8;
    return {
        active: true,
        attempts: attempts,
        players: {},
        hangmanWord: wordGenerator.pickARandomWord(type)
    };
}

function answer(nick, c) {
    var player = currentGame.players[nick];
    if (!player) currentGame.players[nick] = 0;
    if (currentGame.word.matchChar(c)) {
        if (currentGame.word.solved()) {
            currentGame.active = false;
            return nick + ' Won the Game! with ' + player + ' attempts.';
        } else {
            return currentGame.word.displayWord();
        }
    } else {
        if (player >= currentGame.attempts) {
            currentGame.active = false;
            return 'Game Over! ' + nick + ' lost the game!';
        }
        player++;
        return nick + ' failed answers: ' + player;
    }
}

exports = {
    init: init,
    start: start,
    answer: answer
};