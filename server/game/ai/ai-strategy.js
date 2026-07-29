"use strict";

const { CombatResolver } = require("../combat-resolver.js");

class AiStrategy {
  constructor(engine) {
    this.engine = engine;
  }

  playableCards() {
    return this.engine.players.enemy.hand.filter((card) =>
      this.engine.isCardPlayable("enemy", card),
    );
  }

  get cardPlayLimit() {
    return 12;
  }

  shouldAttack() {
    return true;
  }

  orderAttackers(cards) {
    return cards.filter((card) => CombatResolver.canAttack(card, "minion"));
  }

  forcedTaunts() {
    return this.engine.players.player.board.filter((card) =>
      card.keywords.includes("taunt"),
    );
  }

  legalTargets(attacker, options = {}) {
    const taunts = this.forcedTaunts();
    if (taunts.length) return taunts.map((card) => card.instanceId);

    const targets = this.engine.players.player.board.map(
      (card) => card.instanceId,
    );
    const canHitHero =
      options.heroAttacker ||
      CombatResolver.canAttack(attacker, "hero");
    if (canHitHero) targets.push("hero");
    return targets;
  }

  chooseHeroTarget() {
    return this.chooseTarget(
      {
        currentAttack: this.engine.players.enemy.weapon?.currentAttack || 0,
      },
      { heroAttacker: true },
    );
  }

  chooseTarget() {
    return null;
  }
}

module.exports = { AiStrategy };
