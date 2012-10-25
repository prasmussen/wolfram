var sprintf = require("sprintf").sprintf;

var actions = {};

function initAll(ctx) {
    var names = actionNames(); 
    names.forEach(function(name) {
        var action = actions[name];
        if (action.hasOwnProperty("init")) {
            action.init(ctx);
        }
    });
}

function getActionByPath(path) {
    var actionPath = path.split(".");
    var action = actions;
    for (var i = 0; i < actionPath.length; i++) {
        var name = actionPath[i];
        if (!action.hasOwnProperty(name)) {
            return null;
        }
        action = action[name];
    }
    return action;
}

function isValidActionPath(path) {
    return getActionByPath(path) !== null;
}

function actionNames() {
    var names = [];
    for (var actionName in actions) {
        names.push(actionName);
    }
    return names;
}

function actionFunctionSignatures(actionName) {
    var functions = [];
    // function name(arg1, argN, ctx)
    var signaturePattern = /^function\s+([^\(]+\([^\)]+\))/;
    var action = actions[actionName];
    for (var name in action) {
        var fnString = action[name].toString();
        var signature = fnString.split("\n")[0];
        var match = signaturePattern.exec(signature);
        if (match && match.length > 1 && isActionMethod(match[1])) {
            functions.push(stripContext(match[1]));
        }
    }
    return functions;
}

function isActionMethod(signature) {
    return signature.indexOf("ctx") > -1 || signature.indexOf("context") > -1;
}

// Strip context from signature
function stripContext(name) {
    return name
        .replace("context", "ctx")
        .replace(", ctx", "")
        .replace("ctx", "");
}

function list(ctx) {
    var result = [];
    var names = actionNames();
    names.forEach(function(name) {
        var fns = actionFunctionSignatures(name);
        var msg = sprintf("%s: %s", name, fns.join(", "));
        result.push(msg);
    });
    ctx.callback(result);
}

module.exports = {
    list: list,
    getActionByPath: getActionByPath,
    isValidActionPath: isValidActionPath,
    initAll: initAll
};

// Actions is set after module.exports so that actions.js are required properly
actions = require("require-all")({
    dirname: __dirname,
    filter: /(.+)\.js$/
});
