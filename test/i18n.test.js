"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const cardPool = require("../game-data.js");
const shawAdventure = require("../shaw-adventure.js");
const messages = require("../localization/messages.js");
const { I18n } = require("../localization/i18n.js");
const {
  AdventureService,
} = require("../server/adventure/adventure-service.js");
const {
  MemoryProfileRepository,
} = require("../server/adventure/profile-repository.js");
const {
  createGame,
  performAction,
} = require("../server/game-engine.js");

const HAN = /\p{Script=Han}/u;

function englishI18n() {
  return new I18n(cardPool, shawAdventure, {
    locale: "en",
    storage: null,
  });
}

test("英文界面文案与中文界面使用完全相同的语言键", () => {
  assert.deepEqual(
    Object.keys(messages.en).sort(),
    Object.keys(messages["zh-CN"]).sort(),
  );
  for (const [key, value] of Object.entries(messages.en)) {
    if (key === "control.chinese") continue;
    assert.doesNotMatch(value, HAN, `${key} 仍含中文`);
  }
});

test("全部卡牌字段与技能在英文模式下均有英文展示", () => {
  const i18n = englishI18n();
  for (const source of cardPool.allCards) {
    const card = i18n.card(source);
    for (const key of [
      "star",
      "role",
      "movie",
      "text",
      "rarity",
      "region",
      "motif",
    ]) {
      if (!card[key]) continue;
      assert.doesNotMatch(
        card[key],
        HAN,
        `${source.id} 的 ${key} 尚未完整翻译：${card[key]}`,
      );
    }
  }
});

test("邵氏八关的片名、头目和场地机制均有英文版本", () => {
  const i18n = englishI18n();
  for (const source of shawAdventure.stages) {
    const stage = i18n.stage(source);
    for (const key of [
      "movie",
      "title",
      "bossName",
      "mechanicTitle",
      "mechanicText",
    ]) {
      assert.doesNotMatch(
        stage[key],
        HAN,
        `${source.id} 的 ${key} 尚未完整翻译`,
      );
    }
  }
});

test("八种头目机制的首回合战报可以完整显示为英文", () => {
  const i18n = englishI18n();
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
    const game = createGame(adventures.createGameOptions(stage.id, 140 + index));
    performAction(game, { type: "END_TURN" });

    for (const entry of game.logs) {
      assert.doesNotMatch(
        i18n.log(entry),
        HAN,
        `${stage.id} 战报尚未翻译：${entry.message}`,
      );
    }
  });
});

test("动态战斗战报模板覆盖卡牌、武器、亡语和疲劳事件", () => {
  const i18n = englishI18n();
  const samples = [
    "影迷打出 至尊宝。",
    "至尊宝 直接攻击反派制片方英雄。",
    "至尊宝 与 陈家驹 交战。",
    "影迷装备 金箍棒（5/2）。",
    "影迷使用 金箍棒 攻击 陈家驹。",
    "金箍棒 耐久耗尽。",
    "陈家驹 的护盾挡下了伤害。",
    "陈家驹 的亡语触发。",
    "影迷牌库见底，受到 3 点疲劳伤害。",
    "至尊宝与陈家驹融合为 银幕双雄。",
  ];
  for (const message of samples) {
    assert.doesNotMatch(
      i18n.log({ message }),
      HAN,
      `战报模板尚未翻译：${message}`,
    );
  }
});
