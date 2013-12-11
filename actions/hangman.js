/**
 *  ___
 * ó   |
 *´|`  |
 *´ ` /|\
 * Created by sander.struijk on 05.12.13.
 */
"use strict";
var wordSelector = require('../lib/hangman/hangman.wordselector'),
    wordFactory = require('../lib/hangman/hangman.wordfactory'),
    io = require('../lib/hangman/hangman.io'),
    from = require('fromjs'),
    S = require('string');

var currentGame = {};

function handleFailedAnswer(faildGuessCount, ctx) {
    var nick = ctx.req.source.nick;
    faildGuessCount++;
    if (faildGuessCount >= currentGame.attempts) {
        currentGame.active = false;
        ctx.callback('Game Over! ' + nick + ' lost the game! The full word was: ' + currentGame.word.revealWord());
    }
    currentGame.players[nick] = faildGuessCount;
    ctx.callback(nick + ' failed answers: ' + faildGuessCount);
}

function handleFullCorrectAnswer(ctx, faildGuessCount) {
    var nick = ctx.req.source.nick;
    currentGame.active = false;
    ctx.callback(nick + ' Won the Game! with ' + faildGuessCount + ' failed attempts, guessing the word: ' + currentGame.word.displayWord());
}

function handleCorrectGuess(ctx) {
    ctx.callback(currentGame.word.displayWord());
}

function matchChar(c, ctx, faildGuessCount) {
    if (currentGame.word.matchChar(c)) {
        if (currentGame.word.solved()) {
            handleFullCorrectAnswer(ctx, faildGuessCount);
        } else {
            handleCorrectGuess(ctx);
        }
    } else {
        handleFailedAnswer(faildGuessCount, ctx);
    }
}

function matchWord(word, ctx, faildGuessCount) {
    if (currentGame.word.matchWord(word)) {
        if (currentGame.word.solved()) {
            handleFullCorrectAnswer(ctx, faildGuessCount);
        }
    } else {
        handleFailedAnswer(faildGuessCount, ctx);
    }
}

function getFailedGuessCountForNick(ctx) {
    var nick = ctx.req.source.nick;
    var faildGuessCount = currentGame.players[nick] || 0;
    return faildGuessCount;
}

function newGame(type, attempts) {
    type = type || 'subst';
    attempts = attempts || 5;
    return {
        active: true,
        attempts: attempts,
        players: {},
        word: wordSelector.pickARandomWord(type)
    };
}

function compareGuessWithAnswer(guess, ctx, faildGuessCount) {
    if (guess.length === 1)
        matchChar(guess, ctx, faildGuessCount);
    else if (guess.length > 1)
        matchWord(guess, ctx, faildGuessCount);
}

function start(type, ctx) {
    var nick = ctx.req.source.nick;
    if (currentGame.active) {
        ctx.callback('Can not start a new game while already playing, stupid person ' + nick + '! Stop or end game to start a new one.');
        return;
    }
    currentGame = newGame(type);
    ctx.callback('New game started by ' + nick + '! guess the word: ' + currentGame.word.displayWord());
}

function stop(ctx) {
    if (!currentGame.active) throw new Error('No game running, cant stop something that\'s not running!');
    if (currentGame) {
        currentGame.active = false;
        var nick = ctx.req.source.nick;
        ctx.callback(nick + ' stopped the game, WHY DID YOU STOP THE GAME??!!?!1|||11');
    }
}

function guess(guess, ctx) {
    if (!guess) return;
    if (!currentGame.active) throw new Error('No game running, what was it that you wanted to guess?');
    var failedGuessCount = getFailedGuessCountForNick(ctx);
    compareGuessWithAnswer(guess, ctx, failedGuessCount);
}

function listTypes(ctx){
    try {
        var types = io.getTypesFromPaths();
        var typesString = S(from(types).aggregate('', '(types, type) => types += type + ", "')).chompRight(', ').s;
        ctx.callback('Available hangman categories(' + types.length + '): ' + typesString);
    } catch(e) {
        ctx.callback(e.message);
    }
}

function blackListWord(word, ctx){
    try{
        ctx.callback(wordFactory.blackListWord(word));
    } catch(e) {
        ctx.callback(e.message);
    }
}

function whiteListWord(word, ctx){
    try {
        ctx.callback(wordFactory.whiteListWord(word));
    } catch(e) {
        ctx.callback(e.message);
    }
}

module.exports = {
    start: start,
    stop: stop,
    guess: guess,
    listTypes: listTypes,
    blackListWord: blackListWord,
    whiteListWord: whiteListWord
};
