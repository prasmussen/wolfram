var sprintf = require('sprintf').sprintf;

function list(ctx) {
    ctx.db.view("app/triggers", function(err, docs) {
        if (err) {
            console.log(err);
            return ctx.callback("Failed to get triggers");
        }
        var triggers = docs.map(function(doc) {
            return sprintf("%s: '%s' => '%s'", doc.name, doc.action, doc.pattern);
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

function remove(name, ctx) {
    ctx.db.view("app/triggers", function(err, docs) {
        if (err) {
            console.log(err);
            return ctx.callback("Failed to get triggers");
        }

        var match = docs.filter(function(trigger) {
            return name === trigger.value.name;
        });
        
        if (match.length > 0) {
            deleteDoc(match[0].value);
        } else {
            ctx.callback(sprintf("Trigger '%s' not found", name));
        }
    });

    function deleteDoc(doc) {
        ctx.db.remove(doc._id, doc._rev, function(err, res) {
            if (err) {
                return ctx.callback(sprintf("Failed to remove trigger '%s'", name));
            }
            ctx.callback(sprintf("Trigger '%s' removed", name));
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

