/**
 * Created by sander.struijk on 05.12.13.
 */
"use strict";
var hangman = require('../lib/hangman/hangman');

hangman.init = function(){
    hangman.init('../lib/hangman/ordliste.txt');
}

module.exports = hangman;