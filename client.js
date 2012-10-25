var irc = require("irc");
var sprintf = require("sprintf").sprintf;
var cradle = require("cradle");
var fs = require("fs");
var helper = require("./lib/helper");
var log = helper.log;

// Read config file
var config = JSON.parse(fs.readFileSync("wolfram.config", "utf8"));

// Init database connection
var db = new(cradle.Connection)(config.couchdb.url, config.couchdb.port, { 
    auth: {username: config.couchdb.user, password: config.couchdb.password}
}).database(config.couchdb.database);

// Irc connection
var client = new irc.Client(config.irc.server, config.irc.nick, {
    channels: config.irc.channels,
    userName: config.irc.username,
    realName: config.irc.realname
});

// Configure couchdb feed to listen for response messages
var feed = db.changes({
    since: "now",
    include_docs: true,
    filter: function(doc, req) {
        return doc.type === "response";
    }
});

feed.on("change", function(change) {
    log("db", sprintf("%s changed", change.id));
    var doc = change.doc;
    say(doc.target, doc.message);
});

// Listen for irc messages
client.addListener("message", function(nick, target, message, raw) {
    log("irc", sprintf("%s => %s: %s", nick, target, message));

    var request = {
        type: "request",
        message: message,
        source: {
            nick: nick,
            host: raw.host
        },
        replyTo: isChannel(target) ? target : nick
    };

    // Generate document id
    var id = helper.createId(nick + raw.host + message + request.replyTo);

    // Save document as a request to the database
    db.update("app/request", id, request, function(err, doc) {
        if (err) {
            return console.log(err);
        } else if (!doc._id) {
            var msg = sprintf("%s not updated", id);
            return log("db", msg);
        }
        log("db", sprintf("%s saved successfully", doc._id));
    });
});

function say(target, message) {
    //TODO: create array of messages > 200 chars
    if (Array.isArray(message)) {
        return message.forEach(function(msg, i) {
            setTimeout(function() {
                say(target, msg);
            }, i * 200);
        });
    }
    log("irc", sprintf("%s => %s: %s", "/me", target, message));
    client.say(target, message);
}

// Returns true if target starts with a '#'
function isChannel(target) {
    return target.indexOf("#") === 0;
}
