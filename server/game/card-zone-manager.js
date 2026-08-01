"use strict";

const { RULES } = require("./rules.js");

const RECORDED_ZONES = new Set(["graveyard", "burned", "exiled"]);

function cloneEffect(effect) {
  return {
    ...effect,
    ...(effect.token ? { token: { ...effect.token } } : {}),
    ...(effect.effects
      ? { effects: effect.effects.map(cloneEffect) }
      : {}),
    ...(effect.commercialEffects
      ? { commercialEffects: effect.commercialEffects.map(cloneEffect) }
      : {}),
    ...(effect.creativeEffects
      ? { creativeEffects: effect.creativeEffects.map(cloneEffect) }
      : {}),
    ...(effect.deathEffect
      ? { deathEffect: { ...effect.deathEffect } }
      : {}),
  };
}

class CardZoneManager {
  constructor(state) {
    this.state = state;
  }

  drawTop(side, cardFactory) {
    const base = this.state.player(side).deck.shift();
    return base ? cardFactory.createInstance(base) : null;
  }

  addToHand(side, card) {
    this.state.player(side).hand.push(card);
    return card;
  }

  removeFromHand(side, instanceId) {
    const hand = this.state.player(side).hand;
    const index = hand.findIndex((card) => card.instanceId === instanceId);
    if (index < 0) return null;
    return hand.splice(index, 1)[0];
  }

  addToBoard(side, card) {
    this.state.player(side).board.push(card);
    return card;
  }

  returnBoardCardToHand(side, card, costAdjustment = 0) {
    const player = this.state.player(side);
    if (player.hand.length >= RULES.handLimit) return null;
    const index = player.board.findIndex(
      (candidate) => candidate.instanceId === card.instanceId,
    );
    if (index < 0) return null;

    const [returned] = player.board.splice(index, 1);
    returned.cost = Math.max(0, returned.cost + costAdjustment);
    returned.currentAttack = returned.attack || 0;
    returned.currentHealth = returned.health || 0;
    returned.maxHealth = returned.health || 0;
    returned.keywords = [...(returned.printedKeywords || returned.keywords)];
    returned.deathEffects = (returned.printedDeathEffects || []).map(
      (effect) => cloneEffect(effect),
    );
    returned.reflect = returned.printedReflect || 0;
    returned.attacksRemaining = 0;
    returned.attackRestriction = null;
    returned.summonedTurn = null;
    returned.shield = returned.keywords.includes("shield");
    returned.stunned = false;
    returned.skipNextReady = false;
    player.hand.push(returned);
    return returned;
  }

  equipWeapon(side, card) {
    const player = this.state.player(side);
    const replaced = player.weapon;
    if (replaced) {
      this.moveToGraveyard(side, replaced, "weapon-replaced");
    }
    player.weapon = card;
    return replaced;
  }

  destroyWeapon(side, reason = "weapon-broken") {
    const player = this.state.player(side);
    const weapon = player.weapon;
    if (!weapon) return null;
    player.weapon = null;
    this.moveToGraveyard(side, weapon, reason);
    return weapon;
  }

  takeDeadCards() {
    const fallenCards = [];
    for (const side of ["player", "enemy"]) {
      const player = this.state.player(side);
      const fallen = player.board.filter((card) => card.currentHealth <= 0);
      for (const card of fallen) {
        player.charactersLostThisTurn += 1;
        this.state.addLog(`${card.role} 退场。`, "damage");
        this.moveToGraveyard(side, card, "destroyed");
        fallenCards.push({ side, card });
      }
      player.board = player.board.filter((card) => card.currentHealth > 0);
    }
    return fallenCards;
  }

  exileFromBoard(side, cards, reason = "effect-consumed") {
    const player = this.state.player(side);
    const ids = new Set(cards.map((card) => card.instanceId));
    const removed = player.board.filter((card) => ids.has(card.instanceId));
    player.board = player.board.filter((card) => !ids.has(card.instanceId));
    for (const card of removed) {
      this.moveToExile(side, card, reason);
    }
    return removed;
  }

  moveToGraveyard(side, card, reason) {
    return this.record(side, "graveyard", card, reason);
  }

  moveToBurned(side, card, reason = "hand-full") {
    return this.record(side, "burned", card, reason);
  }

  moveToExile(side, card, reason) {
    return this.record(side, "exiled", card, reason);
  }

  record(side, zone, card, reason) {
    if (!RECORDED_ZONES.has(zone)) {
      throw new Error(`Unsupported recorded zone: ${zone}`);
    }
    const entry = {
      sequence: ++this.state.zoneEventCounter,
      turn: this.state.turn,
      side,
      zone,
      reason,
      card: this.snapshot(card),
    };
    this.state.player(side)[zone].push(entry);
    return entry;
  }

  snapshot(card) {
    return {
      ...card,
      keywords: [...(card.keywords || [])],
      effects: (card.effects || []).map(cloneEffect),
      deathEffects: (card.deathEffects || []).map(cloneEffect),
      requirements: card.requirements ? { ...card.requirements } : null,
    };
  }
}

module.exports = { CardZoneManager };
