"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createAdventureStageGame, placeCard } = require("../test-support/adventure-test-helpers.js");
const adventure = require("../shaw-adventure.js");

test("邵氏八种头目机制均按关卡规则改变战局", () => {
  const inn = createAdventureStageGame(adventure, 0);
  inn.players.enemy.board = [];
  inn.encounter.beforeEnemyTurn();
  assert.equal(inn.players.enemy.board[0].role, "山寨喽啰");

  const guillotine = createAdventureStageGame(adventure, 1);
  guillotine.state.turn = 2;
  guillotine.players.player.board = [];
  const marked = placeCard(guillotine, "player", { health: 3 });
  guillotine.encounter.beforeEnemyTurn();
  assert.equal(marked.currentHealth, 2);

  const swallow = createAdventureStageGame(adventure, 2);
  swallow.state.turn = 2;
  swallow.players.enemy.board = [];
  swallow.encounter.beforeEnemyTurn();
  assert.equal(swallow.players.enemy.board[0].role, "燕影");

  const venoms = createAdventureStageGame(adventure, 3);
  venoms.state.turn = 2;
  venoms.players.enemy.board = [];
  venoms.encounter.beforeEnemyTurn();
  assert.equal(venoms.players.enemy.board[0].role, "毒门伏兵");
  assert.ok(venoms.players.enemy.board[0].keywords.includes("reflect"));

  const blade = createAdventureStageGame(adventure, 4);
  blade.players.enemy.health = 18;
  blade.encounter.beforeEnemyTurn();
  assert.equal(blade.players.enemy.weapon.role, "断刃");

  const arm = createAdventureStageGame(adventure, 5);
  arm.state.turn = 2;
  arm.players.enemy.board = [];
  const trainee = placeCard(arm, "enemy", { attack: 2 });
  arm.encounter.beforeEnemyTurn();
  assert.equal(trainee.currentAttack, 3);

  const lotus = createAdventureStageGame(adventure, 6);
  lotus.players.enemy.board = [];
  lotus.encounter.beforeEnemyTurn();
  assert.equal(lotus.players.enemy.board[0].role, "白莲香众");

  const chambers = createAdventureStageGame(adventure, 7);
  chambers.players.enemy.board = [];
  chambers.state.turn = 1;
  chambers.encounter.beforeEnemyTurn();
  assert.equal(chambers.players.enemy.board[0].role, "木人桩");
  assert.ok(chambers.players.enemy.board[0].keywords.includes("taunt"));
});
