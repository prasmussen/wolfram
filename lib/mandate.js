/**
 * Created by sander.struijk on 05.12.13.
 * Contributed: oddbjorn.haaland
 */
var moment = require("moment");

function getDuration(duration, now) {
    now = now || moment({ h: 0, m: 0, s: 0 });
    var parsedDuration = parseDuration(duration);
    if (parsedDuration === 0) {
        parsedDuration = parseDateTime(duration, now);
    }
    return parsedDuration;
}

function parseDuration(duration) {
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

function _setYear(years, future) {
    if (years) {
        if (years.toString().length == 2) {
            _debug('years has only 2 digits and is set to ' + years);
            var currentYear = future.years().toString();
            years = parseInt(currentYear.substring(0, 2) + years);
        }
        _debug('future.years() = ' + future.years() + ' years = ' + years);
        if (future.years() > years) {
            throw new Error('Year can only be set to the future.');
        } else {
            future.years(years);
        }
    }
}

function _setMonth(months, future) {
    if (months && months >= 1 && months <= 12) {
        // Note: Months are zero indexed, so January is month 0.
        months = months - 1; //since months input is not indexed, we subtract 1.
        _debug('months = ' + months);
        if (future.months() > months) {
            _debug('future.months is greater then months inputted, adding 1 year to future');
            future.add('years', 1);
        }
        future.months(months);
    } else if (months) {
        throw new Error('Month can only be between 1 and 12.')
    }
}

function _setDate(days, future) {
    if (days && days >= 1 && days <= 31) {
        _debug('days = ' + days);
        if (future.date() > days) {
            _debug('future.days is greater then days inputted, adding 1 month to future');
            future.add('months', 1);
        }
        future.date(days);
        if (future.parsingFlags().overflow !== -1)
            throw new Error('Current month ' + future.months() + ' does not have the date inputted ' + days);
    } else if (days) {
        throw new Error('Date can only be between 1 and 31.')
    }
}

function _setHour(hours, future) {
    if (hours && hours >= 0 && hours <= 23) {
        _debug('hours = ' + hours);
        if (future.hours() > hours) {
            _debug('future.hours is greater then hours inputted, adding 1 day to future');
            future.add('days', 1);
        }
        future.hours(hours);
    } else if (hours) {
        throw new Error('Hours can only be between 0 and 23.');
    }
}

function _setMinute(minutes, future) {
    if (minutes && minutes >= 0 && minutes <= 59) {
        _debug('minutes = ' + minutes);
        if (future.minutes() > minutes) {
            _debug('future.minutes is greater then minutes inputted, adding 1 hour to future');
            future.add('hours', 1);
        }
        future.minutes(minutes);
    } else if (minutes) {
        throw new Error('Minutes can only be between 0 and 59.');
    }
}

function _setSecond(seconds, future) {
    if (seconds && seconds >= 0 && seconds <= 59) {
        _debug('seconds = ' + seconds);
        if (future.seconds() > seconds) {
            _debug('future.seconds is greater then seconds inputted, adding 1 minute to future');
            future.add('minutes', 1);
        }
        future.seconds(seconds);
    } else if (seconds) {
        throw new Error('Seconds can only be between 0 and 59.');
    }
}

function _calculateDuration(future, now) {
    // unix() returns seconds since year 0 so we multiply with 1000 to get milliseconds.
    return (future.unix() - now.unix()) * 1000;
}

function _parsePatterns(dateTime) {
    var seconds;
    var minutes;
    var hours;
    var days;
    var months;
    var years;
    var time = _parsePattern1(dateTime);
    if (time) {
        years = time[1] || null;
        months = time[2] || null;
        days = time[3] || null;
        hours = time[4] || null;
        minutes = time[5] || null;
        seconds = time[6] || null;
    }
    else {
        time = _parsePattern2(dateTime);
        if (time) {
            years = time[3] || null;
            months = time[2] || null;
            days = time[1] || null;
            hours = time[4] || time[7] || null;
            minutes = time[5] || time[8] || null;
            seconds = time[6] || time[9] || null;
        }
    }
    return {time: time, years: years, months: months, days: days, hours: hours, minutes: minutes, seconds: seconds};
}

function _parsePattern1(dateTime) {
    var re = /^(?:Y(\d+))?(?:M(\d+))?(?:d(\d+))?(?:h(\d+))?(?:m(\d+))?(?:s(\d+))?$/;
    var time = re.exec(dateTime);
    return time;
}

function _parsePattern2(dateTime) {
    re = /^(?:(?:(\d{1,2})[\/.\\-](\d{1,2})(?:[\/.\\-]((?:\d{2}|\d{4})))?(?:\D(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?)|(?:(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?))$/;
    var time = re.exec(dateTime);
    return time;
}

function parseDateTime(dateTime, now) {
    now = now || moment({ h: 0, m: 0, s: 0 });

    var duration = 0;

    var _ret = _parsePatterns(dateTime);

    if (_ret.time) {
        var future = moment(now);
        _setYear(_ret.years, future);
        _setMonth(_ret.months, future);
        _setDate(_ret.days, future);
        _setHour(_ret.hours, future);
        _setMinute(_ret.minutes, future);
        _setSecond(_ret.seconds, future);
        _debug(future.format());
        return _calculateDuration(future, now);
    }

    return duration;
}

var shouldDebug = false;
function _debug(message){
    if (shouldDebug)
        console.log(message);
}
function enableDebug(){
    shouldDebug = true;
}

module.exports = {
    enableDebug: enableDebug,
    getDuration: getDuration,
    parseDateTime: parseDateTime,
    parseDuration: parseDuration
};