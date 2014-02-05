var should = require('should'),
    moment = require('moment'),
    mandate = require('../lib/mandate');

describe('mandate', function () {
    //mandate.enableDebug();
    describe('getDuration', function () {

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

        //Array of test cases
        var testCases = [
            new TestCase('24:00', moment(), null, null, 'Hours can only be between 0 and 23.'),
            new TestCase('23:59', moment({ h: 0 }), moment.duration({ h: 23, m: 59 }).asMilliseconds(), moment({ h: 23, m: 59, s: 0 }), null),
            new TestCase('00:00', moment({ h: 0 }), 0, moment({ h: 0 }), null),
            new TestCase('18:00', moment({ h: 15 }), moment.duration({ h: 3 }).asMilliseconds(), moment({ h: 18 }), null),
            new TestCase('18:00', moment({ h: 15 }), moment.duration({ h: 3 }).asMilliseconds(), moment({ h: 20 }), 'expected false to be true'),
            new TestCase('18:00', moment({ h: 15 }), moment.duration({ h: 5 }).asMilliseconds(), moment({ h: 20 }), 'expected 10800000 to equal 18000000'),
            new TestCase('24/12 18:00', moment({ M: 10, d: 24 }), moment.duration({ d: 30, h: 18 }).asMilliseconds(), moment({ y: 2014, M: 11, d: 24, h: 18 }), null),
            new TestCase('24/12/2014 18:00', moment({ y: 2013, M: 11, d: 24 }), moment.duration({ y: 1, h: 18 }).asMilliseconds(), moment({ y: 2014, M: 11, d: 24, h: 18 }), null),
            new TestCase('24/12/2014 18:00', moment({ y: 2015, M: 11, d: 24 }), null, null, 'Year can only be set to the future.')
        ];

        executeTestCases(testCases);

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

            function paramTest_parseDateTimeOddbjorn(input, now, expected) {
                it('should return ' + expected + 'ms when input is ' + input + ' and now is ' + moment(now).format(), function () {
                    var actual = mandate._parseDateTimeOddbjorn(input, now);
                    actual.should.eql(expected);
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

            //Array of test cases
            var testCases = [
                new TestCase('24:00', moment().toDate(), 0),
                new TestCase('23:59', moment({ h: 0 }).toDate(), moment.duration({ h: 23, m: 59 }).asMilliseconds()),
                new TestCase('00:00', moment({ h: 0 }).toDate(), 0),
                new TestCase('18:00', moment({ h: 15 }).toDate(), moment.duration({ h: 3 }).asMilliseconds()),
                new TestCase('18:00', moment({ h: 15 }).toDate(), 0),
                new TestCase('18:00', moment({ h: 15 }).toDate(), 0),
                new TestCase('24/12 18:00', moment({ M: 10, d: 24 }).toDate(), moment.duration({ d: 30, h: 18 }).asMilliseconds()),
                new TestCase('24/12/2014 18:00', moment({ y: 2013, M: 11, d: 24 }).toDate(), moment.duration({ y: 1, h: 18 }).asMilliseconds()),
                new TestCase('24/12/2014 18:00', moment({ y: 2015, M: 11, d: 24 }).toDate(), 0)
            ];

            executeTestCases(testCases);
        });

        describe('_parseDateTime', function () {

            function paramTest_parseDateTime(input, now, expected) {
                it('should return ' + expected + 'ms when now is ' + now.format() + ' and input is ' + input, function () {
                    var actual = mandate._parseDateTime(input, now);
                    actual.should.eql(expected);
                });
            }

            function TestCase(input, now, expectedDuration) {
                return {
                    input: input,
                    now: now,
                    expectedDuration: expectedDuration
                };
            }

            function executeTestCases(testCases) {
                for (var i = 0; i < testCases.length; i++) {
                    var testCase = testCases[i];
                    paramTest_parseDateTime(testCase.input, testCase.now, testCase.expectedDuration);
                }
            }

            var testCases = [
                new TestCase('24/12/2014', moment({ y: 2013, M: 11, d: 24 }), moment.duration({ y: 1 }).asMilliseconds()),
                new TestCase('24/12', moment({ M: 10, d: 24 }), moment.duration({ M: 1 }).asMilliseconds()),
                new TestCase('24/12/2014 18:00', moment({ y: 2013, M: 11, d: 24 }), moment.duration({ y: 1, h: 18 }).asMilliseconds()),
                new TestCase('24/12 18:00', moment({ y: 2013, M: 10, d: 24 }), moment.duration({ M: 1, h: 18 }).asMilliseconds()),
                new TestCase('24/12/14 18:00', moment({ y: 2013, M: 11, d: 24 }), moment.duration({ y: 1, h: 18 }).asMilliseconds()),
                new TestCase('20:00', moment({ h: 10 }), moment.duration({ h: 10 }).asMilliseconds()),
                new TestCase('20:00', moment({ h: 22 }), moment.duration({ h: 22 }).asMilliseconds()),
                new TestCase('20:00', moment({ h: 20, m: 20 }), moment.duration({ h: 23, m: 50 }).asMilliseconds())
            ];

            executeTestCases(testCases);
        });
    });
});



