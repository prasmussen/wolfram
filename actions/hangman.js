/**
 *  ___
 * ó   |
 *´|`  |
 *´ ` /|\
 * Created by sander.struijk on 05.12.13.
 */
"use strict";
var wordEngine = require('../lib/hangman/hangman.wordengine'),
    from = require('fromjs');

var currentGame = {};

function start(type, ctx) {
    var nick = ctx.req.source.nick;
    if (currentGame.active) {
        ctx.callback('Can not start a new game while already playing, stupid person ' + nick + '! Stop or end game to start a new one.');
        return;
    }
    currentGame = newGame(type);
    ctx.callback('New game started by ' + nick + '! guess the word: ' + currentGame.word.displayWord());
}

function newGame(type, attempts) {
    type = type || 'subst';
    attempts = attempts || 5;
    return {
        active: true,
        attempts: attempts,
        players: {},
        word: wordEngine.pickARandomWord(type)
    };
}

function stop(ctx) {
    if (!currentGame.active) throw new Error('No game running, cant stop something that\'s not running!');
    if (currentGame) {
        currentGame.active = false;
        var nick = ctx.req.source.nick;
        ctx.callback(nick + ' stopped the game, WHY DID YOU STOP THE GAME??!!?!1|||11');
    }
}

function answer(c, ctx) {
    if (!currentGame.active) throw new Error('No game running, what was it that you wanted to answer?');
    var nick = ctx.req.source.nick;
    var faildGuessCount = currentGame.players[nick] || 0;

    if (currentGame.word.matchChar(c)) {
        if (currentGame.word.solved()) {
            currentGame.active = false;
            ctx.callback(nick + ' Won the Game! with ' + faildGuessCount + ' failed attempts, guessing the word: ' + currentGame.word.displayWord());
        } else {
            ctx.callback(currentGame.word.displayWord());
        }
    } else {
        faildGuessCount++;
        if (faildGuessCount >= currentGame.attempts) {
            currentGame.active = false;
            ctx.callback('Game Over! ' + nick + ' lost the game!');
        }
        currentGame.players[nick] = faildGuessCount;
        ctx.callback(nick + ' failed answers: ' + faildGuessCount);
    }
}

function listTypes(ctx){
    var types = wordEngine.getTypesFromPaths();
    ctx.callback('Available hangbaby categories: ' + from(types).aggregate('', '(types, type) => types += type + " "'));
}

module.exports = {
    start: start,
    answer: answer,
    stop: stop,
    listTypes: listTypes
};
