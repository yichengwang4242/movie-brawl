"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createAdventureStageGame,
  placeCard,
} = require("../test-support/adventure-test-helpers.js");
const cards = require("../milkyway-image-cards.js");
const adventure = require("../milkyway-image-adventure.js");
const { createGame, performAction, _internals } = require("../server/game-engine.js");

test("银河映像八种头目机制按阵型与倒计时改变战局", () => {
  const fate = createAdventureStageGame(adventure, 0);
  fate.players.enemy.board = [];
  fate.state.turn = 1;
  fate.encounter.beforeEnemyTurn();
  assert.equal(fate.players.enemy.board[0].role, "江湖路人");

  const deadlock = createAdventureStageGame(adventure, 1);
  deadlock.players.player.board = [];
  const marked = placeCard(deadlock, "player");
  deadlock.encounter.beforeEnemyTurn();
  assert.equal(marked.stunned, true);

  const countdown = createAdventureStageGame(adventure, 2);
  countdown.state.turn = 1;
  const handBefore = countdown.players.enemy.hand.length;
  countdown.encounter.beforeEnemyTurn();
  assert.equal(countdown.players.enemy.hand.length, handBefore + 1);

  const formation = createAdventureStageGame(adventure, 3);
  formation.players.enemy.board = [];
  formation.encounter.beforeEnemyTurn();
  formation.encounter.beforeEnemyTurn();
  formation.encounter.beforeEnemyTurn();
  assert.equal(formation.players.enemy.board.length, 3);
  assert.ok(formation.players.enemy.board.every((card) => card.currentAttack === 2));

  const search = createAdventureStageGame(adventure, 4);
  search.players.enemy.board = [];
  search.state.turn = 1;
  search.encounter.beforeEnemyTurn();
  assert.equal(search.players.enemy.board[0].role, "PTU警员");

  const election = createAdventureStageGame(adventure, 5);
  election.state.turn = 1;
  const ballotHand = election.players.enemy.hand.length;
  election.encounter.beforeEnemyTurn();
  assert.equal(election.players.enemy.hand.length, ballotHand + 1);

  const exiled = createAdventureStageGame(adventure, 6);
  exiled.players.enemy.health = 18;
  exiled.players.enemy.board = [];
  exiled.encounter.beforeEnemyTurn();
  assert.equal(exiled.players.enemy.board.length, 2);
  assert.ok(exiled.players.enemy.board.every((card) => card.role === "追兵"));
  assert.ok(exiled.players.enemy.board.every((card) => card.keywords.includes("rush")));
  exiled.encounter.beforeEnemyTurn();
  assert.equal(exiled.players.enemy.board.length, 2);

  const detective = createAdventureStageGame(adventure, 7);
  detective.players.enemy.board = [];
  detective.state.turn = 1;
  detective.encounter.beforeEnemyTurn();
  assert.equal(detective.players.enemy.board[0].role, "进取人格");
  assert.ok(detective.players.enemy.board[0].keywords.includes("rush"));
});

function cardInstance(game, role) {
  return _internals.createCardInstance(
    game,
    cards.allCards.find((card) => card.role === role),
  );
}

test("对峙与时限只在各自条件成立时触发", () => {
  const standoff = createGame({ seed: 611 });
  standoff.players.player.hand = [];
  standoff.players.player.board = [];
  standoff.players.enemy.board = [];
  standoff.players.player.mana = 10;
  const target = placeCard(standoff, "enemy", { health: 3 });
  const sam = cardInstance(standoff, "阿琛");
  standoff.players.player.hand.push(sam);
  performAction(standoff, { type: "PLAY_CARD", cardId: sam.instanceId });
  assert.equal(target.currentHealth, 2);
  assert.ok(standoff.logs.some((entry) => entry.message === "阿琛进入对峙。"));

  const noStandoff = createGame({ seed: 612 });
  noStandoff.players.player.hand = [];
  noStandoff.players.player.board = [];
  noStandoff.players.enemy.board = [];
  noStandoff.players.player.mana = 10;
  const unmatched = cardInstance(noStandoff, "阿琛");
  noStandoff.players.player.hand.push(unmatched);
  performAction(noStandoff, { type: "PLAY_CARD", cardId: unmatched.instanceId });
  assert.equal(
    noStandoff.logs.some((entry) => entry.message === "阿琛进入对峙。"),
    false,
  );

  const deadline = createGame({ seed: 613 });
  deadline.players.player.hand = [];
  deadline.players.player.board = [];
  deadline.players.player.mana = 2;
  const doggie = cardInstance(deadline, "黄阿狗");
  deadline.players.player.hand.push(doggie);
  performAction(deadline, { type: "PLAY_CARD", cardId: doggie.instanceId });
  assert.equal(deadline.players.player.board[0].currentAttack, 2);
  assert.ok(deadline.logs.some((entry) => entry.message === "黄阿狗压线完成时限。"));

  const noDeadline = createGame({ seed: 614 });
  noDeadline.players.player.hand = [];
  noDeadline.players.player.board = [];
  noDeadline.players.player.mana = 5;
  const earlyDoggie = cardInstance(noDeadline, "黄阿狗");
  noDeadline.players.player.hand.push(earlyDoggie);
  performAction(noDeadline, { type: "PLAY_CARD", cardId: earlyDoggie.instanceId });
  assert.equal(noDeadline.players.player.board[0].currentAttack, 1);
  assert.equal(
    noDeadline.logs.some((entry) => entry.message === "黄阿狗压线完成时限。"),
    false,
  );
});
