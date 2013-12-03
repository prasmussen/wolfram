var should = require('should'),
	moment = require('moment'),
	timer = require('../actions/timer');

describe('Timer', function(){
	describe('getDuration', function(){
		describe('_parseDuration', function(){
			paramTest_parseDuration('10h', moment.duration(10, 'hours').asMilliseconds());
		});
		describe('_parseDateTime', function(){
			paramTest_parseDateTime('h20', moment({ hours: 10 }), moment.duration(10, 'hours').asMilliseconds());
			paramTest_parseDateTime('h-20', moment({ hours: 10 }), 0);
			paramTest_parseDateTime('m5', moment({ minutes: 10 }), moment.duration(55, 'minutes').asMilliseconds());
			paramTest_parseDateTime('m5', moment({ minutes: 0 }), moment.duration(5, 'minutes').asMilliseconds());
			paramTest_parseDateTime('m5', moment({ minutes: 55 }), moment.duration(10, 'minutes').asMilliseconds());
		});
	});
});

function paramTest_parseDuration(input, expected){
	it('should return ' + expected + 'ms when input is ' + input, function(){
		var actual = timer.privates._parseDuration(input);
		actual.should.eql(expected);
	});
}

function paramTest_parseDateTime(input, now, expected){
	it('should return ' + expected + 'ms when now is ' + now.format() + ' and input is ' + input, function(){
		var actual = timer.privates._parseDateTime(input, now);
		actual.should.eql(expected);
	});
}