"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var seededRandom = /** @class */ (function () {
    function seededRandom(seed) {
        this.seed = seed;
    }
    seededRandom.prototype.next = function (min, max) {
        max = max || 1;
        min = min || 0;
        this.seed = (this.seed * 9301 + 49297) % 233280;
        var rnd = this.seed / 233280;
        return min + rnd * (max - min);
    };
    return seededRandom;
}());
exports.seededRandom = seededRandom;
