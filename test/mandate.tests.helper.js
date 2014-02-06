/**
 * Created by sander.struijk on 06.02.14.
 */
var should = require('should'),
    moment = require('moment'),
    mandate = require('../lib/mandate');

function humanize(ms) {
    if (ms === 0) return 'zero duration';
    var mom = moment.duration(ms);
    var year = mom.years(), month = mom.months(), date = mom.days(), hours = mom.hours(), minutes = mom.minutes(), seconds = mom.seconds(), milliseconds = mom.milliseconds();
    var dateTimeString = '';
    if (year != 0) {
        dateTimeString += (year + ((year > 1 || year < -1) ? ' years' : ' year'));
    }
    if (month != 0) {
        if (dateTimeString.length > 0) dateTimeString += ' ';
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
    if (dateTimeString.length > 0) {
        dateTimeString += ' => ' + ms + ' ms';
    } else {
        dateTimeString = ms + ' ms';
    }
    return dateTimeString;
}

AssertionError.prototype = Error.prototype;
function AssertionError(expected, actual) {
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

module.exports = {
    parseDateTimeTestHelper: parseDateTimeTestHelper,
    parseDateTimeOddbjornTestHelper: parseDateTimeOddbjornTestHelper,
    getDurationTestHelper: getDurationTestHelper
};