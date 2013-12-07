/**
 *  ___
 * ó   |
 *´|`  |
 *´ ` /|\
 * Created by sander.struijk on 05.12.13.
 */
"use strict";
var wordGenerator = require('../lib/hangman/hangman.wordgenerator');

var currentGame = {};

function init(filename, ctx) {
    var wordlistPath = "lib/hangman/ordliste_short.txt";
    wordGenerator.init(wordlistPath);
}

function start(type, ctx) {
    // Very nice, yes
    type = ['subst', 'verb', 'prep'][type.length - 1];

    if (currentGame.active) {
        ctx.callback('Can not start a new game while already playing, stop or end game to start a new one.');
        return;
    }

    currentGame = newGame(type);
    ctx.callback('New game started! guess the word: ' + currentGame.word.displayWord());
}

function newGame(type, attempts) {
    type = type || 'subst';
    attempts = attempts || 8;
    return {
        active: true,
        attempts: attempts,
        players: {},
        word: wordGenerator.pickARandomWord(type)
    };
}

function stop(ctx) {
    if (currentGame) {
        currentGame.active = false;
        var nick = ctx.req.source.nick;
        ctx.callback(nick + ' stopped the game, start a new one?');
    }
}

function answer(c, ctx) {
    var nick = ctx.req.source.nick;
    var guessCount = currentGame.players[nick] || 0;
    guessCount++;

    if (currentGame.word.matchChar(c)) {
        if (currentGame.word.solved()) {
            currentGame.active = false;
            ctx.callback(nick + ' Won the Game! with ' + guessCount + ' attempts.');
        } else {
            ctx.callback(currentGame.word.displayWord());
        }
    } else {
        if (guessCount >= currentGame.attempts) {
            currentGame.active = false;
            ctx.callback('Game Over! ' + nick + ' lost the game!');
        }
        currentGame.players[nick] = guessCount;
        ctx.callback(nick + ' failed answers: ' + guessCount);
    }
}

module.exports = {
    init: init,
    start: start,
    answer: answer,
    stop: stop
};
