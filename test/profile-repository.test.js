"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  JsonProfileRepository,
  MemoryProfileRepository,
} = require("../server/adventure/profile-repository.js");
const {
  CURRENT_PROFILE_SCHEMA_VERSION,
  ProfileDataError,
} = require("../server/adventure/profile-schema.js");

test("旧存档升级到当前版本并迁移卡牌别名", () => {
  const repository = new MemoryProfileRepository({
    schemaVersion: 1,
    completedStageIds: ["shaw-01-inn", "shaw-01-inn"],
    claimedStageIds: [],
    ownedCardIds: ["role-周星驰-至尊宝-v0"],
  });
  const profile = repository.load();

  assert.equal(profile.schemaVersion, CURRENT_PROFILE_SCHEMA_VERSION);
  assert.deepEqual(profile.completedStageIds, ["shaw-01-inn"]);
  assert.deepEqual(profile.ownedCardIds, ["role-周星驰-至尊宝"]);
});

test("内存存档拒绝字段类型错误的数据", () => {
  assert.throws(
    () =>
      new MemoryProfileRepository({
        schemaVersion: 1,
        completedStageIds: [],
        claimedStageIds: [],
        ownedCardIds: null,
      }),
    (error) => error instanceof ProfileDataError,
  );
});

test("文件存档损坏时保留备份并创建干净的新存档", (context) => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "movie-brawl-profile-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const filename = path.join(directory, "profile.json");
  writeFileSync(
    filename,
    JSON.stringify({
      schemaVersion: 1,
      completedStageIds: [],
      claimedStageIds: [],
      ownedCardIds: null,
    }),
  );
  const repository = new JsonProfileRepository(filename, { now: () => 1234 });
  const profile = repository.load();

  assert.equal(profile.schemaVersion, CURRENT_PROFILE_SCHEMA_VERSION);
  assert.deepEqual(profile.ownedCardIds, []);
  assert.equal(existsSync(`${filename}.invalid-1234`), true);
});

test("文件存档升级后原子写回当前版本", (context) => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "movie-brawl-profile-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const filename = path.join(directory, "profile.json");
  writeFileSync(
    filename,
    JSON.stringify({
      schemaVersion: 1,
      completedStageIds: [],
      claimedStageIds: [],
      ownedCardIds: [],
    }),
  );

  new JsonProfileRepository(filename).load();
  const saved = JSON.parse(readFileSync(filename, "utf8"));
  assert.equal(saved.schemaVersion, CURRENT_PROFILE_SCHEMA_VERSION);
  assert.equal(existsSync(`${filename}.tmp`), false);
});
