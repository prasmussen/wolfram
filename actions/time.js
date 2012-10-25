function now(ctx) {
    ctx.callback(parseInt(Date.now() / 1000, 10));
}

module.exports = {
    now: now
};
