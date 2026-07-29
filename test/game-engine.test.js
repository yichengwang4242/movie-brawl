"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const cardPool = require("../game-data.js");
const shawCards = require("../shaw-cards.js");
const shawAdventure = require("../shaw-adventure.js");
const starterCards = require("../starter-cards.js");
const {
  AdventureService,
} = require("../server/adventure/adventure-service.js");
const {
  MemoryProfileRepository,
} = require("../server/adventure/profile-repository.js");
const { GameService } = require("../server/game-service.js");
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

test("扩展卡池保持十位明星并包含角色、法术和武器", () => {
  assert.equal(cardPool.stars.length, 10);
  assert.equal(cardPool.roleCards.length, 60);
  assert.equal(cardPool.spellCards.length, 26);
  assert.equal(cardPool.weaponCards.length, 6);
  assert.equal(cardPool.neutralCards.length, 32);
  assert.equal(cardPool.adventureCards.length, 18);
  assert.equal(cardPool.starterCards.length, 13);
  assert.equal(cardPool.allCards.length, 123);
  assert.equal(new Set(cardPool.allCards.map((card) => card.id)).size, 123);
  assert.ok(cardPool.stars.every((star) => star.cards.length === 6));
});

test("新手白卡覆盖多种主题并集中在一二三费", () => {
  assert.equal(starterCards.allCards.length, 13);
  assert.ok(starterCards.allCards.every((card) => card.rarity === "普通"));
  assert.deepEqual(
    [...new Set(starterCards.allCards.map((card) => card.cost))].sort(),
    [1, 2, 3],
  );
  assert.ok(
    new Set(starterCards.allCards.map((card) => card.region)).size >= 5,
  );
});

test("初始牌组按新手曲线构筑并保证起手一二三费", () => {
  const game = createGame({ seed: 29 });
  const fullDeck = [
    ...game.players.player.hand,
    ...game.players.player.deck,
  ];
  const curve = fullDeck.reduce((counts, card) => {
    counts[card.cost] = (counts[card.cost] || 0) + 1;
    return counts;
  }, {});

  assert.equal(fullDeck.length, 15);
  assert.deepEqual(curve, { 1: 4, 2: 5, 3: 4, 4: 1, 5: 1 });
  assert.deepEqual(
    game.players.player.hand.slice(0, 3).map((card) => card.cost),
    [1, 2, 3],
  );
  assert.ok(
    game.players.player.hand
      .slice(0, 3)
      .every((card) => card.rarity === "普通"),
  );
});

test("冒险奖励替换费用最接近的同类基础卡", () => {
  const reward = shawCards.bossCards.find((card) => card.role === "三德和尚");
  const game = createGame({ seed: 31, playerBonusCards: [reward] });
  const fullDeck = [...game.players.player.hand, ...game.players.player.deck];

  assert.ok(fullDeck.some((card) => card.id === reward.id));
  assert.equal(fullDeck.filter((card) => card.cost === 1).length, 4);
  assert.equal(fullDeck.length, 15);
});

test("邵氏冒险包含八关并按要求设置中头目和最终头目", () => {
  assert.equal(shawAdventure.stages.length, 8);
  assert.deepEqual(
    shawAdventure.stages.map((stage) => stage.bossType),
    ["small", "small", "mid", "small", "mid", "small", "small", "final"],
  );
  assert.ok(
    shawAdventure.stages
      .filter((stage) => stage.bossType === "small")
      .every((stage) => stage.rewardCardIds.length === 3),
  );
  assert.ok(
    shawAdventure.stages
      .filter((stage) => stage.bossType !== "small")
      .every((stage) => stage.rewardCardIds.length === 1),
  );
});

test("十五张牌冒险使用分级 AI 与受控的头目生命曲线", () => {
  const expectedDifficulty = {
    small: "easy",
    mid: "normal",
    final: "hard",
  };

  shawAdventure.stages.forEach((stage, index) => {
    const previous = shawAdventure.stages.slice(0, index);
    const profile = {
      schemaVersion: 1,
      completedStageIds: previous.map((candidate) => candidate.id),
      claimedStageIds: previous.map((candidate) => candidate.id),
      ownedCardIds: previous.map((candidate) => candidate.rewardCardIds[0]),
    };
    const adventures = new AdventureService({
      repository: new MemoryProfileRepository(profile),
    });
    const options = adventures.createGameOptions(stage.id, 90 + index);

    assert.equal(options.difficulty, expectedDifficulty[stage.bossType]);
    assert.equal(options.enemyHealth, stage.health);
  });

  assert.ok(shawAdventure.stages[0].health <= 24);
  assert.ok(shawAdventure.stages.at(-1).health <= 36);
  assert.ok(
    shawAdventure.stages.every((stage) => stage.health <= 36),
    "十五张牌的对局不应依靠过高血量拖入疲劳阶段",
  );
});

test("冒险进度要求按顺序通关并领取上一关奖励", () => {
  const repository = new MemoryProfileRepository();
  const adventures = new AdventureService({ repository });
  let state = adventures.state();

  assert.equal(state.adventures[0].stages[0].unlocked, true);
  assert.equal(state.adventures[0].stages[1].unlocked, false);
  adventures.complete("shaw-01-inn", "player");
  state = adventures.state();
  assert.equal(state.adventures[0].stages[1].unlocked, true);
  assert.equal(state.pendingReward.cards.length, 3);
  assert.throws(
    () => adventures.createGameOptions("shaw-02-guillotine", 1),
    (error) => error.code === "REWARD_PENDING",
  );

  const selected = state.pendingReward.cards[1];
  const claimed = adventures.claim("shaw-01-inn", selected.id);
  assert.ok(claimed.profile.ownedCardIds.includes(selected.id));
  assert.equal(claimed.pendingReward, null);
  assert.equal(
    adventures.createGameOptions("shaw-02-guillotine", 1).encounter.order,
    2,
  );
});

test("头目奖励卡保持普通构筑费用曲线", () => {
  assert.equal(shawCards.bossCards.length, 3);
  for (const card of shawCards.bossCards) {
    assert.ok(card.cost >= 4);
    assert.ok(card.attack <= 5);
    assert.ok(card.health <= 8);
    assert.ok(card.attack + card.health <= card.cost * 2 + 4);
    assert.equal(card.bossOnly, undefined);
  }
});

test("服务端在击败小头目后只接受本关三选一奖励", () => {
  const adventures = new AdventureService({
    repository: new MemoryProfileRepository(),
  });
  const service = new GameService({ adventureService: adventures });
  const publicGame = service.create({ stageId: "shaw-01-inn", seed: 5 });
  const game = service.games.get(publicGame.gameId).engine;
  game.players.player.board = [];
  const finisher = placeCard(game, "player", {
    id: "adventure-finisher",
    role: "收尾角色",
    attack: 2,
  });
  finisher.attacksRemaining = 1;
  game.players.enemy.health = 1;

  const result = service.act(publicGame.gameId, {
    type: "ATTACK",
    attackerId: finisher.instanceId,
    target: "hero",
  });
  assert.equal(result.winner, "player");
  assert.equal(result.adventure.pendingReward.cards.length, 3);
  assert.throws(
    () => adventures.claim("shaw-01-inn", "role-周星驰-至尊宝"),
    (error) => error.code === "INVALID_REWARD",
  );
  const chosen = result.adventure.pendingReward.cards[0];
  assert.equal(adventures.claim("shaw-01-inn", chosen.id).card.id, chosen.id);
});

test("八种邵氏场地机制都能完成首个头目回合", () => {
  shawAdventure.stages.forEach((stage, index) => {
    const previous = shawAdventure.stages.slice(0, index);
    const profile = {
      schemaVersion: 1,
      completedStageIds: previous.map((candidate) => candidate.id),
      claimedStageIds: previous.map((candidate) => candidate.id),
      ownedCardIds: previous.map((candidate) => candidate.rewardCardIds[0]),
    };
    const adventures = new AdventureService({
      repository: new MemoryProfileRepository(profile),
    });
    const game = createGame(adventures.createGameOptions(stage.id, 70 + index));
    assert.doesNotThrow(() => performAction(game, { type: "END_TURN" }));
    assert.equal(game.activeSide, "player");
    assert.ok(game.logs.some((entry) => entry.tone === "encounter"));
  });
});

test("新对局拥有正确的先手资源，并隐藏对手手牌内容", () => {
  const state = createGame({ seed: 42 });
  const view = toPublicState(state);

  assert.equal(view.activeSide, "player");
  assert.equal(view.turn, 1);
  assert.equal(view.player.health, RULES.maxHealth);
  assert.equal(view.player.mana, 1);
  assert.equal(view.player.hand.length, RULES.openingHand.player);
  assert.equal(view.player.deckCount, RULES.deckSize - RULES.openingHand.player);
  assert.equal(view.enemy.hand.length, 0);
  assert.equal(view.enemy.handCount, RULES.openingHand.enemy);
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
});
