var sprintf = require("sprintf").sprintf;

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

function start(name, minutes, ctx) {
    var timer = {
        type: "timer",
        name: name,
        start: Date.now(),
        duration: parseInt(minutes, 10) * 60 * 1000,
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

function _start(timer, ctx) {
    // Start timer, add timeoutId attribute and push the timer object to the global timers array
    timer.timeoutId = setTimeout(timerCompleted, remainingDuration(timer));
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

function cancel(name, ctx) {
    var timer = findTimerWithName(name);
    if (!timer) {
        return ctx.callback(sprintf("Timer '%s' not found", name));
    }
    clearTimeout(timer.timeoutId);
    markAsCompleted(timer, ctx, function() {
        ctx.callback(sprintf("Timer '%s' is canceled", name));
    });
}

function list(ctx) {
    var result = timers.map(function(timer) {
        return sprintf("<%s> %s %s", timer.owner, timer.name, formatDate(completionDate(timer)));
    });

    if (result.length === 0) {
        result.push("No timers currently active");
    }
    ctx.callback(result);
}

// Helper functions
function remainingDuration(timer) {
    return (timer.start + timer.duration) - Date.now();
}

function completionDate(timer) {
    return new Date(timer.start + timer.duration);
}

function formatDate(d) {
    return sprintf("%04d-%02d-%02d %02d:%02d:%02d", d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
}

function markAsCompleted(timer, ctx, callback) {
    ctx.db.merge(timer._id, {completed: true}, function(err, res) {
        if (err) {
            console.log(err);
        }
        deleteTimerWithName(timer.name);
        if (callback) {
            callback();
        }
    });
}

function deleteTimerWithName(name) {
    timers = timers.filter(function(timer) {
        return timer.name !== name;
    });
}

function findTimerWithName(name) {
    var matches = timers.filter(function(timer) {
        return timer.name === name;
    });

    if (matches.length > 0) {
        return matches[0];
    }
    return null;
}

module.exports = {
    init: init,
    start: start,
    list: list,
    cancel: cancel
};
