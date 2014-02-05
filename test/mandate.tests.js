var should = require('should'),
    moment = require('moment'),
    mandate = require('../lib/mandate');

var TestHelper = function () {

    function humanize(ms) {
        if (ms === 0) return 'zero duration';
        var mom = moment.duration(ms);
        var year = mom.years(), month = mom.months(), date = mom.days(), hours = mom.hours(), minutes = mom.minutes(), seconds = mom.seconds(), milliseconds = mom.milliseconds();
        var dateTimeString = '';
        if (year != 0) {
            dateTimeString += (year + ((year > 1 || year < -1) ? ' years' : ' year'));
        }
        if (month != 0) {
            dateTimeString += (month + ((month > 1 || month < -1) ? ' months' : ' month'));
        }
        if (date != 0) {
            if (dateTimeString.length > 0) dateTimeString += ' ';
            dateTimeString += (date + ((date > 1 || date < -1) ? ' days' : ' day'));
        }
        if (hours != 0) {
            if (dateTimeString.length > 0) dateTimeString += ' ';
            dateTimeString += (hours + ((hours > 1 || hours < -1) ? ' hours' : ' hour'));
        }
        if (minutes != 0) {
            if (dateTimeString.length > 0) dateTimeString += ' ';
            dateTimeString += (minutes + ((minutes > 1 || minutes < -1) ? ' minutes' : ' minute'));
        }
        if (seconds != 0) {
            if (dateTimeString.length > 0) dateTimeString += ' ';
            dateTimeString += (seconds + ((seconds > 1 || seconds < -1) ? ' seconds' : ' second'));
        }
        if (milliseconds != 0) {
            if (dateTimeString.length > 0) dateTimeString += ' ';
            dateTimeString += (milliseconds + ((milliseconds > 1 || milliseconds < -1) ? ' milliseconds' : ' millisecond'));
        }
        return dateTimeString;
    }

    AssertionError.prototype = Error.prototype;
    function AssertionError(expected, actual){
        var error = new Error();
        error.name = 'AssertionError';
        error.message = ('expected ' + expected + ' to equal ' + actual);
        error.expected = expected;
        error.actual = actual;
        return error;
    }

    var getDurationTestHelper = function () {
        function paramTest_getDuration_shouldThrowException(input, now, expectedDuration, expectedDateTime, exceptionMessage) {
            it('should throw an exception with a message matching \'' + exceptionMessage + '\' when now is ' + now.format() + ' and input is ' + input, function () {
                (function () {
                    var actualDuration = mandate.getDuration(input, now);
                    actualDuration.should.eql(expectedDuration);
                    now.add(actualDuration, 'milliseconds').isSame(expectedDateTime).should.be.true;
                }).should.throwError(exceptionMessage);
            });
        }

        function paramTest_getDuration(input, now, expectedDuration, expectedDateTime) {
            it('should return ' + humanize(expectedDuration) + ' when now is ' + now.format() + ' and input is ' + input + '\n' +
                'and ' + now.format() + ' + ' + humanize(expectedDuration) + ' should match ' + expectedDateTime.format(), function () {
                var actualDuration = mandate.getDuration(input, now);
                //actualDuration.should.eql(expectedDuration);
                if (actualDuration !== expectedDuration) {
                    throw new AssertionError(humanize(expectedDuration), humanize(actualDuration));
                }
                now.add(actualDuration, 'milliseconds').isSame(expectedDateTime).should.be.true;
            });
        }

        function TestCase(input, now, expectedDuration, expectedDateTime, expectedException) {
            return {
                input: input,
                now: now,
                expectedDuration: expectedDuration,
                expectedDateTime: expectedDateTime,
                expectedException: expectedException
            };
        }

        function executeTestCases(testCases) {
            for (var i = 0; i < testCases.length; i++) {
                var testCase = testCases[i];
                if (testCase) {
                    if (testCase.expectedException) {
                        paramTest_getDuration_shouldThrowException(testCase.input, testCase.now, testCase.expectedDuration, testCase.expectedDateTime, testCase.expectedException);
                    } else {
                        paramTest_getDuration(testCase.input, testCase.now, testCase.expectedDuration, testCase.expectedDateTime);
                    }
                }
            }
        }

        return {
            TestCase: TestCase,
            executeTestCases: executeTestCases
        };
    }();

    var parseDateTimeOddbjornTestHelper = function () {
        function paramTest_parseDateTimeOddbjorn(input, now, expected) {
            it('should return ' + humanize(expected) + ' when input is ' + input + ' and now is ' + moment(now).format(), function () {
                var actual = mandate._parseDateTimeOddbjorn(input, now);
                //actual.should.eql(expected);
                if (actual !== expected) {
                    throw new AssertionError(humanize(expected), humanize(actual));
                }
            })
        }

        function TestCase(input, now, expected) {
            return {
                input: input,
                now: now,
                expected: expected
            };
        }

        function executeTestCases(testCases) {
            for (var i = 0; i < testCases.length; i++) {
                var testCase = testCases[i];
                paramTest_parseDateTimeOddbjorn(testCase.input, testCase.now, testCase.expected);
            }
        }

        return{
            TestCase: TestCase,
            executeTestCases: executeTestCases
        };
    }();

    var parseDateTimeTestHelper = function () {
        function paramTest_parseDateTime(input, now, expected) {
            it('should return ' + humanize(expected) + ' when now is ' + now.format() + ' and input is ' + input, function () {
                var actual = mandate._parseDateTime(input, now);
                //actual.should.eql(expected);
                if (actual !== expected) {
                    throw new AssertionError(humanize(expected), humanize(actual));
                }
            });
        }

        function TestCase(input, now, expectedDuration) {
            return {
                input: input,
                now: now,
                nowFormatted: now.format(),
                expectedDuration: expectedDuration
            };
        }

        function executeTestCases(testCases) {
            for (var i = 0; i < testCases.length; i++) {
                var testCase = testCases[i];
                paramTest_parseDateTime(testCase.input, testCase.now, testCase.expectedDuration);
            }
        }

        return {
            TestCase: TestCase,
            executeTestCases: executeTestCases
        };
    }();

    return{
        parseDateTimeTestHelper: parseDateTimeTestHelper,
        parseDateTimeOddbjornTestHelper: parseDateTimeOddbjornTestHelper,
        getDurationTestHelper: getDurationTestHelper
    }
}

describe('mandate', function () {
    //mandate.enableDebug();
    var helper, testHelper = new TestHelper();
    describe('getDuration', function () {
        helper = testHelper.getDurationTestHelper;
        var testCases = [
            new helper.TestCase('24:00', moment(), null, null, 'Hours can only be between 0 and 23.'),
            new helper.TestCase('23:59', moment({ h: 0 }), moment.duration({ h: 23, m: 59 }).asMilliseconds(), moment({ h: 23, m: 59, s: 0 }), null),
            new helper.TestCase('00:00', moment({ h: 0 }), 0, moment({ h: 0 }), null),
            new helper.TestCase('18:00', moment({ h: 15 }), moment.duration({ h: 3 }).asMilliseconds(), moment({ h: 18 }), null),
            new helper.TestCase('18:00', moment({ h: 15 }), moment.duration({ h: 3 }).asMilliseconds(), moment({ h: 20 }), 'expected false to be true'),
            new helper.TestCase('18:00', moment({ h: 15 }), moment.duration({ h: 5 }).asMilliseconds(), moment({ h: 20 }), 'expected 10800000 to equal 18000000'),
            new helper.TestCase('24/12 18:00', moment({ M: 10, d: 24 }), moment.duration({ d: 30, h: 18 }).asMilliseconds(), moment({ y: 2014, M: 11, d: 24, h: 18 }), null),
            new helper.TestCase('24/12/2014 18:00', moment({ y: 2013, M: 11, d: 24 }), moment.duration({ y: 1, h: 18 }).asMilliseconds(), moment({ y: 2014, M: 11, d: 24, h: 18 }), null),
            new helper.TestCase('24/12/2014 18:00', moment({ y: 2015, M: 11, d: 24 }), null, null, 'Year can only be set to the future.')
        ];
        helper.executeTestCases(testCases);
    });
    describe('_parseDuration', function () {
        function paramTest_parseDuration(input, expected) {
            it('should return ' + expected + 'ms when input is ' + input, function () {
                var actual = mandate._parseDuration(input);
                actual.should.eql(expected);
            });
        }

        paramTest_parseDuration('10h', moment.duration(10, 'hours').asMilliseconds());
        paramTest_parseDuration('-10h', 0);
    });
    describe('parseDateTimeOddbjorn', function () {
        helper = testHelper.parseDateTimeOddbjornTestHelper;
        var testCases = [
            new helper.TestCase('23:59', moment({ h: 0 }).toDate(), moment.duration({ h: 23, m: 59 }).asMilliseconds()),
            new helper.TestCase('00:00', moment({ h: 0 }).toDate(), 0),
            new helper.TestCase('18:00', moment({ h: 15 }).toDate(), moment.duration({ h: 3 }).asMilliseconds()),
            new helper.TestCase('24/12 18:00', moment({ M: 10, d: 24 }).toDate(), moment.duration({ d: 30, h: 18 }).asMilliseconds()),
            new helper.TestCase('24/12/2014 18:00', moment({ y: 2013, M: 11, d: 24 }).toDate(), moment.duration({ y: 1, h: 18 }).asMilliseconds()),
            new helper.TestCase('24/12/2014 18:00', moment({ y: 2015, M: 11, d: 24 }).toDate(), 0),
            new helper.TestCase('20:00', moment({ h: 20, m: 20 }).toDate(), moment.duration({ h: 23, m: 40 }).asMilliseconds())
        ];
        helper.executeTestCases(testCases);
    });
    describe('_parseDateTime', function () {
        helper = testHelper.parseDateTimeTestHelper;
        var testCases = [
            new helper.TestCase('24/12/2014', moment({ y: 2013, M: 11, d: 24 }), moment.duration({ y: 1 }).asMilliseconds()),
            new helper.TestCase('24/12', moment({ M: 10, d: 24 }), moment.duration({ M: 1 }).asMilliseconds()),
            new helper.TestCase('24/12/2014 18:00', moment({ y: 2013, M: 11, d: 24 }), moment.duration({ y: 1, h: 18 }).asMilliseconds()),
            new helper.TestCase('24/12 18:00', moment({ y: 2013, M: 10, d: 24 }), moment.duration({ M: 1, h: 18 }).asMilliseconds()),
            new helper.TestCase('24/12/14 18:00', moment({ y: 2013, M: 11, d: 24 }), moment.duration({ y: 1, h: 18 }).asMilliseconds()),
            new helper.TestCase('20:00', moment({ h: 10 }), moment.duration({ h: 10 }).asMilliseconds()),
            new helper.TestCase('20:00', moment({ h: 22 }), moment.duration({ h: 22 }).asMilliseconds()),
            new helper.TestCase('20:00', moment({ h: 20, m: 20 }), moment.duration({ h: 23, m: 40 }).asMilliseconds())
        ];
        helper.executeTestCases(testCases);
    });
});