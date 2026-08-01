"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createAdventureStageGame, placeCard } = require("../test-support/adventure-test-helpers.js");
const cards = require("../d-and-b-cards.js");
const adventure = require("../d-and-b-adventure.js");
const { createGame, performAction, _internals } = require("../server/game-engine.js");

test("德宝八种头目机制按双线节奏改变战局", () => {
  const pomPom = createAdventureStageGame(adventure, 0);
  pomPom.players.enemy.board = [];
  pomPom.encounter.beforeEnemyTurn();
  assert.equal(pomPom.players.enemy.board[0].role, "巡逻警员");

  const fortune = createAdventureStageGame(adventure, 1);
  const fortuneHand = fortune.players.enemy.hand.length;
  fortune.encounter.beforeEnemyTurn();
  assert.equal(fortune.players.enemy.hand.length, fortuneHand + 1);

  const microfilm = createAdventureStageGame(adventure, 2);
  microfilm.players.enemy.board = [];
  microfilm.players.player.board = [];
  microfilm.encounter.beforeEnemyTurn();
  assert.equal(microfilm.players.enemy.board[0].role, "皇家探员");

  const street = createAdventureStageGame(adventure, 3);
  street.state.turn = 2;
  street.players.player.board = [];
  street.players.enemy.board = [];
  const resident = placeCard(street, "player", { health: 3 });
  const visitor = placeCard(street, "enemy", { health: 3 });
  street.encounter.beforeEnemyTurn();
  assert.equal(resident.currentHealth, 2);
  assert.equal(visitor.currentHealth, 2);

  const autumn = createAdventureStageGame(adventure, 4);
  autumn.players.enemy.board = [];
  autumn.encounter.beforeEnemyTurn();
  assert.equal(autumn.players.enemy.board[0].role, "唐人街邻里");
  autumn.encounter.beforeEnemyTurn();
  assert.deepEqual(
    [autumn.players.enemy.board[0].currentAttack, autumn.players.enemy.board[0].currentHealth],
    [2, 3],
  );

  const warriors = createAdventureStageGame(adventure, 5);
  warriors.players.enemy.board = [];
  warriors.encounter.beforeEnemyTurn();
  assert.equal(warriors.players.enemy.board[0].role, "国际动作队员");

  const victory = createAdventureStageGame(adventure, 6);
  victory.players.enemy.health = 18;
  victory.players.enemy.board = [];
  const collector = placeCard(victory, "enemy", { attack: 2 });
  const victoryHand = victory.players.enemy.hand.length;
  victory.encounter.beforeEnemyTurn();
  assert.equal(victory.players.enemy.hand.length, victoryHand + 2);
  assert.equal(collector.currentAttack, 3);
  victory.encounter.beforeEnemyTurn();
  assert.equal(victory.players.enemy.hand.length, victoryHand + 2);

  const dawn = createAdventureStageGame(adventure, 7);
  dawn.players.enemy.board = [];
  dawn.encounter.beforeEnemyTurn();
  assert.equal(dawn.players.enemy.board[0].role, "黎明守望者");
  assert.ok(dawn.players.enemy.board[0].keywords.includes("taunt"));
});

test("德宝独角、双线与接班遵守各自触发条件", () => {
  const game = createGame({ seed: 417 });
  game.players.player.hand = [];
  game.players.player.board = [];
  game.players.player.mana = 10;

  const soloDefinition = cards.allCards.find((card) => card.role === "吴阿秋");
  const firstSolo = _internals.createCardInstance(game, soloDefinition);
  const secondSolo = _internals.createCardInstance(game, soloDefinition);
  game.players.player.hand.push(firstSolo, secondSolo);
  performAction(game, { type: "PLAY_CARD", cardId: firstSolo.instanceId });
  const handAfterSolo = game.players.player.hand.length;
  performAction(game, { type: "PLAY_CARD", cardId: secondSolo.instanceId });
  assert.equal(game.players.player.hand.length, handAfterSolo - 1);
  assert.equal(
    game.logs.filter((entry) => entry.message === "吴阿秋触发独角。").length,
    1,
  );

  game.players.player.mana = 10;
  game.players.player.board = [placeCard(game, "player")];
  game.players.enemy.board = [];
  const commercial = _internals.createCardInstance(
    game,
    cards.allCards.find((card) => card.role === "骠叔"),
  );
  game.players.player.hand = [commercial];
  performAction(game, { type: "PLAY_CARD", cardId: commercial.instanceId });
  assert.equal(commercial.currentAttack, 3);

  game.players.player.mana = 10;
  game.players.player.board = [];
  game.players.enemy.board = [placeCard(game, "enemy")];
  game.players.player.health = 20;
  const creative = _internals.createCardInstance(
    game,
    cards.allCards.find((card) => card.role === "骠叔"),
  );
  game.players.player.hand = [creative];
  performAction(game, { type: "PLAY_CARD", cardId: creative.instanceId });
  assert.equal(game.players.player.health, 22);

  game.players.player.mana = 10;
  game.players.player.board = [];
  const outgoing = placeCard(game, "player", { health: 1 });
  outgoing.currentHealth = 0;
  _internals.cleanupBoards(game);
  assert.equal(game.players.player.charactersLostThisTurn, 1);
  const successor = _internals.createCardInstance(
    game,
    cards.allCards.find((card) => card.role === "贝多芬"),
  );
  game.players.player.hand = [successor];
  performAction(game, { type: "PLAY_CARD", cardId: successor.instanceId });
  assert.deepEqual([successor.currentAttack, successor.currentHealth], [3, 3]);

  _internals.beginTurn(game, "player", { draw: false });
  assert.equal(game.players.player.charactersLostThisTurn, 0);
});
