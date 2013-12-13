/**
 * Created by sander.struijk on 11.12.13.
 */
"use strict";
var io = require('./hangman.io'),
    path = require('path');

var toplist = (function(io, path){
    var defaultBasePath = 'lib/hangman';
    var toplistFileName = 'toplist.txt';
    var toplistPath = '';

    function init(basePath){
        basePath = basePath || defaultBasePath;
        toplistPath = path.join(basePath, toplistFileName);
    }

    function readToplist(){
        var lines = io.getLinesInFileSync(toplistPath);

    }

    function writeToplist(){

    }

    function printToplist(){

    }

    function updateScoreForUser(user, score){

    }

    return {
        init: init,
        printToplist: printToplist,
        updateScoreForUser: updateScoreForUser
    }
}(io, path));

module.exports = toplist;