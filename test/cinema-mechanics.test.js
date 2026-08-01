"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createAdventureStageGame, placeCard } = require("../test-support/adventure-test-helpers.js");
const cards = require("../cinema-city-cards.js");
const adventure = require("../cinema-city-adventure.js");
const { createGame, performAction, _internals } = require("../server/game-engine.js");

test("新艺城八种头目机制按各自节奏改变战局", () => {
  const clues = createAdventureStageGame(adventure, 0);
  clues.players.enemy.board = [];
  clues.encounter.beforeEnemyTurn();
  assert.equal(clues.players.enemy.board[0].role, "奋斗房拍档");

  const yinyang = createAdventureStageGame(adventure, 1);
  yinyang.state.turn = 2;
  yinyang.players.player.board = [];
  const yinyangTarget = placeCard(yinyang, "player", { attack: 3 });
  yinyang.encounter.beforeEnemyTurn();
  assert.equal(yinyangTarget.currentAttack, 2);

  const aces = createAdventureStageGame(adventure, 2);
  aces.players.enemy.board = [];
  aces.encounter.beforeEnemyTurn();
  assert.equal(aces.players.enemy.board[0].role, "高科技拍档");

  const happy = createAdventureStageGame(adventure, 3);
  happy.players.enemy.board = [];
  happy.state.turn = 1;
  happy.encounter.beforeEnemyTurn();
  assert.equal(happy.players.enemy.board[0].role, "开心同学");

  const opera = createAdventureStageGame(adventure, 4);
  opera.players.enemy.board = [];
  placeCard(opera, "enemy");
  placeCard(opera, "enemy");
  opera.encounter.beforeEnemyTurn();
  assert.equal(opera.players.enemy.board.at(-1).role, "戏班同伴");

  const undercover = createAdventureStageGame(adventure, 5);
  undercover.state.turn = 2;
  undercover.players.player.board = [];
  const signalTarget = placeCard(undercover, "player", { attack: 4 });
  undercover.encounter.beforeEnemyTurn();
  assert.equal(signalTarget.currentAttack, 3);

  const prison = createAdventureStageGame(adventure, 6);
  prison.state.turn = 3;
  prison.players.player.board = [];
  const prisoner = placeCard(prison, "player", { cost: 2, health: 2 });
  prison.encounter.beforeEnemyTurn();
  assert.equal(prison.players.player.board.length, 0);
  assert.equal(prison.players.player.hand.at(-1).instanceId, prisoner.instanceId);
  assert.equal(prisoner.cost, 3);

  const heroic = createAdventureStageGame(adventure, 7);
  heroic.players.enemy.board = [];
  heroic.state.turn = 1;
  heroic.encounter.beforeEnemyTurn();
  assert.equal(heroic.players.enemy.board[0].role, "义气拍档");
});

test("新艺城拍档、反转与转场遵守各自触发条件", () => {
  const game = createGame({ seed: 313 });
  game.players.player.hand = [];
  game.players.player.board = [];
  game.players.player.mana = 10;

  const janeDefinition = cards.allCards.find(
    (card) => card.role === "林亚珍",
  );
  const firstJane = _internals.createCardInstance(game, janeDefinition);
  const secondJane = _internals.createCardInstance(game, janeDefinition);
  game.players.player.hand.push(firstJane, secondJane);
  performAction(game, { type: "PLAY_CARD", cardId: firstJane.instanceId });
  const handAfterFirst = game.players.player.hand.length;
  performAction(game, { type: "PLAY_CARD", cardId: secondJane.instanceId });
  assert.equal(game.players.player.hand.length, handAfterFirst);
  assert.ok(game.logs.some((entry) => entry.message === "林亚珍触发拍档。"));

  game.players.player.hand = [];
  const koChow = _internals.createCardInstance(
    game,
    cards.allCards.find((card) => card.role === "高秋"),
  );
  game.players.player.health = 10;
  game.players.enemy.health = 20;
  game.players.player.hand.push(koChow);
  const cardsBeforeComeback = game.players.player.hand.length;
  performAction(game, { type: "PLAY_CARD", cardId: koChow.instanceId });
  assert.equal(game.players.player.hand.length, cardsBeforeComeback);

  const scheme = _internals.createCardInstance(
    game,
    cards.allCards.find((card) => card.role === "智多星布局"),
  );
  game.players.player.board = [firstJane];
  firstJane.currentAttack = 8;
  firstJane.currentHealth = 1;
  firstJane.maxHealth = 5;
  firstJane.keywords.push("reflect");
  firstJane.reflect = 3;
  game.players.player.hand.push(scheme);
  performAction(game, { type: "PLAY_CARD", cardId: scheme.instanceId });
  assert.ok(game.players.player.hand.includes(firstJane));
  assert.equal(firstJane.cost, 0);
  assert.equal(firstJane.currentAttack, firstJane.attack);
  assert.equal(firstJane.currentHealth, firstJane.health);
  assert.equal(firstJane.reflect, 0);
  assert.equal(firstJane.keywords.includes("reflect"), false);
});
