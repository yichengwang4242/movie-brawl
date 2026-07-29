"use strict";

const { RULES, GameRuleError } = require("./game/rules.js");
const { GameEngine } = require("./game/game-engine.js");
const { CombatResolver } = require("./game/combat-resolver.js");

function createGame(options = {}) {
  return new GameEngine(options);
}

function performAction(game, action, side = "player") {
  game.performAction(action, side);
  return game;
}

function toPublicState(game) {
  return game.toPublicState();
}

module.exports = {
  RULES,
  GameRuleError,
  GameEngine,
  createGame,
  performAction,
  toPublicState,
  _internals: {
    attack: (game, side, attackerId, target) =>
      game.combat.attack(side, attackerId, target),
    beginTurn: (game, side, options) =>
      game.state.beginTurn(side, game.cards, options),
    canAttack: CombatResolver.canAttack,
    checkGameOver: (game) => game.state.checkGameOver(),
    cleanupBoards: (game) => game.deaths.resolve(),
    createCardInstance: (game, base) => game.cards.createInstance(base),
    damageHero: (game, targetSide, amount, source, sourceSide) =>
      game.combat.damageHero(targetSide, amount, source, sourceSide),
    damageMinion: (game, target, amount, source, sourceSide) =>
      game.combat.damageMinion(target, amount, source, sourceSide),
    playCard: (game, side, instanceId) => game.playCard(side, instanceId),
  },
};
