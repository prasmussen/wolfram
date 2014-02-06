var should = require('should'),
    moment = require('moment'),
    mandate = require('../lib/mandate'),
    testHelper = require('./mandate.tests.helper');

describe('mandate', function () {
    mandate.enableDebug();
    var helper;
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
    describe('_parseDateTime', function () {
        helper = testHelper.parseDateTimeTestHelper;
        var testCases = [
            new helper.TestCase('24/12/2014', moment({ y: 2013, M: 11, d: 24 }), moment.duration({ y: 1 }).asMilliseconds()),
            new helper.TestCase('24/12', moment({ M: 10, d: 24 }), moment.duration({ M: 1 }).asMilliseconds()),
            new helper.TestCase('24/12/2014 18:00', moment({ y: 2013, M: 11, d: 24 }), moment.duration({ y: 1, h: 18 }).asMilliseconds()),
            new helper.TestCase('24/12 18:00', moment({ y: 2013, M: 10, d: 24 }), moment.duration({ M: 1, h: 18 }).asMilliseconds()),
            new helper.TestCase('24/12/14 18:00', moment({ y: 2013, M: 11, d: 24 }), moment.duration({ y: 1, h: 18 }).asMilliseconds()),
            new helper.TestCase('01/01 10:00', moment({ M: 00, d: 01, h: 20 }), moment.duration({ y: 1 }).subtract(10, 'h').asMilliseconds()),
            new helper.TestCase('20:00', moment({ h: 10 }), moment.duration({ h: 10 }).asMilliseconds()),
            new helper.TestCase('20:00', moment({ h: 22 }), moment.duration({ h: 22 }).asMilliseconds()),
            new helper.TestCase('20:00', moment({ h: 20, m: 20 }), moment.duration({ h: 23, m: 40 }).asMilliseconds()),
            new helper.TestCase('01/01/3050 20:00', moment({ y: 2050, M: 00, d: 0, h: 20, m: 20 }), moment.duration({ y: 100, h: 23, m: 40 }).asMilliseconds())
        ];
        helper.executeTestCases(testCases);
    });
});