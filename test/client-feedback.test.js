"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, readdirSync } = require("node:fs");
const path = require("node:path");
const cardPool = require("../game-data.js");
const messages = require("../localization/messages.js");
const { I18n } = require("../localization/i18n.js");
const { createMovieBrawlServer } = require("../server.js");
const {
  AdventureService,
} = require("../server/adventure/adventure-service.js");
const {
  MemoryProfileRepository,
} = require("../server/adventure/profile-repository.js");
const {
  createGame,
  GameRuleError,
  _internals,
} = require("../server/game-engine.js");

const root = path.resolve(__dirname, "..");

// Client modules are ES modules inside a CommonJS package; a data URL lets
// Node 20 load them without module-syntax detection.
async function importClientModule(relativePath) {
  const source = readFileSync(path.join(root, relativePath), "utf8");
  return import(
    `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
  );
}

function battleState({ version, playerHealth = 30, enemyHealth = 30, board = [], logs = [] }) {
  return {
    gameId: "game-1",
    version,
    player: { health: playerHealth, board: board.filter((card) => card.side === "player") },
    enemy: { health: enemyHealth, board: board.filter((card) => card.side === "enemy") },
    logs: logs.map((id) => ({ id })),
  };
}

test("战斗反馈只在状态版本变化时比较血量、登场和新战报", async () => {
  const { CombatFeedback, EFFECT_DURATION_MS } = await importClientModule(
    "client/combat-feedback.js",
  );
  let now = 0;
  const feedback = new CombatFeedback(() => now);

  feedback.observe(battleState({
    version: 1,
    board: [
      { side: "player", instanceId: "a", currentHealth: 3, shield: false },
      { side: "enemy", instanceId: "b", currentHealth: 4, shield: true },
    ],
    logs: [1, 2],
  }));
  assert.equal(feedback.elapsed(), null, "开局不应播放反馈");
  assert.equal(feedback.isFreshLog({ id: 2 }), false);

  now = 100;
  feedback.observe(battleState({
    version: 2,
    playerHealth: 27,
    enemyHealth: 32,
    board: [
      { side: "player", instanceId: "a", currentHealth: 1, shield: false },
      { side: "enemy", instanceId: "b", currentHealth: 4, shield: false },
      { side: "enemy", instanceId: "c", currentHealth: 2, shield: false },
    ],
    logs: [1, 2, 3, 4],
  }));
  assert.deepEqual(feedback.effects.heroes, { player: -3, enemy: 2 });
  assert.deepEqual(feedback.effects.cards.get("a"), {
    entering: false,
    delta: -2,
    shieldBroken: false,
  });
  assert.deepEqual(feedback.effects.cards.get("b"), {
    entering: false,
    delta: 0,
    shieldBroken: true,
  });
  assert.equal(feedback.effects.cards.get("c").entering, true);
  assert.equal(feedback.isFreshLog({ id: 2 }), false);
  assert.equal(feedback.isFreshLog({ id: 3 }), true);

  now = 400;
  feedback.observe(battleState({ version: 2, playerHealth: 27, logs: [1, 2, 3, 4] }));
  assert.equal(feedback.elapsed(), 300, "同版本重绘应延续原有动画");
  assert.equal(feedback.isFreshLog({ id: 4 }), true, "新战报在下一次动作前保持高亮");

  now = 100 + EFFECT_DURATION_MS;
  assert.equal(feedback.elapsed(), null);

  feedback.observe({ ...battleState({ version: 1, logs: [1] }), gameId: "game-2" });
  assert.equal(feedback.effects, null, "新对局不继承上一局反馈");
  assert.equal(feedback.isFreshLog({ id: 1 }), false);
});

function fakeSelect(value) {
  const listeners = [];
  return {
    value,
    addEventListener: (type, listener) => listeners.push(listener),
    change(next) {
      this.value = next;
      listeners.forEach((listener) => listener());
    },
  };
}

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, value),
    values,
  };
}

test("练习难度单独保存，不被冒险关卡的难度覆盖", async () => {
  const { PracticeSettings } = await importClientModule(
    "client/practice-settings.js",
  );
  const storage = memoryStorage({ "movie-brawl-practice-difficulty": "hard" });
  const select = fakeSelect("normal");
  const changes = [];
  const settings = new PracticeSettings(select, (value) => changes.push(value), storage);
  assert.equal(settings.difficulty, "hard");
  assert.equal(select.value, "hard");

  // An adventure match writes its own difficulty into the shared select.
  select.value = "easy";
  assert.equal(settings.difficulty, "hard");

  select.change("normal");
  assert.equal(settings.difficulty, "normal");
  assert.equal(storage.values.get("movie-brawl-practice-difficulty"), "normal");
  assert.deepEqual(changes, ["normal"]);

  assert.equal(settings.remember("impossible"), "normal");

  const brokenStorage = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    },
  };
  const fallback = new PracticeSettings(fakeSelect("easy"), undefined, brokenStorage);
  assert.equal(fallback.difficulty, "easy");
  assert.equal(fallback.remember("hard"), "hard");
});

test("出牌条件不足时错误带上人数参数，并在双语中正确显示", async () => {
  const game = createGame({ seed: 5 });
  const base = cardPool.allCards.find(
    (card) => card.requirements?.minFriendly === 2,
  );
  const card = _internals.createCardInstance(game, base);
  game.players.player.hand = [card];
  game.players.player.mana = 10;
  assert.throws(
    () => _internals.playCard(game, "player", card.instanceId),
    (error) =>
      error instanceof GameRuleError &&
      error.code === "REQUIREMENTS_NOT_MET" &&
      error.params.count === 2,
  );

  const failingGames = {
    act() {
      throw new GameRuleError("REQUIREMENTS_NOT_MET", "至少需要 2 个友方角色。", {
        count: 2,
      });
    },
  };
  const server = createMovieBrawlServer({
    adventureService: new AdventureService({
      repository: new MemoryProfileRepository(),
    }),
    gameService: failingGames,
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const { port } = server.address();
    const response = await fetch(
      `http://127.0.0.1:${port}/api/games/abc-123/actions`,
      { method: "POST", body: JSON.stringify({ type: "PLAY_CARD" }) },
    );
    assert.equal(response.status, 400);
    const payload = await response.json();
    assert.deepEqual(payload.params, { count: 2 });

    const error = Object.assign(new Error(payload.message), {
      code: payload.error,
      params: payload.params,
    });
    for (const locale of ["zh-CN", "en"]) {
      const text = new I18n(cardPool, {}, { locale, storage: null }).error(error);
      assert.match(text, /2/);
      assert.doesNotMatch(text, /\{count\}/, `${locale} 未替换人数参数`);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

function serverSources(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return serverSources(fullPath);
    return entry.name.endsWith(".js") ? [readFileSync(fullPath, "utf8")] : [];
  });
}

test("服务端抛出的每个错误码都有中英文提示", () => {
  const sources = [
    ...serverSources(path.join(root, "server")),
    readFileSync(path.join(root, "server.js"), "utf8"),
  ];
  const codes = new Set(["REQUEST_FAILED"]);
  for (const source of sources) {
    for (const match of source.matchAll(/GameRuleError\(\s*"([A-Z_]+)"/g)) {
      codes.add(match[1]);
    }
    for (const match of source.matchAll(/error:\s*"([A-Z_]+)"/g)) {
      codes.add(match[1]);
    }
  }
  assert.ok(codes.size > 20, "应扫描到服务端错误码");
  for (const code of codes) {
    for (const locale of ["zh-CN", "en"]) {
      assert.ok(
        messages[locale][`error.${code}`],
        `${locale} 缺少错误提示 error.${code}`,
      );
    }
  }
});
