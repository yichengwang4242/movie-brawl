"use strict";

const RULES = Object.freeze({
  maxHealth: 30,
  maxMana: 10,
  boardLimit: 7,
  handLimit: 10,
  deckSize: 15,
  openingHand: Object.freeze({ player: 3, enemy: 3 }),
});

class GameRuleError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "GameRuleError";
    this.code = code;
  }
}

function otherSide(side) {
  return side === "player" ? "enemy" : "player";
}

function sideName(side) {
  return side === "player" ? "影迷" : "反派制片方";
}

module.exports = {
  RULES,
  GameRuleError,
  otherSide,
  sideName,
};
