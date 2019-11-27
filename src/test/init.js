// Make globalThis available everywhere. This is required to execute Jest in node-environments (such as
// GitHub actions)

(function() {
    if (typeof globalThis === "object") return;
    Object.defineProperty(Object.prototype, "__magic__", {
        get: function() {
            return this;
        },
        configurable: true // This makes it possible to `delete` the getter later.
    });
    __magic__.globalThis = __magic__; // lolwat
    delete Object.prototype.__magic__;
}());
