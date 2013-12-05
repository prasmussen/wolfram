/**
 * Created by furier on 05/12/13.
 */
var moment = require('moment'),
    should = require('should');

describe('moment', function(){
    it('moment({ y: 2014 }).years().should.eql(2014)', function(){
        moment({ y: 2014 }).years().should.eql(2014);
    });
});