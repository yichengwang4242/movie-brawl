"use strict";

class RandomSource {
  constructor(seed = Date.now()) {
    const normalized = Number.isInteger(seed) ? seed >>> 0 : Date.now() >>> 0;
    this.seed = normalized || 1;
  }

  next() {
    this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }

  item(items) {
    if (!items.length) return null;
    return items[Math.floor(this.next() * items.length)];
  }

  shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const target = Math.floor(this.next() * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  }
}

module.exports = { RandomSource };
