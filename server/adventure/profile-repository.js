"use strict";

const {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} = require("node:fs");
const path = require("node:path");

function freshProfile() {
  return {
    schemaVersion: 1,
    completedStageIds: [],
    claimedStageIds: [],
    ownedCardIds: [],
  };
}

class MemoryProfileRepository {
  constructor(profile = freshProfile()) {
    this.profile = structuredClone(profile);
  }

  load() {
    return structuredClone(this.profile);
  }

  save(profile) {
    this.profile = structuredClone(profile);
  }
}

class JsonProfileRepository {
  constructor(filename) {
    this.filename = filename;
  }

  load() {
    if (!existsSync(this.filename)) return freshProfile();
    try {
      return { ...freshProfile(), ...JSON.parse(readFileSync(this.filename, "utf8")) };
    } catch {
      return freshProfile();
    }
  }

  save(profile) {
    mkdirSync(path.dirname(this.filename), { recursive: true });
    const temporary = `${this.filename}.tmp`;
    writeFileSync(temporary, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
    renameSync(temporary, this.filename);
  }
}

module.exports = {
  JsonProfileRepository,
  MemoryProfileRepository,
  freshProfile,
};
