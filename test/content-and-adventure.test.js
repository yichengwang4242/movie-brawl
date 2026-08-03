"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const cardPool = require("../game-data.js");
const shawCards = require("../shaw-cards.js");
const shawAdventure = require("../shaw-adventure.js");
const goldenHarvestCards = require("../golden-harvest-cards.js");
const goldenHarvestAdventure = require("../golden-harvest-adventure.js");
const cinemaCityCards = require("../cinema-city-cards.js");
const cinemaCityAdventure = require("../cinema-city-adventure.js");
const dandBCards = require("../d-and-b-cards.js");
const dandBAdventure = require("../d-and-b-adventure.js");
const goldenPrincessCards = require("../golden-princess-cards.js");
const goldenPrincessAdventure = require("../golden-princess-adventure.js");
const milkywayImageCards = require("../milkyway-image-cards.js");
const milkywayImageAdventure = require("../milkyway-image-adventure.js");
const studioRegistry = require("../studio-registry.js");
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

function createAdventureStageGame(adventure, stageIndex, seed = 200) {
  const previous = adventure.stages.slice(0, stageIndex);
  const profile = {
    schemaVersion: 1,
    completedStageIds: previous.map((stage) => stage.id),
    claimedStageIds: previous.map((stage) => stage.id),
    ownedCardIds: previous.map((stage) => stage.rewardCardIds[0]),
  };
  const service = new AdventureService({
    repository: new MemoryProfileRepository(profile),
  });
  return createGame(
    service.createGameOptions(adventure.stages[stageIndex].id, seed + stageIndex),
  );
}

test("扩展卡池保持十位明星并包含角色、法术和武器", () => {
  assert.equal(cardPool.stars.length, 10);
  assert.equal(cardPool.roleCards.length, 60);
  assert.equal(cardPool.spellCards.length, 26);
  assert.equal(cardPool.weaponCards.length, 6);
  assert.equal(cardPool.neutralCards.length, 32);
  assert.equal(cardPool.adventureCards.length, 108);
  assert.equal(cardPool.starterCards.length, 13);
  assert.equal(cardPool.allCards.length, 213);
  assert.equal(new Set(cardPool.allCards.map((card) => card.id)).size, 213);
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

test("初始牌组的技能角色保留克制身材", () => {
  const expectedStats = new Map([
    ["镖局护卫", [1, 3]],
    ["客栈女侠", [2, 3]],
    ["重案探员", [2, 3]],
  ]);

  for (const [role, stats] of expectedStats) {
    const card = starterCards.allCards.find((entry) => entry.role === role);
    assert.deepEqual([card.attack, card.health], stats);
  }

  const tangBohu = cardPool.allCards.find(
    (card) => card.id === "role-周星驰-唐伯虎",
  );
  const wongFeiHung = cardPool.allCards.find(
    (card) => card.id === "role-李连杰-黄飞鸿",
  );
  assert.deepEqual([tangBohu.attack, tangBohu.health], [2, 4]);
  assert.deepEqual([wongFeiHung.attack, wongFeiHung.health], [4, 5]);
});

test("初始牌组保留费用曲线但起手完全随机", () => {
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

  const openings = Array.from({ length: 24 }, (_, index) =>
    createGame({ seed: 100 + index }).players.player.hand,
  );
  const openingIds = openings.map((hand) =>
    hand.map((card) => card.id).join("|"),
  );
  assert.ok(
    new Set(openingIds).size > 1,
    "不同随机种子应该产生不同起手",
  );
  assert.ok(
    openings.some(
      (hand) => hand.map((card) => card.cost).join(",") !== "1,2,3",
    ),
    "随机起手应该允许出现非一二三费组合",
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

test("挑战某个片场时优先把该片场已获得卡装入牌组", () => {
  const shawOwned = shawAdventure.stages.map(
    (stage) => stage.rewardCardIds[0],
  );
  const goldenReward = goldenHarvestAdventure.stages[0].rewardCardIds[0];
  const profile = {
    schemaVersion: 1,
    completedStageIds: [goldenHarvestAdventure.stages[0].id],
    claimedStageIds: [goldenHarvestAdventure.stages[0].id],
    ownedCardIds: [...shawOwned, goldenReward],
  };
  const service = new AdventureService({
    repository: new MemoryProfileRepository(profile),
  });
  const game = createGame(
    service.createGameOptions(goldenHarvestAdventure.stages[1].id, 219),
  );
  const playerDeck = [
    ...game.players.player.hand,
    ...game.players.player.deck,
  ];

  assert.ok(playerDeck.some((card) => card.id === goldenReward));
  assert.equal(playerDeck.length, 15);
});

test("六个片场冒险都包含八关并按要求设置头目奖励", () => {
  for (const adventure of studioRegistry.adventures) {
    assert.equal(adventure.stages.length, 8);
    assert.deepEqual(
      adventure.stages.map((stage) => stage.bossType),
      ["small", "small", "mid", "small", "mid", "small", "small", "final"],
    );
    assert.ok(
      adventure.stages
        .filter((stage) => stage.bossType === "small")
        .every((stage) => stage.rewardCardIds.length === 3),
    );
    assert.ok(
      adventure.stages
        .filter((stage) => stage.bossType !== "small")
        .every((stage) => stage.rewardCardIds.length === 1),
    );
  }
});

test("邵氏偏站场防守，嘉禾偏低血进攻与动作连拍", () => {
  const shawRoles = shawCards.allCards.filter((card) => card.type === "role");
  const goldenRoles = goldenHarvestCards.allCards.filter(
    (card) => card.type === "role",
  );
  const average = (cards, stat) =>
    cards.reduce((total, card) => total + card[stat], 0) / cards.length;
  const collectEffects = (effects) =>
    effects.flatMap((effect) => [
      effect.type,
      ...collectEffects(effect.effects || []),
    ]);
  const goldenEffects = goldenHarvestCards.allCards.flatMap((card) =>
    collectEffects([...(card.effects || []), ...(card.deathEffects || [])]),
  );
  const shawEffects = shawCards.allCards.flatMap((card) =>
    collectEffects([...(card.effects || []), ...(card.deathEffects || [])]),
  );

  assert.ok(average(shawRoles, "health") > average(shawRoles, "attack"));
  assert.ok(average(goldenRoles, "attack") > average(goldenRoles, "health"));
  assert.ok(goldenEffects.filter((type) => type === "combo").length >= 8);
  assert.ok(goldenEffects.filter((type) => type === "whileArmed").length >= 3);
  assert.equal(shawEffects.includes("combo"), false);
  assert.equal(shawEffects.includes("whileArmed"), false);
  assert.ok(
    goldenHarvestCards.allCards.filter((card) =>
      card.keywords.includes("rush"),
    ).length >
      shawCards.allCards.filter((card) => card.keywords.includes("rush")).length,
  );
});

test("新艺城以拍档、反转与转场形成独立的中速风格", () => {
  const collectEffects = (effects) =>
    effects.flatMap((effect) => [
      effect.type,
      ...collectEffects(effect.effects || []),
    ]);
  const effects = cinemaCityCards.allCards.flatMap((card) =>
    collectEffects([...(card.effects || []), ...(card.deathEffects || [])]),
  );

  assert.ok(effects.filter((type) => type === "withPartner").length >= 8);
  assert.ok(effects.filter((type) => type === "comeback").length >= 5);
  assert.ok(
    effects.filter((type) => type === "returnFriendlyToHand").length >= 2,
  );
  assert.equal(effects.includes("combo"), false);
  assert.equal(effects.includes("whileArmed"), false);
});

test("德宝以独角、双线与接班形成场面判断风格", () => {
  const collectEffects = (effects) =>
    effects.flatMap((effect) => [
      effect.type,
      ...collectEffects(effect.effects || []),
      ...collectEffects(effect.commercialEffects || []),
      ...collectEffects(effect.creativeEffects || []),
    ]);
  const effects = dandBCards.allCards.flatMap((card) =>
    collectEffects([...(card.effects || []), ...(card.deathEffects || [])]),
  );

  assert.ok(effects.filter((type) => type === "soloSpotlight").length >= 6);
  assert.ok(effects.filter((type) => type === "twoTrack").length >= 6);
  assert.ok(effects.filter((type) => type === "handover").length >= 6);
  assert.equal(effects.includes("combo"), false);
  assert.equal(effects.includes("withPartner"), false);
});

test("金公主以首映与跨类型连映形成院线排片风格", () => {
  const collectEffects = (effects) =>
    effects.flatMap((effect) => [
      effect.type,
      ...collectEffects(effect.effects || []),
    ]);
  const effects = goldenPrincessCards.allCards.flatMap((card) =>
    collectEffects([...(card.effects || []), ...(card.deathEffects || [])]),
  );

  assert.ok(effects.filter((type) => type === "premiere").length >= 8);
  assert.ok(effects.filter((type) => type === "doubleFeature").length >= 7);
  assert.equal(effects.includes("combo"), false);
  assert.equal(effects.includes("withPartner"), false);
  assert.equal(goldenPrincessAdventure.order, 5);
});

test("银河映像以对峙与时限形成冷峻的场面计算风格", () => {
  const collectEffects = (effects) =>
    effects.flatMap((effect) => [
      effect.type,
      ...collectEffects(effect.effects || []),
    ]);
  const effects = milkywayImageCards.allCards.flatMap((card) =>
    collectEffects([...(card.effects || []), ...(card.deathEffects || [])]),
  );

  assert.ok(effects.filter((type) => type === "standoff").length >= 7);
  assert.ok(effects.filter((type) => type === "deadline").length >= 7);
  assert.equal(effects.includes("premiere"), false);
  assert.equal(effects.includes("soloSpotlight"), false);
  assert.equal(milkywayImageAdventure.order, 6);
});

test("十五张牌冒险使用分级 AI 与受控的头目生命曲线", () => {
  const expectedDifficulty = {
    small: "easy",
    mid: "normal",
    final: "hard",
  };

  for (const adventure of studioRegistry.adventures) {
    adventure.stages.forEach((stage, index) => {
      const previous = adventure.stages.slice(0, index);
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
      assert.ok(
        options.enemyDeck
          .filter((card) => card.adventure)
          .every((card) => card.adventure === adventure.id),
      );
      assert.equal(
        options.enemyDeck.filter((card) => card.adventure === adventure.id).length,
        Math.min(9, 5 + Math.floor(stage.order / 2)),
      );
    });
    assert.ok(adventure.stages[0].health <= 24);
    assert.ok(adventure.stages.at(-1).health <= 36);
    assert.ok(
      adventure.stages.every((stage) => stage.health <= 36),
      "十五张牌的对局不应依靠过高血量拖入疲劳阶段",
    );
  }
});

test("冒险进度要求按顺序通关并领取上一关奖励", () => {
  const repository = new MemoryProfileRepository();
  const adventures = new AdventureService({ repository });
  let state = adventures.state();

  assert.equal(state.adventures[0].stages[0].unlocked, true);
  assert.equal(state.adventures[0].stages[1].unlocked, false);
  assert.equal(state.adventures[1].stages[0].unlocked, true);
  assert.equal(state.adventures[1].stages[1].unlocked, false);
  assert.equal(state.adventures[2].stages[0].unlocked, true);
  assert.equal(state.adventures[2].stages[1].unlocked, false);
  assert.equal(state.adventures[3].stages[0].unlocked, true);
  assert.equal(state.adventures[3].stages[1].unlocked, false);
  assert.equal(state.adventures[4].stages[0].unlocked, true);
  assert.equal(state.adventures[4].stages[1].unlocked, false);
  assert.equal(state.adventures[5].stages[0].unlocked, true);
  assert.equal(state.adventures[5].stages[1].unlocked, false);
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

test("六个片场的头目奖励卡都保持普通构筑费用曲线", () => {
  for (const cards of studioRegistry.cardSets) {
    assert.equal(cards.bossCards.length, 3);
    for (const card of cards.bossCards) {
      assert.ok(card.cost >= 4);
      assert.ok(card.attack <= 6);
      assert.ok(card.health <= 8);
      assert.ok(card.attack + card.health <= card.cost * 2 + 4);
      assert.equal(card.bossOnly, undefined);
    }
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

test("四十八种片场机制都能完成首个头目回合", () => {
  for (const adventure of studioRegistry.adventures) {
    adventure.stages.forEach((stage, index) => {
      const previous = adventure.stages.slice(0, index);
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
  }
});
