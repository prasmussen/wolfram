var should = require('should'),
	moment = require('moment'),
	timer = require('../actions/timer');

describe('Timer', function(){
//	timer.privates.enableDebug();
	describe('getDuration', function(){

		var now = moment();
		paramTest_getDuration(now.date() + '/' + (now.month() + 1) + '/' + now.add('y', 1).year() + ' 18:00', 
							  moment.duration(1, 'years').asMilliseconds() + moment.duration(18, 'hours').asMilliseconds(), 
							  moment({ h: 18, m: 0, s: 0 }).add('y', 1));

		now = moment();
		paramTest_getDuration('23:59', 
							  moment.duration(1, 'd').asMilliseconds() - ((moment().unix() - moment({ h: 0, m: 0, s: 0 }).unix()) * 1000),
							  moment({ h: 23, m: 59, s: 0 }));

		describe('_parseDuration', function(){
			paramTest_parseDuration('10h', moment.duration(10, 'hours').asMilliseconds());
			paramTest_parseDuration('-10h', 0);
		});
		describe('_parseDateTime', function(){

			// og imo 00:00:00 klokkeslett ved bruk av kun dato
			// må håndtere at dato dag kan være 1 eller 2 desimaler
			// må håndtere at måned kan være 1 eller 2 desimaler
			// må håndtere at årstall kan være 2 eller 4 desimaler
			// må håndtere at klokketime kan være 1 eller 2 desimaler
			// må håndtere at klokkeminutt kan være 1 eller 2 desimaler
			// må håndtere at klokkesekund kan være 1 eller 2 desimaler
			// må håndtere at årstall kan være null
			// må håndtere at klokkeslett kan være null
			// må håndtere at klokkesekund kan være null

			describe('Pattern: Y2013M12d24h12m10s5 \n', function(){

				// MONTHS
                paramTest_parseDateTime('M12d24h10', moment({ months:9, days: 10, hours: 10 }), (moment({ months:11, days: 24, hours: 10 }).unix() - moment({ months:9, days: 10, hours: 10 }).unix()) * 1000);

                // DAYS
                paramTest_parseDateTime_shouldThrowException('d32', moment({ months: 1 }), 'Days exceeded amount of days for month.');

                // HOURS
                paramTest_parseDateTime_shouldThrowException('h24', moment({ hours: 0 }), 'hours have to be greater then or equal to 0 or less then or equal to 23.');
				paramTest_parseDateTime('h20', moment({ hours: 10 }), moment.duration(10, 'hours').asMilliseconds());
				paramTest_parseDateTime('h-20', moment({ hours: 10 }), 0);

				paramTest_parseDateTime('h20m30', moment({ hours: 10 }), moment.duration(10, 'hours').add(moment.duration(30, 'minutes')).asMilliseconds());

                // MINUTES
				paramTest_parseDateTime_shouldThrowException('m60', moment({ minutes: 0 }), 'Minutes can not be equal to or greater then 60.');
				paramTest_parseDateTime('m59', moment({ minutes: 0 }), moment.duration(59, 'minutes').asMilliseconds());

				paramTest_parseDateTime('m5', moment({ minutes: 10 }), moment.duration(55, 'minutes').asMilliseconds());
				paramTest_parseDateTime('m5', moment({ minutes: 0 }), moment.duration(5, 'minutes').asMilliseconds());
				paramTest_parseDateTime('m5', moment({ minutes: 55 }), moment.duration(10, 'minutes').asMilliseconds());

                paramTest_parseDateTime('m0', moment({ minutes: 0 }), 0);

                // SECONDS
                paramTest_parseDateTime('0s', moment({ minutes: 0 }), 0);

			});
			describe('Patterns: 18/10/2014 18:00:11 | 18/10/2014 18:00 | 18/10/2014@18:00 | 18/10@18:00:11 | 18/10T18:00 | 18/10/2015 | 18/10/04/18:00 \n', function(){

                // DATE ONLY
                paramTest_parseDateTime('24/12/2014', moment({ y: 2013, M: 11, d: 24 }), moment.duration(1, 'years').asMilliseconds());
                paramTest_parseDateTime('24/12', moment({ M: 10, d: 24 }), moment.duration(1, 'months').asMilliseconds());

                // DATE TIME
                paramTest_parseDateTime('24/12/2014 18:00', moment({ y: 2013, M: 11, d: 24 }), moment.duration(1, 'years').asMilliseconds() + moment.duration(18, 'hours').asMilliseconds());
                paramTest_parseDateTime('24/12 18:00', moment({ y: 2013, M: 10, d: 24 }), moment.duration(1, 'months').asMilliseconds() + moment.duration(18, 'hours').asMilliseconds());
                paramTest_parseDateTime('24/12/14 18:00', moment({ y: 2013, M: 11, d: 24, h: 0, m: 0, s: 15 }), moment.duration(1, 'years').asMilliseconds() + moment.duration(18, 'hours').asMilliseconds());

                // TIME ONLY
                paramTest_parseDateTime('20:00', moment({ h: 10 }), moment.duration(10, 'hours').asMilliseconds());
                paramTest_parseDateTime('20:00', moment({ h: 22 }), moment.duration(22, 'hours').asMilliseconds());
			});
		});
	});
});

function paramTest_getDuration(input, expectedDuration, expectedDateTime) {
	it('should return ' + expectedDuration + 'ms when input is ' + input + '\n' +
		'and now() + expectedDuration should be same as ' + expectedDateTime.format(), function(){
		var actual = timer.privates._getDuration(input);
		actual.should.eql(expectedDuration);
		var actualDateTime = moment({ h: 0, m: 0, s: 0 }).add('ms', actual);
		actualDateTime.isSame(expectedDateTime).should.eql(true, 'expected ' + expectedDateTime.format() + ' but found ' + actualDateTime.format());
	});
}

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
	it('should throw an exception with a message matching \'' + exceptionMessage + '\' when now is ' + now.format() + ' and input is ' + input, function(){
		(function() {
			timer.privates._parseDateTime(input, now);
		}).should.throwError(exceptionMessage);
	});
}