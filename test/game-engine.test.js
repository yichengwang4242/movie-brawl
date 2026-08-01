"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  RULES,
  GameRuleError,
  createGame,
  performAction,
  toPublicState,
  _internals,
} = require("../server/game-engine.js");

function baseRole(overrides = {}) {
  return {
    id: "test-role",
    type: "role",
    star: "测试演员",
    role: "测试角色",
    movie: "测试片场",
    cost: 1,
    attack: 3,
    health: 3,
    motif: "测",
    palette: "steel",
    text: "",
    keywords: [],
    effects: [],
    ...overrides,
  };
}

function placeCard(state, side, overrides = {}) {
  const card = _internals.createCardInstance(state, baseRole(overrides));
  state.players[side].board.push(card);
  return card;
}

test("新对局拥有正确的先手资源，并隐藏对手手牌内容", () => {
  const state = createGame({ seed: 42 });
  const view = toPublicState(state);

  assert.deepEqual(RULES.openingHand, { player: 3, enemy: 3 });
  assert.equal(view.activeSide, "player");
  assert.equal(view.turn, 1);
  assert.equal(view.player.health, RULES.maxHealth);
  assert.equal(view.player.mana, 1);
  assert.equal(view.player.hand.length, RULES.openingHand.player);
  assert.equal(view.player.deckCount, RULES.deckSize - RULES.openingHand.player);
  assert.equal(view.enemy.hand.length, 0);
  assert.equal(view.enemy.handCount, RULES.openingHand.enemy);
});

test("后手在第一个回合抽到第四张牌作为节奏补偿", () => {
  const state = createGame({ seed: 43 });
  const deckCount = state.players.enemy.deck.length;

  _internals.beginTurn(state, "enemy");

  assert.equal(state.players.enemy.hand.length, 4);
  assert.equal(state.players.enemy.deck.length, deckCount - 1);
});

test("服务端拒绝费用不足的出牌动作且不改变手牌", () => {
  const state = createGame({ seed: 7 });
  const expensiveCard = state.players.player.hand.sort(
    (left, right) => right.cost - left.cost,
  )[0];
  state.players.player.mana = 0;
  const handCount = state.players.player.hand.length;

  assert.throws(
    () =>
      performAction(state, {
        type: "PLAY_CARD",
        cardId: expensiveCard.instanceId,
      }),
    (error) =>
      error instanceof GameRuleError && error.code === "NOT_ENOUGH_MANA",
  );
  assert.equal(state.players.player.hand.length, handCount);
});

test("疾冲角色登场回合可以攻击角色但不能攻击英雄", () => {
  const state = createGame({ seed: 11 });
  state.players.player.hand = [];
  state.players.player.board = [];
  state.players.enemy.board = [];
  state.players.player.mana = 10;

  const rushCard = _internals.createCardInstance(
    state,
    baseRole({ id: "rush-role", role: "疾冲角色", keywords: ["rush"] }),
  );
  state.players.player.hand.push(rushCard);
  const defender = placeCard(state, "enemy", { id: "defender", role: "防守角色" });

  performAction(state, { type: "PLAY_CARD", cardId: rushCard.instanceId });
  assert.equal(rushCard.attacksRemaining, 1);
  assert.equal(rushCard.attackRestriction, "minions");
  assert.throws(
    () =>
      performAction(state, {
        type: "ATTACK",
        attackerId: rushCard.instanceId,
        target: "hero",
      }),
    (error) => error instanceof GameRuleError && error.code === "CANNOT_ATTACK",
  );

  performAction(state, {
    type: "ATTACK",
    attackerId: rushCard.instanceId,
    target: defender.instanceId,
  });
  assert.equal(rushCard.attacksRemaining, 0);
});

test("场上存在嘲讽时，英雄和非嘲讽角色都不能被攻击", () => {
  const state = createGame({ seed: 13 });
  state.players.player.board = [];
  state.players.enemy.board = [];
  const attacker = placeCard(state, "player", {
    id: "attacker",
    role: "进攻角色",
    attack: 4,
    health: 5,
  });
  attacker.attacksRemaining = 1;
  const normal = placeCard(state, "enemy", {
    id: "normal",
    role: "普通角色",
  });
  const taunt = placeCard(state, "enemy", {
    id: "taunt",
    role: "嘲讽角色",
    keywords: ["taunt"],
  });

  assert.throws(
    () =>
      performAction(state, {
        type: "ATTACK",
        attackerId: attacker.instanceId,
        target: "hero",
      }),
    (error) => error.code === "TAUNT_BLOCKS",
  );
  assert.throws(
    () =>
      performAction(state, {
        type: "ATTACK",
        attackerId: attacker.instanceId,
        target: normal.instanceId,
      }),
    (error) => error.code === "TAUNT_BLOCKS",
  );

  performAction(state, {
    type: "ATTACK",
    attackerId: attacker.instanceId,
    target: taunt.instanceId,
  });
  assert.equal(attacker.attacksRemaining, 0);
});

test("护盾阻挡整次伤害，吸血只按实际造成的伤害恢复", () => {
  const state = createGame({ seed: 17 });
  state.players.player.health = 20;
  const source = placeCard(state, "player", {
    id: "lifesteal",
    role: "吸血角色",
    attack: 5,
    keywords: ["lifesteal"],
  });
  const target = placeCard(state, "enemy", {
    id: "shield",
    role: "护盾角色",
    health: 3,
    keywords: ["shield"],
  });

  const blocked = _internals.damageMinion(state, target, 5, source, "player");
  assert.equal(blocked, 0);
  assert.equal(target.currentHealth, 3);
  assert.equal(target.shield, false);
  assert.equal(state.players.player.health, 20);

  const dealt = _internals.damageMinion(state, target, 5, source, "player");
  assert.equal(dealt, 3);
  assert.equal(state.players.player.health, 23);
});

test("结束回合后 AI 完成行动并把控制权交还玩家", () => {
  const state = createGame({ seed: 23 });
  performAction(state, { type: "END_TURN" });

  assert.equal(state.phase, "playing");
  assert.equal(state.activeSide, "player");
  assert.equal(state.turn, 2);
  assert.equal(state.players.player.maxMana, 2);
  assert.ok(state.logs.some((entry) => entry.message.includes("镜头回到影迷")));
});

test("简单、标准、困难分别使用独立 AI 策略", () => {
  const strategies = new Set();
  for (const difficulty of ["easy", "normal", "hard"]) {
    const game = createGame({ seed: 31, difficulty });
    assert.equal(game.aiDifficulty, difficulty);
    strategies.add(game.ai.strategy.constructor.name);
    performAction(game, { type: "END_TURN" });
    assert.equal(game.activeSide, "player");
  }
  assert.equal(strategies.size, 3);
});

test("法术结算进入墓地，爆牌进入独立烧毁区", () => {
  const game = createGame({ seed: 35 });
  game.players.player.hand = [];
  game.players.player.mana = 10;
  const spell = game.cards.createInstance({
    id: "test-spell",
    type: "spell",
    star: "通用",
    region: "测试",
    rarity: "普通",
    role: "测试法术",
    movie: "测试片场",
    cost: 1,
    attack: 0,
    health: 0,
    motif: "法",
    palette: "steel",
    text: "",
    keywords: [],
    effects: [],
    deathEffects: [],
  });
  game.state.zones.addToHand("player", spell);

  performAction(game, { type: "PLAY_CARD", cardId: spell.instanceId });

  assert.equal(game.players.player.graveyard.length, 1);
  assert.equal(game.players.player.graveyard[0].reason, "spell-resolved");
  assert.equal(game.players.player.graveyard[0].card.id, "test-spell");

  game.players.player.hand = Array.from(
    { length: RULES.handLimit },
    (_, index) =>
      game.cards.createInstance(baseRole({
        id: `full-hand-${index}`,
        role: `满手角色${index}`,
      })),
  );
  const deckCount = game.players.player.deck.length;
  game.state.drawCards("player", 1, game.cards, { silent: true });

  assert.equal(game.players.player.hand.length, RULES.handLimit);
  assert.equal(game.players.player.deck.length, deckCount - 1);
  assert.equal(game.players.player.burned.length, 1);
  assert.equal(game.players.player.burned[0].reason, "hand-full");

  const view = toPublicState(game);
  assert.equal(view.player.zones.graveyard[0].card.role, "测试法术");
  assert.equal(view.player.zones.burned.length, 1);
});

test("亡语在角色退场后进入队列并完成召唤", () => {
  const game = createGame({ seed: 37 });
  game.players.player.board = [];
  const fallen = placeCard(game, "player", {
    id: "deathrattle-role",
    role: "亡语角色",
    health: 2,
    keywords: ["deathrattle"],
    deathEffects: [{
      type: "summon",
      amount: 1,
      token: { role: "接班演员", attack: 2, health: 2, motif: "接" },
    }],
  });

  _internals.damageMinion(game, fallen, 5, null, "enemy");
  game.deaths.resolve();

  assert.equal(game.players.player.board.length, 1);
  assert.equal(game.players.player.board[0].role, "接班演员");
  assert.equal(game.players.player.graveyard.length, 1);
  assert.equal(game.players.player.graveyard[0].reason, "destroyed");
  assert.equal(game.players.player.graveyard[0].card.id, "deathrattle-role");
  assert.ok(game.logs.some((entry) => entry.tone === "deathrattle"));
});

test("双方亡语同时造成致命伤害时完整结算为平局", () => {
  const game = createGame({ seed: 39 });
  game.players.player.board = [];
  game.players.enemy.board = [];
  game.players.player.health = 1;
  game.players.enemy.health = 1;
  const playerCard = placeCard(game, "player", {
    id: "player-final-act",
    role: "正派遗言",
    health: 1,
    keywords: ["deathrattle"],
    deathEffects: [{ type: "damageEnemyHero", amount: 1 }],
  });
  const enemyCard = placeCard(game, "enemy", {
    id: "enemy-final-act",
    role: "反派遗言",
    health: 1,
    keywords: ["deathrattle"],
    deathEffects: [{ type: "damageEnemyHero", amount: 1 }],
  });

  playerCard.currentHealth = 0;
  enemyCard.currentHealth = 0;
  game.deaths.resolve();

  assert.equal(game.players.player.health, 0);
  assert.equal(game.players.enemy.health, 0);
  assert.equal(game.phase, "gameOver");
  assert.equal(game.winner, "draw");
});

test("反伤只反弹一次并能击伤攻击来源", () => {
  const game = createGame({ seed: 41 });
  game.players.player.board = [];
  game.players.enemy.board = [];
  const attacker = placeCard(game, "player", {
    id: "reflect-attacker",
    role: "进攻者",
    health: 5,
  });
  const defender = placeCard(game, "enemy", {
    id: "reflect-defender",
    role: "反伤者",
    health: 6,
    keywords: ["reflect"],
    reflect: 2,
  });

  _internals.damageMinion(game, defender, 3, attacker, "player");
  assert.equal(defender.currentHealth, 3);
  assert.equal(attacker.currentHealth, 3);
  assert.ok(game.logs.some((entry) => entry.tone === "reflect"));
});

test("融合消耗两个角色并生成属性相加的新角色", () => {
  const game = createGame({ seed: 43 });
  game.players.player.board = [];
  placeCard(game, "player", {
    id: "fusion-one",
    role: "角色甲",
    attack: 2,
    health: 3,
  });
  placeCard(game, "player", {
    id: "fusion-two",
    role: "角色乙",
    attack: 4,
    health: 5,
  });

  game.effects.resolve(
    [{
      type: "fuseFriendly",
      count: 2,
      bonusAttack: 1,
      bonusHealth: 1,
      role: "融合角色",
    }],
    { side: "player", self: null },
  );

  assert.equal(game.players.player.board.length, 1);
  assert.equal(game.players.player.board[0].role, "融合角色");
  assert.equal(game.players.player.board[0].currentAttack, 7);
  assert.equal(game.players.player.board[0].currentHealth, 9);
  assert.deepEqual(
    game.players.player.exiled.map((entry) => entry.card.id).sort(),
    ["fusion-one", "fusion-two"],
  );
  assert.ok(
    game.players.player.exiled.every((entry) => entry.reason === "fusion"),
  );
  assert.equal(game.players.player.graveyard.length, 0);
});

test("武器允许英雄攻击并在攻击后消耗耐久", () => {
  const game = createGame({ seed: 47 });
  game.players.player.hand = [];
  game.players.enemy.board = [];
  game.players.player.mana = 10;
  const weapon = game.cards.createInstance({
    id: "test-weapon",
    type: "weapon",
    star: "通用",
    role: "测试武器",
    movie: "测试片场",
    cost: 2,
    attack: 3,
    health: 0,
    durability: 2,
    motif: "兵",
    palette: "steel",
    text: "",
    keywords: [],
    effects: [],
    deathEffects: [],
  });
  game.players.player.hand.push(weapon);

  performAction(game, { type: "PLAY_CARD", cardId: weapon.instanceId });
  assert.equal(game.players.player.weapon.role, "测试武器");
  assert.equal(game.combat.canHeroAttack("player"), true);

  performAction(game, { type: "HERO_ATTACK", target: "hero" });
  assert.equal(game.players.enemy.health, 27);
  assert.equal(game.players.player.weapon.currentDurability, 1);
  assert.equal(game.players.player.heroAttacksRemaining, 0);

  _internals.beginTurn(game, "player", { draw: false });
  performAction(game, { type: "HERO_ATTACK", target: "hero" });

  assert.equal(game.players.player.weapon, null);
  assert.equal(game.players.player.graveyard.length, 1);
  assert.equal(game.players.player.graveyard[0].reason, "weapon-broken");
  assert.equal(game.players.player.graveyard[0].card.id, "test-weapon");
});
