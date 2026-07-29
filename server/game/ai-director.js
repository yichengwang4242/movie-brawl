"use strict";

const { EasyAiStrategy } = require("./ai/easy-ai-strategy.js");
const { NormalAiStrategy } = require("./ai/normal-ai-strategy.js");
const { HardAiStrategy } = require("./ai/hard-ai-strategy.js");

const STRATEGIES = {
  easy: EasyAiStrategy,
  normal: NormalAiStrategy,
  hard: HardAiStrategy,
};

class AiDirector {
  constructor(engine, difficulty = "normal") {
    this.engine = engine;
    this.difficulty = STRATEGIES[difficulty] ? difficulty : "normal";
    const Strategy = STRATEGIES[this.difficulty];
    this.strategy = new Strategy(engine);
  }

  runTurn() {
    this.playCards();
    this.attackWithBoard();
    this.attackWithWeapon();
  }

  playCards() {
    let plays = 0;
    while (
      this.engine.phase === "playing" &&
      plays < this.strategy.cardPlayLimit
    ) {
      const card = this.strategy.chooseCard();
      if (!card) return;
      this.engine.playCard("enemy", card.instanceId);
      plays += 1;
    }
  }

  attackWithBoard() {
    const attackers = this.strategy.orderAttackers(
      [...this.engine.players.enemy.board],
    );
    for (const card of attackers) {
      if (this.engine.phase !== "playing") return;
      if (!this.engine.players.enemy.board.includes(card)) continue;
      if (!this.strategy.shouldAttack(card)) continue;
      const target = this.strategy.chooseTarget(card);
      if (target) this.engine.combat.attack("enemy", card.instanceId, target);
    }
  }

  attackWithWeapon() {
    if (
      this.engine.phase !== "playing" ||
      !this.engine.combat.canHeroAttack("enemy")
    ) {
      return;
    }
    if (!this.strategy.shouldAttack()) return;
    const target = this.strategy.chooseHeroTarget();
    if (target) this.engine.combat.heroAttack("enemy", target);
  }
}

module.exports = { AiDirector, STRATEGIES };
