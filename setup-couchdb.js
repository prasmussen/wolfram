var couchapp = require('couchapp');

var design = {
    _id: '_design/app',
    views: {},
    updates: {}
};

design.views.triggers = {
    map: function(doc) {
        if (doc.type === "trigger") {
            emit(doc.name, doc);
        }
    }
};

design.views.timers = {
    map: function(doc) {
        if (doc.type === "timer") {
            emit(doc.completed, doc);
        }
    }
};

design.updates.request = function(oldDoc, req) {
    var doc;
    var now = Date.now();

    if (oldDoc) {
        if ((now - oldDoc.updated) < 5000) {
            var msg = oldDoc._id  + " was updated < 5 seconds ago";
            return [null, {code: 409, headers: {"Content-Type" : "text/plain"}, body: msg}];
        }
        doc = oldDoc;
    } else {
        // Create new document
        doc = JSON.parse(req.body);
        doc._id = req.id;
        doc.created = now;
    }
    doc.updated = now;
    return [doc, toJSON(doc)];
};

module.exports = design;
