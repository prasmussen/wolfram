var should = require('should'),
    moment = require('moment'),
    mandate = require('../lib/mandate');

describe('mandate', function () {
    //mandate.enableDebug();
    describe('getDuration', function () {

        paramTest_getDuration_shouldThrowException('24:00',
            moment(),
            null,
            null,
            'Hours can only be between 0 and 23.');

        paramTest_getDuration('23:59',
            moment({ h: 0 }),
            moment.duration(23, 'hours').asMilliseconds() + moment.duration(59, 'minutes').asMilliseconds(),
            moment({ h: 23, m: 59, s: 0 }));

        paramTest_getDuration('00:00',
            moment({ h: 0 }),
            0,
            moment({ h: 0 }));

        paramTest_getDuration('18:00',
            moment({ h: 15 }),
            moment.duration(3, 'hours').asMilliseconds(),
            moment({ h: 18 }));

        paramTest_getDuration_shouldThrowException('18:00',
            moment({ h: 15 }),
            moment.duration(3, 'hours').asMilliseconds(),
            moment({ h: 20 }),
            'expected false to be true');

        paramTest_getDuration_shouldThrowException('18:00',
            moment({ h: 15 }),
            moment.duration(5, 'hours').asMilliseconds(),
            moment({ h: 20 }),
            'expected 10800000 to equal 18000000');

        paramTest_getDuration('24/12 18:00',
            moment({ M: 10, d: 24 }),
            moment.duration(30, 'days').asMilliseconds() + moment.duration(18, 'hours').asMilliseconds(),
            moment({ M: 11, d: 24, h: 18 }));

        paramTest_getDuration('24/12/2014 18:00',
            moment({ y: 2013, M: 11, d: 24 }),
            moment.duration(1, 'years').asMilliseconds() + moment.duration(18, 'hours').asMilliseconds(),
            moment({ y: 2014, M: 11, d: 24, h: 18 }));

        paramTest_getDuration('24/12/14 18:00',
            moment({ y: 2013, M: 11, d: 24 }),
            moment.duration(1, 'years').asMilliseconds() + moment.duration(18, 'hours').asMilliseconds(),
            moment({ y: 2014, M: 11, d: 24, h: 18 }));

        paramTest_getDuration_shouldThrowException('24/12/12 18:00',
            moment({ y: 2013, M: 11, d: 24 }),
            null,
            null,
            'Year can only be set to the future.');

        describe('_parseDuration', function () {
            paramTest_parseDuration('10h', moment.duration(10, 'hours').asMilliseconds());
            paramTest_parseDuration('-10h', 0);
        });
        describe('_parseDateTime', function () {
            describe('Pattern: Y2013M12d24h12m10s5 \n', function () {

                // MONTHS
                paramTest_parseDateTime('M12d24h10', moment({ months: 9, days: 10, hours: 10 }), (moment({ months: 11, days: 24, hours: 10 }).unix() - moment({ months: 9, days: 10, hours: 10 }).unix()) * 1000);

                // DAYS
                paramTest_parseDateTime_shouldThrowException('d32', moment(), 'Date can only be between 1 and 31.');

                // HOURS
                paramTest_parseDateTime_shouldThrowException('h24', moment({ hours: 0 }), 'Hours can only be between 0 and 23.');
                paramTest_parseDateTime('h20', moment({ hours: 10 }), moment.duration(10, 'hours').asMilliseconds());
                paramTest_parseDateTime('h-20', moment({ hours: 10 }), 0);

                paramTest_parseDateTime('h20m30', moment({ hours: 10 }), moment.duration(10, 'hours').add(moment.duration(30, 'minutes')).asMilliseconds());

                // MINUTES
                paramTest_parseDateTime_shouldThrowException('m60', moment({ minutes: 0 }), 'Minutes can only be between 0 and 59.');
                paramTest_parseDateTime('m59', moment({ minutes: 0 }), moment.duration(59, 'minutes').asMilliseconds());

                paramTest_parseDateTime('m5', moment({ minutes: 10 }), moment.duration(55, 'minutes').asMilliseconds());
                paramTest_parseDateTime('m5', moment({ minutes: 0 }), moment.duration(5, 'minutes').asMilliseconds());
                paramTest_parseDateTime('m5', moment({ minutes: 55 }), moment.duration(10, 'minutes').asMilliseconds());

                paramTest_parseDateTime('m0', moment({ minutes: 0 }), 0);

                // SECONDS
                paramTest_parseDateTime('0s', moment({ minutes: 0 }), 0);

            });
            describe('Patterns: 18/10/2014 18:00:11 | 18/10/2014 18:00 | 18/10/2014@18:00 | 18/10@18:00:11 | 18/10T18:00 | 18/10/2015 | 18/10/04/18:00 \n', function () {

                // DATE ONLY
                paramTest_parseDateTime('24/12/2014', moment({ y: 2013, M: 11, d: 24 }), moment.duration(1, 'years').asMilliseconds());
                paramTest_parseDateTime('24/12', moment({ M: 10, d: 24 }), moment.duration(1, 'months').asMilliseconds());

                // DATE TIME
                paramTest_parseDateTime('24/12/2014 18:00', moment({ y: 2013, M: 11, d: 24 }), moment.duration(1, 'years').asMilliseconds() + moment.duration(18, 'hours').asMilliseconds());
                paramTest_parseDateTime('24/12 18:00', moment({ y: 2013, M: 10, d: 24 }), moment.duration(1, 'months').asMilliseconds() + moment.duration(18, 'hours').asMilliseconds());
                paramTest_parseDateTime('24/12/14 18:00', moment({ y: 2013, M: 11, d: 24 }), moment.duration(1, 'years').asMilliseconds() + moment.duration(18, 'hours').asMilliseconds());

                // TIME ONLY
                paramTest_parseDateTime('20:00', moment({ h: 10 }), moment.duration(10, 'hours').asMilliseconds());
                paramTest_parseDateTime('20:00', moment({ h: 22 }), moment.duration(22, 'hours').asMilliseconds());
            });
        });
    });
});

function paramTest_getDuration_shouldThrowException(input, now, expectedDuration, expectedDateTime, exceptionMessage) {
    it('should throw an exception with a message matching \'' + exceptionMessage + '\'\n\t when now is ' + now.format() + ' and input is ' + input, function () {
        (function () {
            var actualDuration = mandate.getDuration(input, now);
            actualDuration.should.eql(expectedDuration);
            now.add(actualDuration, 'milliseconds').isSame(expectedDateTime).should.be.true;
        }).should.throwError(exceptionMessage);
    });
}

function paramTest_getDuration(input, now, expectedDuration, expectedDateTime) {
    it('should return ' + expectedDuration + 'ms when now is ' + now.format() + ' and input is ' + input + '\n' +
        'and ' + now.format() + ' + ' + expectedDuration + 'ms should match ' + expectedDateTime.format(), function () {
        var actualDuration = mandate.getDuration(input, now);
        actualDuration.should.eql(expectedDuration);
        now.add(actualDuration, 'milliseconds').isSame(expectedDateTime).should.be.true;
    });
}

function paramTest_parseDuration(input, expected) {
    it('should return ' + expected + 'ms when input is ' + input, function () {
        var actual = mandate.parseDuration(input);
        actual.should.eql(expected);
    });
}

function paramTest_parseDateTime(input, now, expected) {
    it('should return ' + expected + 'ms when now is ' + now.format() + ' and input is ' + input, function () {
        var actual = mandate.parseDateTime(input, now);
        actual.should.eql(expected);
    });
}

function paramTest_parseDateTime_shouldThrowException(input, now, exceptionMessage) {
    it('should throw an exception with a message matching \'' + exceptionMessage + '\'\n\t when now is ' + now.format() + ' and input is ' + input, function () {
        (function () {
            mandate.parseDateTime(input, now);
        }).should.throwError(exceptionMessage);
    });
}