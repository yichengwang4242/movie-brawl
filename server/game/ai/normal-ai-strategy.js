"use strict";

const { AiStrategy } = require("./ai-strategy.js");
const { CombatResolver } = require("../combat-resolver.js");

class NormalAiStrategy extends AiStrategy {
  chooseCard() {
    return this.playableCards().sort(
      (left, right) =>
        right.cost - left.cost ||
        (right.currentAttack || 0) - (left.currentAttack || 0) ||
        (right.currentHealth || 0) - (left.currentHealth || 0),
    )[0];
  }

  chooseTarget(attacker, options = {}) {
    const player = this.engine.players.player;
    const taunts = this.forcedTaunts().sort(
      (left, right) =>
        left.currentHealth - right.currentHealth ||
        right.currentAttack - left.currentAttack,
    );
    if (taunts.length) return taunts[0].instanceId;

    const canHitHero =
      options.heroAttacker ||
      CombatResolver.canAttack(attacker, "hero");
    if (
      canHitHero &&
      (attacker.currentAttack >= player.health || player.board.length === 0)
    ) {
      return "hero";
    }

    const killable = player.board
      .filter((card) => card.currentHealth <= attacker.currentAttack)
      .sort(
        (left, right) =>
          right.currentAttack - left.currentAttack ||
          left.currentHealth - right.currentHealth,
      );
    if (killable.length) return killable[0].instanceId;
    if (canHitHero) return "hero";
    return player.board[0]?.instanceId || null;
  }
}

module.exports = { NormalAiStrategy };
