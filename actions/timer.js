var sprintf = require("sprintf").sprintf;
var moment = require("moment");

var timers = [];

function init(ctx) {
    // Fetch all incomplete timers from database
    ctx.db.view("app/timers", {key: false}, function(err, timers) {
        if (err) {
            return console.log(err);
        }

        // Start timers again
        timers.forEach(function(timer) {
            _start(timer, ctx);
        });
    });
}

function start(name, duration, ctx) {
    var timer = {
        type: "timer",
        name: name,
        start: Date.now(),
        duration: _getDuration(duration),
        owner: ctx.req.source.nick,
        replyTo: ctx.req.replyTo,
        req: ctx.req._id,
        completed: false
    };

    // Save timer to db
    ctx.db.save(timer, function(err, res) {
        if (err) {
            return console.log(err);
        }
        timer._id = res.id;
        // Start timer
        _start(timer, ctx);
    });
}

function _getDuration(duration) {
    var parsedDuration = _parseDuration(duration);
    if (parsedDuration === 0) {
        parsedDuration = _parseDateTime(duration, moment());
    }
    return parsedDuration;
}

function _parseDuration(duration) {
    var t = {
        s: 1000,
        m: 1000 * 60,
        h: 1000 * 60 * 60,
        d: 1000 * 60 * 60 * 24,
        w: 1000 * 60 * 60 * 24 * 7,
        y: 1000 * 60 * 60 * 24 * 365
    }
    
    // Backwards compatibility
    if (!isNaN(duration)) {
        return parseInt(duration, 10) * t.m;
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

function _parseDateTime(dateTime, now){
    var re = /^(?:Y?(\d+))?(?:M?(\d+))?(?:d?(\d+))?(?:h?(\d+))?(?:m?(\d+))?(?:s?(\d+))?$/;
    var time = re.exec(dateTime);

    var duration = 0;

    if (time) {

        var years =   time[1] || 0;
        var months =  time[2] || 0;
        var days =    time[3] || 0;
        var hours =   time[4] || 0;
        var minutes = time[5] || 0;
        var seconds = time[6] || 0;

        var future = moment(now);

        if (years !== 0) {
            debug('\nyears is not 0');
            if (future.years() <= years){
                debug('future.years is less or equal to years inputed');
                future.years(years);
            } else {
                throw new Error('Year can not be set to the past.');
            }
        }
        if (months !== 0) {
            // Note: Months are zero indexed, so January is month 0.
            debug('\nmonths is not 0');
            months = months - 1; //since months input is not indexed, we subtract 1.
            if (months >= 0 && months <= 11) {
            debug('months is equal to or in between 0 and 11');
                if (future.months() > months){
                    debug('future.months is greater then months inputed, will add 1 year to future');
                    future.add('years', 1);
                }
                future.months(months);
            } else {
                throw new Error('Month can only be between 1 and 12.')
            }
        }
        if (days !== 0) {
            debug('\ndays is not 0');
            if (moment({ M: future.months, d: days }).parsingFlags().overflow !== -1){
                throw new Error('Days exceeded amount of days for month.');
            }
            else if (future.date() > days){
                debug('future.days is greater then days inputed, will add 1 month to future');
                future.add('months', 1);
            }
            future.date(days);
        }
        if (hours !== 0) {
            debug('\nhours is not 0');
            if (hours < 24) {
                debug('hours is less then 24');
                if (future.hours() > hours){
                    debug('future.hours is greater then hours inputed, will add 1 day to future');
                    future.add('days', 1);
                }
                future.hours(hours);
            } else {
                throw new Error('Hours can not be equal to or greater then 24.');
            }
        }
        if (minutes !== 0) {
            debug('\nminutes is not 0');
            if (minutes < 60){
                debug('minutes is less then 60');
                if (future.minutes() > minutes){
                    debug('future.minutes is greater then minutes inputed, will add 1 hour to future');
                    future.add('hours', 1);
                }
                future.minutes(minutes);
            } else {
                throw new Error('Minutes can not be equal to or greater then 60.');
            }
        }
        if (seconds !== 0) {
            debug('\nseconds is not 0');
            if (seconds < 60) {
                debug('seconds is less then 60');
                if (future.seconds() > seconds) {
                    debug('future.seconds is greater then seconds inputed, will add 1 minute to future');
                    future.add('minutes', 1);
                }
                future.seconds(seconds);
            } else {
                throw new Error('Seconds can not exceed 60.');
            }
        }

        debug(future.format());

        // unix() returns seconds since year 0 so we multiply with 1000 to get milliseconds.
        duration = (future.unix() - now.unix()) * 1000;
        return duration;
    }

    return duration;
}

function _start(timer, ctx) {
    // Start timer, add cancel function and push the timer object to the global timers array
    timer.cancel = setTimeout2(timerCompleted, remainingDuration(timer));
    timers.push(timer);

    // If there is a callback it means that this is a "live" request (i.e. not restored from the db).
    if (ctx.callback) {
        // Lets send a confirmation back to the user that the timer has started
        ctx.callback(sprintf("%s: Timer '%s' has started. Will complete at %s", timer.owner, timer.name, formatDate(completionDate(timer))));
    }

    function timerCompleted() {
        // We cant rely on having a callback at this point as the timer could have been restored from the db.
        // Lets configure the response manually and use saveResponse instead.
        var response = {
            type: "response",
            req: timer.req,
            message: sprintf("%s: Timer '%s' completed", timer.owner, timer.name),
            target: timer.replyTo
        };

        ctx.saveResponse(response, function(id) {
            if (id) {
                markAsCompleted(timer, ctx);
            }
        });
    }
}

function cancel(index, ctx) {
    if (index.toLowerCase() == "last") {
        index = timers.length - 1;
    }
    var timer = timers[index];
    if (!timer) {
        return ctx.callback("Invalid timer index");
    }
    timer.cancel();
    markAsCompleted(timer, ctx, function() {
        ctx.callback(sprintf("Timer '%s' is canceled", timer.name));
    });
}

function list(ctx) {
    var result = timers.map(function(timer, index) {
        return sprintf("[%d] <%s> %s %s", index, timer.owner, timer.name, formatDate(completionDate(timer)));
    });

    if (result.length === 0) {
        result.push("No timers currently active");
    }
    ctx.callback(result);
}

// Helper functions

// setTimeout replacement with no signed 32-bit limit
// returns cancel function instead of an id
function setTimeout2() {
    var max = Math.pow(2, 32) / 2 - 1;
    var currentId;

    function st(callback, duration) {
        var remaining = 0;

        if (duration > max) {
            remaining = duration - max;
            duration = max % duration;
        }

        currentId = setTimeout(function() {
            return (remaining > 0) ? st(callback, remaining) : callback();
        }, duration);
    }
    st.apply(this, arguments);
    
    return function() {
        clearTimeout(currentId);
    };
}

function remainingDuration(timer) {
    return (timer.start + timer.duration) - Date.now();
}

function completionDate(timer) {
    return new Date(timer.start + timer.duration);
}

function formatDate(d) {
    return sprintf("%04d-%02d-%02d %02d:%02d:%02d", d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
}

function markAsCompleted(timer, ctx, callback) {
    ctx.db.merge(timer._id, {completed: true}, function(err, res) {
        if (err) {
            console.log(err);
        }
        deleteTimer(timer._id);
        if (callback) {
            callback();
        }
    });
}

function deleteTimer(id) {
    timers = timers.filter(function(timer) {
        return timer._id !== id;
    });
}

var shouldDebug = false;
function debug(message){
    if (shouldDebug)
        console.log(message);
}

module.exports = {
    init: init,
    start: start,
    list: list,
    cancel: cancel,
    privates: {
        debug: shouldDebug,
        _getDuration: _getDuration,
        _parseDuration: _parseDuration,
        _parseDateTime: _parseDateTime
    }
};
