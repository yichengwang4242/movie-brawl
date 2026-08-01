"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createAdventureStageGame, placeCard } = require("../test-support/adventure-test-helpers.js");
const cards = require("../golden-harvest-cards.js");
const adventure = require("../golden-harvest-adventure.js");
const { createGame, performAction, _internals } = require("../server/game-engine.js");

test("嘉禾八种头目机制按各自触发条件改变战局", () => {
  const factory = createAdventureStageGame(adventure, 0);
  factory.players.enemy.board = [];
  factory.encounter.beforeEnemyTurn();
  assert.equal(factory.players.enemy.board[0].role, "冰厂打手");

  const altar = createAdventureStageGame(adventure, 1);
  altar.state.turn = 2;
  altar.players.enemy.board = [];
  altar.encounter.beforeEnemyTurn();
  assert.equal(altar.players.enemy.board[0].role, "纸人");

  const tower = createAdventureStageGame(adventure, 2);
  tower.state.turn = 3;
  tower.players.player.board = [];
  const towerTarget = placeCard(tower, "player", { health: 3 });
  tower.encounter.beforeEnemyTurn();
  assert.equal(towerTarget.currentHealth, 2);

  const luckyStars = createAdventureStageGame(adventure, 3);
  luckyStars.players.enemy.board = [];
  luckyStars.encounter.beforeEnemyTurn();
  assert.equal(luckyStars.players.enemy.board[0].role, "福星拍档");

  const mall = createAdventureStageGame(adventure, 4);
  mall.players.enemy.board = [];
  const officer = placeCard(mall, "enemy", { attack: 2 });
  mall.players.enemy.health = 18;
  mall.encounter.beforeEnemyTurn();
  assert.equal(officer.currentAttack, 3);
  assert.equal(mall.players.enemy.board.at(-1).role, "重案警员");
  assert.equal(mall.players.enemy.board.length, 2);
  mall.encounter.beforeEnemyTurn();
  assert.equal(mall.players.enemy.board.length, 2);

  const jungle = createAdventureStageGame(adventure, 5);
  jungle.state.turn = 2;
  jungle.players.player.board = [];
  const scout = placeCard(jungle, "player", { attack: 4, health: 3 });
  placeCard(jungle, "player", { attack: 2, health: 3 });
  jungle.encounter.beforeEnemyTurn();
  assert.equal(scout.currentHealth, 2);

  const lion = createAdventureStageGame(adventure, 6);
  lion.state.turn = 2;
  lion.players.enemy.board = [];
  const lionTarget = placeCard(lion, "enemy", { health: 3 });
  lion.encounter.beforeEnemyTurn();
  assert.equal(lionTarget.currentHealth, 3);
  assert.equal(lionTarget.currentAttack, 4);
  assert.equal(lionTarget.maxHealth, 3);

  const colosseum = createAdventureStageGame(adventure, 7);
  colosseum.players.enemy.board = [];
  colosseum.state.turn = 1;
  colosseum.encounter.beforeEnemyTurn();
  assert.equal(colosseum.players.enemy.board[0].role, "罗马拳手");
  colosseum.state.turn = 2;
  colosseum.encounter.beforeEnemyTurn();
  assert.equal(colosseum.players.enemy.board[0].currentAttack, 3);
  colosseum.players.player.board = [];
  const duelTarget = placeCard(colosseum, "player", { health: 3 });
  colosseum.state.turn = 3;
  colosseum.encounter.beforeEnemyTurn();
  assert.equal(duelTarget.currentHealth, 2);
});

test("嘉禾连拍要求先出另一张牌，并在新回合重置", () => {
  const game = createGame({ seed: 211 });
  game.players.player.hand = [];
  game.players.player.board = [];
  game.players.player.mana = 10;
  const definition = cards.allCards.find(
    (card) => card.role === "冰厂工友",
  );
  const opener = _internals.createCardInstance(game, definition);
  const followUp = _internals.createCardInstance(game, definition);
  game.players.player.hand.push(opener, followUp);

  performAction(game, { type: "PLAY_CARD", cardId: opener.instanceId });
  assert.equal(opener.currentHealth, 1);
  performAction(game, { type: "PLAY_CARD", cardId: followUp.instanceId });
  assert.equal(followUp.currentHealth, 2);
  assert.equal(game.players.player.cardsPlayedThisTurn, 2);

  _internals.beginTurn(game, "player", { draw: false });
  assert.equal(game.players.player.cardsPlayedThisTurn, 0);
});

test("嘉禾持械特技只在英雄装备武器时触发", () => {
  const game = createGame({ seed: 212 });
  game.players.player.hand = [];
  game.players.player.board = [];
  game.players.player.mana = 10;
  const weapon = _internals.createCardInstance(
    game,
    cards.allCards.find((card) => card.role === "军用匕首"),
  );
  const operative = _internals.createCardInstance(
    game,
    cards.allCards.find((card) => card.role === "战地队员"),
  );
  game.players.player.hand.push(weapon, operative);

  performAction(game, { type: "PLAY_CARD", cardId: weapon.instanceId });
  performAction(game, { type: "PLAY_CARD", cardId: operative.instanceId });
  assert.equal(operative.currentAttack, 4);
  assert.ok(
    game.logs.some((entry) => entry.message === "战地队员完成持械特技。"),
  );
});
