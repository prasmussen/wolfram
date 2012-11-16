var sprintf = require('sprintf').sprintf;

function list(ctx) {
    ctx.db.view("app/triggers", function(err, docs) {
        if (err) {
            console.log(err);
            return ctx.callback("Failed to get triggers");
        }
        var triggers = []
        var trigger = docs.map(function(doc) {
            triggers.push(sprintf("[%d] %s: '%s' => '%s'", triggers.length, doc.name, doc.action, doc.pattern));
        });
        ctx.callback(triggers);
    });
}

function add(name, action, pattern, ctx) {
    if (!isValidActionPath(action)) {
        return ctx.callback("Invalid action path");
    } else if (!isValidRegexp(pattern)) {
        return ctx.callback("Invalid regex pattern");
    }

    var trigger = {
        type: "trigger",
        name: name,
        action: action,
        pattern: pattern
    };

    ctx.db.save(trigger, function(err, res) {
        var msg;
        if (err) {
            msg = sprintf("Failed to add trigger '%s'", name);
        } else {
            msg = sprintf("Trigger '%s' was added", name);
        }
        ctx.callback(msg);
    });
}

function remove(index, ctx) {
    ctx.db.view("app/triggers", function(err, docs) {
        if (err) {
            console.log(err);
            return ctx.callback("Failed to get triggers");
        }

        var doc = docs[index];
        
        if (!doc) {
            return ctx.callback(sprintf("Invalid trigger index"));
        }
        deleteDoc(doc.value);
    });

    function deleteDoc(trigger) {
        ctx.db.remove(trigger._id, trigger._rev, function(err, res) {
            if (err) {
                return ctx.callback(sprintf("Failed to remove trigger '%s'", trigger.name));
            }
            ctx.callback(sprintf("Trigger '%s' removed", trigger.name));
        });
    }
}

function isValidRegexp(pattern) {
    try {
        new RegExp(pattern);
    } catch(e) {
        return false;
    }
    return true;
}

function isValidActionPath(path) {
    var actions = require("./action.js");
    return actions.isValidActionPath(path);
}

module.exports = {
    list: list,
    add: add,
    remove: remove
};

