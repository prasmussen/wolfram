/**
 * Created by sander.struijk on 09.12.13.
 */
var should = require('should'),
    S = require('string');

describe('Test string library', function(){
    it('should return true when string contains substring.', function(){
        S('./lib/hangman/wordlist/test.nor.wordlist.txt').contains('/test.').should.eql.true;
    });
});