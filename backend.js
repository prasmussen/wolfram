var cradle = require("cradle");
var sprintf = require("sprintf").sprintf;
var fs = require("fs");
var actions = require("./actions/action");
var helper = require("./lib/helper");
var log = helper.log;

// Read config file
var config = JSON.parse(fs.readFileSync("wolfram.config", "utf8"));

// Init database connection
var db = new(cradle.Connection)(config.couchdb.url, config.couchdb.port, { 
    auth: {username: config.couchdb.user, password: config.couchdb.password},
    cache: true,
    raw: false
}).database(config.couchdb.database);

// Configure couchdb feed to listen for request messages
var feed = db.changes({
    since: "now",
    include_docs: true,
    filter: function(doc, req) {
        return doc.type === "request";
    }
});

feed.on("change", function(change) {
    log("db", sprintf("%s changed", change.id));
    handler(change.doc);
});

// Perform action init
actions.initAll({
    db: db,
    config: config,
    saveResponse: saveResponse
});

// Request handler
function handler(req) {
    db.view("app/triggers", function(err, triggers) {
        if (err) {
            return console.log(err);
        }
        triggers.forEach(function(trigger) {
            match(trigger);
        });
    });

    function match(trigger) {
        var re = new RegExp(trigger.pattern);
        var m = re.exec(req.message);
        if (m && m.length > 0) {
            log("handler", sprintf("Match on trigger '%s' for '%s'", trigger.name, req.message));
            performAction(trigger.action, m.slice(1));
        }
    }

    function performAction(actionPath, args) {
        var action = actions.getActionByPath(actionPath);
        if (!action) {
            return;
        }

        // Add context object as last parameter to the action function
        args.push({
            callback: actionResponse,
            saveResponse: saveResponse,
            req: req,
            db: db,
            config: config
        });

        try {
            action.apply(this, args);
        } catch(e) {
            console.log(e);
        }
    }

    function actionResponse(message) {
        log("handler", sprintf("Posting response: %s", message));
        saveResponse({
            type: "response",
            req: req._id,
            message: message,
            target: req.replyTo
        });
    }
}

function saveResponse(response, callback) {
    if (!callback) {
        callback = helper.noop;
    }
    var id = helper.createId(response.req + response.message);
    db.update("app/request", id, response, function(err, doc) {
        if (err) {
            console.log(err);
            return callback(null);
        }
        log("db", sprintf("%s saved successfully", doc._id));
        callback(id);
    });
}
