"use strict";

const { RULES } = require("./rules.js");
const { CombatResolver } = require("./combat-resolver.js");

class GameSerializer {
  constructor(engine) {
    this.engine = engine;
  }

  toPublicState() {
    const state = this.engine.state;
    return {
      schemaVersion: state.schemaVersion,
      version: state.version,
      phase: state.phase,
      winner: state.winner,
      turn: state.turn,
      activeSide: state.activeSide,
      aiDifficulty: this.engine.aiDifficulty,
      encounter: this.engine.encounter?.toPublicState() || null,
      rules: RULES,
      player: this.publicPlayer("player", true),
      enemy: this.publicPlayer("enemy", false),
      logs: state.logs.slice(-14).reverse(),
    };
  }

  publicPlayer(side, revealHand) {
    const player = this.engine.players[side];
    return {
      name: player.name,
      health: Math.max(0, player.health),
      maxHealth: player.maxHealth,
      maxMana: player.maxMana,
      mana: player.mana,
      fatigue: player.fatigue,
      cardsPlayedThisTurn: player.cardsPlayedThisTurn,
      charactersLostThisTurn: player.charactersLostThisTurn,
      weapon: player.weapon ? this.publicCard(player.weapon) : null,
      heroCanAttack:
        this.engine.activeSide === side &&
        this.engine.combat.canHeroAttack(side),
      deckCount: player.deck.length,
      handCount: player.hand.length,
      hand: revealHand
        ? player.hand.map((card) =>
            this.publicCard(card, {
              playable: this.engine.isCardPlayable(side, card),
            }),
          )
        : [],
      board: player.board.map((card) =>
        this.publicCard(card, {
          canAttack:
            this.engine.activeSide === side &&
            CombatResolver.canAttack(card, "minion"),
        }),
      ),
      zones: {
        graveyard: player.graveyard.map((entry) =>
          this.publicZoneEntry(entry),
        ),
        burned: player.burned.map((entry) => this.publicZoneEntry(entry)),
        exiled: player.exiled.map((entry) => this.publicZoneEntry(entry)),
      },
      deckBreakdown: revealHand ? this.deckBreakdown(player.deckRecipe) : [],
    };
  }

  publicZoneEntry(entry) {
    return {
      sequence: entry.sequence,
      turn: entry.turn,
      side: entry.side,
      zone: entry.zone,
      reason: entry.reason,
      card: this.publicCard(entry.card),
    };
  }

  publicCard(card, options = {}) {
    return {
      id: card.id,
      instanceId: card.instanceId,
      type: card.type,
      star: card.star,
      region: card.region,
      rarity: card.rarity,
      role: card.role,
      movie: card.movie,
      cost: card.cost,
      attack: card.attack,
      health: card.health,
      currentAttack: card.currentAttack,
      currentHealth: card.currentHealth,
      maxHealth: card.maxHealth,
      currentDurability: card.currentDurability,
      maxDurability: card.maxDurability,
      reflect: card.reflect,
      motif: card.motif,
      palette: card.palette,
      text: card.text,
      keywords: [...card.keywords],
      requirements: card.requirements ? { ...card.requirements } : null,
      shield: card.shield,
      stunned: card.stunned,
      attackRestriction: card.attackRestriction,
      canAttack: options.canAttack || false,
      playable: options.playable || false,
    };
  }

  deckBreakdown(recipe) {
    const counts = new Map();
    for (const card of recipe) {
      const key =
        card.type === "spell"
          ? "法术牌"
          : card.type === "weapon"
            ? "武器牌"
            : card.star;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort(
        (left, right) =>
          right.count - left.count || left.name.localeCompare(right.name, "zh-CN"),
      );
  }
}

module.exports = { GameSerializer };
