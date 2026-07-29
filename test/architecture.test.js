"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const clientModules = [
  "app.js",
  "client/elements.js",
  "client/i18n.js",
  "client/game-api-client.js",
  "client/playability-feedback.js",
  "client/card-renderer.js",
  "client/battle-view.js",
  "client/collection-view.js",
  "client/feedback-view.js",
  "client/adventure-view.js",
  "client/outcome-view.js",
  "client/game-controller.js",
];
const gameModules = [
  "server/game-engine.js",
  "server/game/rules.js",
  "server/game/random-source.js",
  "server/game/card-factory.js",
  "server/game/game-state.js",
  "server/game/combat-resolver.js",
  "server/game/effect-resolver.js",
  "server/game/ai-director.js",
  "server/game/death-resolver.js",
  "server/game/advanced-effect-handlers.js",
  "server/game/ai/ai-strategy.js",
  "server/game/ai/easy-ai-strategy.js",
  "server/game/ai/normal-ai-strategy.js",
  "server/game/ai/hard-ai-strategy.js",
  "server/game/game-serializer.js",
  "server/game/game-engine.js",
  "server/adventure/profile-repository.js",
  "server/adventure/adventure-catalog.js",
  "server/adventure/adventure-service.js",
  "server/adventure/boss-encounter.js",
  "localization/card-describer.js",
  "localization/log-translator.js",
  "localization/i18n.js",
];

function source(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function lineCount(relativePath) {
  return source(relativePath).split("\n").length;
}

test("浏览器入口保持轻量，前端模块都能按 ES module 语法解析", () => {
  assert.ok(lineCount("app.js") <= 10, "app.js 应只负责启动应用");

  for (const relativePath of clientModules) {
    const result = spawnSync(
      process.execPath,
      ["--input-type=module", "--check"],
      {
        input: source(relativePath),
        encoding: "utf8",
      },
    );
    assert.equal(
      result.status,
      0,
      `${relativePath} 语法错误：${result.stderr}`,
    );
  }
});

test("游戏入口保持为薄兼容层，业务类不重新堆回单一大文件", () => {
  assert.ok(
    lineCount("server/game-engine.js") <= 60,
    "server/game-engine.js 应只暴露公共接口",
  );

  for (const relativePath of [...clientModules.slice(1), ...gameModules.slice(1)]) {
    assert.ok(
      lineCount(relativePath) <= 300,
      `${relativePath} 已超过 300 行，应继续拆分职责`,
    );
  }
});

test("核心职责由独立类承载", () => {
  const expectedClasses = new Map([
    ["client/game-controller.js", "GameController"],
    ["client/battle-view.js", "BattleView"],
    ["client/card-renderer.js", "CardRenderer"],
    ["client/adventure-view.js", "AdventureView"],
    ["client/outcome-view.js", "OutcomeView"],
    ["client/playability-feedback.js", "PlayabilityFeedback"],
    ["server/game/game-engine.js", "GameEngine"],
    ["server/game/game-state.js", "GameState"],
    ["server/game/combat-resolver.js", "CombatResolver"],
    ["server/game/effect-resolver.js", "EffectResolver"],
    ["server/game/ai-director.js", "AiDirector"],
    ["server/game/death-resolver.js", "DeathResolver"],
    ["server/game/advanced-effect-handlers.js", "AdvancedEffectHandlers"],
    ["server/game/ai/easy-ai-strategy.js", "EasyAiStrategy"],
    ["server/game/ai/normal-ai-strategy.js", "NormalAiStrategy"],
    ["server/game/ai/hard-ai-strategy.js", "HardAiStrategy"],
    ["server/game/game-serializer.js", "GameSerializer"],
    ["server/adventure/adventure-catalog.js", "AdventureCatalog"],
    ["server/adventure/adventure-service.js", "AdventureService"],
    ["server/adventure/boss-encounter.js", "BossEncounter"],
    ["localization/card-describer.js", "CardDescriber"],
    ["localization/log-translator.js", "LogTranslator"],
    ["localization/i18n.js", "I18n"],
  ]);

  for (const [relativePath, className] of expectedClasses) {
    assert.match(source(relativePath), new RegExp(`class ${className}\\b`));
  }
});
