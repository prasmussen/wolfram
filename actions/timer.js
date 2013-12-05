var sprintf = require("sprintf").sprintf;
var mandate = require("../lib/mandate");

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

function _getDuration(duration){
    try{
        return mandate.getDuration(duration, moment());
    } catch(e) {
        sprintf(e.message);
    }
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
