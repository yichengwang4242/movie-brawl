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
  // `params` fill placeholders in the client's translated message, such as
  // {count} in "You need at least {count} friendly characters."
  constructor(code, message, params = null) {
    super(message);
    this.name = "GameRuleError";
    this.code = code;
    this.params = params;
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
