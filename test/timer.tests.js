var should = require('should'),
	moment = require('moment'),
	timer = require('../actions/timer');

describe('Timer', function(){
	// timer.privates.debug = true;
	describe('getDuration', function(){
		describe('_parseDuration', function(){
			paramTest_parseDuration('10h', moment.duration(10, 'hours').asMilliseconds());
		});
		describe('_parseDateTime', function(){
			paramTest_parseDateTime('M12d24h10', moment({ months:9, days: 10, hours: 10 }), (moment({ months:11, days: 24, hours: 10 }).unix() - moment({ months:9, days: 10, hours: 10 }).unix()) * 1000);

			paramTest_parseDateTime_shouldThrowException('h24', moment({ hours: 0 }), 'Hours can not be equal to or greater then 24.');
			paramTest_parseDateTime('h20', moment({ hours: 10 }), moment.duration(10, 'hours').asMilliseconds());
			paramTest_parseDateTime('h-20', moment({ hours: 10 }), 0);

			paramTest_parseDateTime('h20m30', moment({ hours: 10 }), moment.duration(10, 'hours').add(moment.duration(30, 'minutes')).asMilliseconds());

			paramTest_parseDateTime_shouldThrowException('m60', moment({ minutes: 0 }), 'Minutes can not be equal to or greater then 60.');
			paramTest_parseDateTime('m59', moment({ minutes: 0 }), moment.duration(59, 'minutes').asMilliseconds());

			paramTest_parseDateTime('m5', moment({ minutes: 10 }), moment.duration(55, 'minutes').asMilliseconds());
			paramTest_parseDateTime('m5', moment({ minutes: 0 }), moment.duration(5, 'minutes').asMilliseconds());
			paramTest_parseDateTime('m5', moment({ minutes: 55 }), moment.duration(10, 'minutes').asMilliseconds());

			paramTest_parseDateTime('m0', moment({ minutes: 0 }), 0);
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

function paramTest_parseDateTime_shouldThrowException(input, now, exceptionMessage){
	it('should throw an exception with a message matching \'' + exceptionMessage + '\'\n\t when now is ' + now.format() + ' and input is ' + input, function(){
		(function() {
			timer.privates._parseDateTime(input, now);
		}).should.throwError(exceptionMessage);
	});
}