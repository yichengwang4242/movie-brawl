"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { Readable } = require("node:stream");
const studioRegistry = require("../studio-registry.js");
const cardPool = require("../game-data.js");
const { handleApi, serveStatic } = require("../server.js");
const { GameService } = require("../server/game-service.js");
const { StaticFileCatalog } = require("../server/static-file-catalog.js");
const {
  AdventureService,
} = require("../server/adventure/adventure-service.js");
const {
  MemoryProfileRepository,
} = require("../server/adventure/profile-repository.js");
const {
  validateCardIdContract,
} = require("../server/content/card-id-contract.js");
const {
  createGame,
} = require("../server/game-engine.js");

test("统一片场注册器提供卡池、冒险和规则类", () => {
  assert.deepEqual(
    studioRegistry.adventures.map((adventure) => adventure.id),
    ["shaw", "golden-harvest", "cinema-city", "d-and-b"],
  );
  assert.equal(studioRegistry.cardSets.length, 4);
  assert.equal(studioRegistry.encounterRuleClasses.length, 4);
  assert.equal(studioRegistry.adventureCards.length, 72);
});

test("卡牌稳定标识合同阻止未迁移的ID变化", () => {
  assert.doesNotThrow(() => validateCardIdContract(cardPool.allCards));
  const changed = cardPool.allCards.map((card, index) =>
    index === 0 ? { ...card, id: `${card.id}-renamed` } : card,
  );
  assert.throws(
    () => validateCardIdContract(changed),
    /Add an ID migration/,
  );
});

test("未知头目机制在执行前明确报错", () => {
  const game = createGame({
    encounter: {
      id: "invalid-stage",
      order: 1,
      movie: "测试",
      title: "测试",
      bossName: "测试头目",
      bossType: "small",
      mechanic: "misspelledMechanic",
      mechanicTitle: "错误机制",
      mechanicText: "不应被静默忽略。",
    },
  });
  assert.throws(
    () => game.encounter.beforeEnemyTurn(),
    (error) => error.code === "UNKNOWN_ENCOUNTER_MECHANIC",
  );
});

function request(method, body) {
  const stream = Readable.from(body === undefined ? [] : [JSON.stringify(body)]);
  stream.method = method;
  return stream;
}

function responseRecorder() {
  return {
    status: 0,
    headers: {},
    body: Buffer.alloc(0),
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
    },
    end(body = "") {
      this.body = Buffer.isBuffer(body) ? body : Buffer.from(body);
    },
    json() {
      return JSON.parse(this.body.toString("utf8"));
    },
  };
}

test("HTTP入口可测试且只公开注册过的静态资源", async () => {
  const adventures = new AdventureService({
    repository: new MemoryProfileRepository(),
  });
  const games = new GameService({ adventureService: adventures });
  const services = { adventures, games };

  const healthResponse = responseRecorder();
  await handleApi(request("GET"), healthResponse, "/api/health", services);
  assert.equal(healthResponse.status, 200);
  assert.equal(healthResponse.json().ok, true);

  const catalogResponse = responseRecorder();
  await handleApi(
    request("GET"),
    catalogResponse,
    "/api/adventures",
    services,
  );
  assert.equal(catalogResponse.json().adventures.length, 4);

  const gameResponse = responseRecorder();
  await handleApi(
    request("POST", { stageId: "shaw-01-inn", seed: 9 }),
    gameResponse,
    "/api/games",
    services,
  );
  assert.equal(gameResponse.status, 201);
  assert.equal(gameResponse.json().encounter.stageId, "shaw-01-inn");

  const staticFiles = new StaticFileCatalog(process.cwd());
  const cardResponse = responseRecorder();
  assert.equal(
    await serveStatic(cardResponse, "/d-and-b-cards.js", staticFiles),
    true,
  );
  assert.equal(cardResponse.status, 200);
  assert.equal(await serveStatic(responseRecorder(), "/server.js", staticFiles), false);
  assert.equal(
    await serveStatic(responseRecorder(), "/../server.js", staticFiles),
    false,
  );
});
