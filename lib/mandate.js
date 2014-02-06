/**
 * Created by sander.struijk on 05.12.13.
 * Contributed: oddbjorn.haaland
 */
var moment = require("moment");

//Oddbjørn
function _parseDuration(duration) {
    var t = {
        s: 1000,
        m: 1000 * 60,
        h: 1000 * 60 * 60,
        d: 1000 * 60 * 60 * 24,
        w: 1000 * 60 * 60 * 24 * 7,
        y: 1000 * 60 * 60 * 24 * 365
    }

    var re = /^(?:(\d+)y)?(?:(\d+)w)?(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i;
    var time = re.exec(duration);

    var sum = 0;

    if (time) {
        sum += t.y * (time[1] || 0);
        sum += t.w * (time[2] || 0);
        sum += t.d * (time[3] || 0);
        sum += t.h * (time[4] || 0);
        sum += t.m * (time[5] || 0);
        sum += t.s * (time[6] || 0);
    }

    return sum;
}

function _parseInputString(dateTime) {
    var seconds, minutes, hours, days, months, years;

    function parseYear(time) {
        //if the year is 2014 and we try to set it to 2015 by sending in 15
        var yearAsString = time[3];
        if (yearAsString && yearAsString.length == 2) {
            var currentYearAsString = moment().year().toString();
            //if the current year length is actually year 14 after jesus was born then just return the year!
            if (currentYearAsString.length == 2)
                return yearAsString;
            else { //otherwise return the current year minus the two last chars which we replace with the ones we like to set.
                var firstPartOfYear = currentYearAsString.substring(0, currentYearAsString.length - 2);
                return firstPartOfYear + yearAsString;
            }
        }
        return yearAsString;
    }

    var re = /^(?:(?:(\d{1,2})[\/.\\-](\d{1,2})(?:[\/.\\-]((?:\d{2}|\d{4})))?(?:\D(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?)|(?:(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?))$/;
    var time = re.exec(dateTime);
    if (time) {
        years = parseInt(parseYear(time)) || null;
        months = (parseInt(time[2]) - 1) || null;
        days = parseInt(time[1]) || null;
        hours = parseInt(time[4] || time[7]) || null;
        minutes = parseInt(time[5] || time[8]) || null;
        seconds = parseInt(time[6] || time[9]) || null;
    }
    return {time: time, years: years, months: months, days: days, hours: hours, minutes: minutes, seconds: seconds};
}

function _parseDateTime(dateTime, now) {
    now = now || moment();
    var result = _parseInputString(dateTime);
    if (result.time) {
        var future = moment({
            y: result.years || now.year(),
            M: result.months || now.month(),
            d: result.days || now.date(),
            h: result.hours || 0,
            m: result.minutes || 0,
            s: result.seconds || 0 });
        if (future.isAfter(now)) {
            _debug('now: ' + now.format() + ' future: ' + future.format());
            return future.diff(now);
        } else if (future.isBefore(now)) {
            if (!result.days && (future.isBefore(now, 'second') || future.isSame(now, 'second'))){
                future.add(1, 'day');
            }
            if (!result.years && (future.isBefore(now, 'day') || future.isSame(now, 'day'))){
                future.add(1, 'year');
            }
            _debug('now: ' + now.format() + ' future: ' + future.format());
            return future.diff(now);
        }
    }
    return 0;
}

var shouldDebug = false;
function _debug(message) {
    if (shouldDebug)
        console.log(message);
}
function enableDebug() {
    shouldDebug = true;
}

function getDuration(duration, now) {
    var parsedDuration = _parseDuration(duration);
    if (parsedDuration === 0) {
        parsedDuration = _parseDateTime(duration, now);
    }
    return parsedDuration;
}

module.exports = {
    enableDebug: enableDebug,
    getDuration: getDuration,
    _parseDateTime: _parseDateTime,
    _parseDuration: _parseDuration
};