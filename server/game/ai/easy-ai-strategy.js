"use strict";

const { AiStrategy } = require("./ai-strategy.js");

class EasyAiStrategy extends AiStrategy {
  get cardPlayLimit() {
    return 1;
  }

  shouldAttack() {
    return this.engine.cards.random.next() >= 0.3;
  }

  chooseCard() {
    return this.engine.cards.random.item(this.playableCards());
  }

  orderAttackers(cards) {
    return this.engine.cards.random.shuffle(super.orderAttackers(cards));
  }

  chooseTarget(attacker, options = {}) {
    return this.engine.cards.random.item(
      this.legalTargets(attacker, options),
    );
  }
}

module.exports = { EasyAiStrategy };
