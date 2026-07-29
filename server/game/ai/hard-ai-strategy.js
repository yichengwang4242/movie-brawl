"use strict";

const { NormalAiStrategy } = require("./normal-ai-strategy.js");
const { CombatResolver } = require("../combat-resolver.js");

class HardAiStrategy extends NormalAiStrategy {
  chooseCard() {
    return this.playableCards()
      .map((card) => ({ card, score: this.cardScore(card) }))
      .sort((left, right) => right.score - left.score)[0]?.card;
  }

  cardScore(card) {
    const manaFit = card.cost === this.engine.players.enemy.mana ? 3 : 0;
    const stats = (card.attack || 0) + (card.health || 0) * 0.75;
    const keywordValue = card.keywords.reduce(
      (total, keyword) =>
        total +
        ({ taunt: 1.5, lifesteal: 2, shield: 2, rush: 1.5, reflect: 1.5 }[
          keyword
        ] || 0),
      0,
    );
    const effectValue =
      (card.effects?.length || 0) * 1.4 +
      (card.deathEffects?.length || 0) * 1.2;
    const weaponValue =
      card.type === "weapon"
        ? (card.attack || 0) * (card.durability || 0) * 0.65
        : 0;
    return manaFit + stats + keywordValue + effectValue + weaponValue;
  }

  orderAttackers(cards) {
    return super
      .orderAttackers(cards)
      .sort(
        (left, right) =>
          left.currentAttack - right.currentAttack ||
          left.currentHealth - right.currentHealth,
      );
  }

  chooseTarget(attacker, options = {}) {
    const player = this.engine.players.player;
    const taunts = this.forcedTaunts();
    const candidates = taunts.length ? taunts : player.board;
    const canHitHero =
      options.heroAttacker ||
      CombatResolver.canAttack(attacker, "hero");

    if (canHitHero && !taunts.length && attacker.currentAttack >= player.health) {
      return "hero";
    }

    const valuedKills = candidates
      .filter((card) => card.currentHealth <= attacker.currentAttack)
      .map((card) => ({
        card,
        score:
          card.currentAttack * 2 +
          card.currentHealth +
          card.keywords.length * 1.5 -
          (card.currentAttack >= attacker.currentHealth ? 2 : 0),
      }))
      .sort((left, right) => right.score - left.score);
    if (valuedKills.length) return valuedKills[0].card.instanceId;

    if (taunts.length) {
      return [...taunts].sort(
        (left, right) => left.currentHealth - right.currentHealth,
      )[0].instanceId;
    }

    if (canHitHero) return "hero";
    return candidates
      .sort(
        (left, right) =>
          left.currentHealth - right.currentHealth ||
          right.currentAttack - left.currentAttack,
      )[0]?.instanceId;
  }
}

module.exports = { HardAiStrategy };
