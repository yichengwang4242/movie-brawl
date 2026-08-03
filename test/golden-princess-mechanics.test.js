"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createAdventureStageGame,
  placeCard,
} = require("../test-support/adventure-test-helpers.js");
const cards = require("../golden-princess-cards.js");
const adventure = require("../golden-princess-adventure.js");
const { createGame, performAction, _internals } = require("../server/game-engine.js");

test("金公主八种头目机制按排片节奏改变战局", () => {
  const ghost = createAdventureStageGame(adventure, 0);
  ghost.players.enemy.board = [];
  ghost.state.turn = 1;
  ghost.encounter.beforeEnemyTurn();
  assert.equal(ghost.players.enemy.board[0].role, "兰若幽灯");

  const church = createAdventureStageGame(adventure, 1);
  church.players.enemy.board = [];
  church.players.player.board = [];
  church.encounter.beforeEnemyTurn();
  assert.equal(church.players.enemy.board[0].role, "持枪杀手");

  const contract = createAdventureStageGame(adventure, 2);
  contract.players.player.board = [];
  contract.state.turn = 1;
  const marked = placeCard(contract, "player", { attack: 5 });
  contract.encounter.beforeEnemyTurn();
  assert.equal(marked.stunned, true);

  const lap = createAdventureStageGame(adventure, 3);
  lap.players.enemy.board = [];
  lap.state.turn = 2;
  const racer = placeCard(lap, "enemy", { attack: 2, health: 2 });
  lap.encounter.beforeEnemyTurn();
  assert.deepEqual([racer.currentAttack, racer.currentHealth], [3, 3]);

  const sunset = createAdventureStageGame(adventure, 4);
  sunset.players.enemy.health = 18;
  sunset.players.enemy.board = [];
  sunset.encounter.beforeEnemyTurn();
  assert.equal(sunset.players.enemy.weapon.role, "越境手枪");
  assert.equal(sunset.players.enemy.weapon.currentDurability, 2);
  assert.equal(sunset.players.enemy.board[0].role, "逃生同伴");

  const score = createAdventureStageGame(adventure, 5);
  score.players.enemy.board = [];
  score.state.turn = 1;
  const swordsman = placeCard(score, "enemy");
  score.encounter.beforeEnemyTurn();
  assert.equal(swordsman.shield, true);

  const midnight = createAdventureStageGame(adventure, 6);
  midnight.players.enemy.board = [];
  midnight.state.turn = 1;
  midnight.encounter.beforeEnemyTurn();
  assert.equal(midnight.players.enemy.board[0].role, "午夜摩托手");
  assert.ok(midnight.players.enemy.board[0].keywords.includes("rush"));

  const finale = createAdventureStageGame(adventure, 7);
  finale.players.enemy.board = [];
  finale.state.turn = 1;
  const handBefore = finale.players.enemy.hand.length;
  finale.encounter.beforeEnemyTurn();
  assert.equal(finale.players.enemy.board[0].role, "子夜重案警员");
  assert.equal(finale.players.enemy.hand.length, handBefore + 1);
});

test("金公主首映与连映按出牌顺序触发并在新回合重置", () => {
  const game = createGame({ seed: 521 });
  game.players.player.hand = [];
  game.players.player.board = [];
  game.players.player.mana = 10;

  const ning = _internals.createCardInstance(
    game,
    cards.allCards.find((card) => card.role === "宁采臣"),
  );
  const li = _internals.createCardInstance(
    game,
    cards.allCards.find((card) => card.role === "李鹰"),
  );
  const finish = _internals.createCardInstance(
    game,
    cards.allCards.find((card) => card.role === "父子冲线"),
  );
  game.players.player.hand.push(ning, li, finish);

  performAction(game, { type: "PLAY_CARD", cardId: ning.instanceId });
  assert.ok(game.logs.some((entry) => entry.message === "宁采臣触发首映。"));
  assert.deepEqual(game.players.player.cardTypesPlayedThisTurn, ["role"]);

  performAction(game, { type: "PLAY_CARD", cardId: li.instanceId });
  assert.equal(
    game.logs.some((entry) => entry.message === "李鹰接上连映。"),
    false,
  );

  performAction(game, { type: "PLAY_CARD", cardId: finish.instanceId });
  assert.ok(game.logs.some((entry) => entry.message === "影迷接上连映。"));
  assert.deepEqual(game.players.player.cardTypesPlayedThisTurn, ["role", "role", "spell"]);

  _internals.beginTurn(game, "player", { draw: false });
  assert.deepEqual(game.players.player.cardTypesPlayedThisTurn, []);
  assert.equal(game.players.player.cardsPlayedThisTurn, 0);
});
