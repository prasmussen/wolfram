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
        parsedDuration = _parseDateTime(duration);
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

function _parseDateTime(dateTime){
    var re = /^(?:Y+(\d+))?(?:W+(\d+))?(?:D+(\d+))?(?:H+(\d+))?(?:M+(\d+))?(?:S+(\d+))?$/i;
    var time = re.exec(dateTime);

    var duration = 0;

    if (time) {

        var years =   time[1] || null;
        var months =  time[2] || null;
        var days =    time[3] || null;
        var hours =   time[4] || null;
        var minutes = time[5] || 0;
        var seconds = time[6] || 0;

        var mom = moment();
        if (years !== null) mom.years(years);
        if (months !== null) mom.months(months);
        if (days !== null) mom.days(days);
        if (hours !== null) mom.hours(hours);
        mom.minutes(minutes);
        mom.seconds(seconds);

        // unix() returns seconds since year 0 so we multiply with 1000 to get milliseconds.
        duration = (mom.unix() - moment().unix()) * 1000;
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

module.exports = {
    init: init,
    start: start,
    list: list,
    cancel: cancel
};
