"use strict";

const {
  existsSync,
  copyFileSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} = require("node:fs");
const path = require("node:path");
const {
  freshProfile,
  migrateProfile,
} = require("./profile-schema.js");

class MemoryProfileRepository {
  constructor(profile = freshProfile()) {
    this.profile = migrateProfile(profile);
  }

  load() {
    return structuredClone(this.profile);
  }

  save(profile) {
    this.profile = migrateProfile(profile);
  }
}

class JsonProfileRepository {
  constructor(filename, options = {}) {
    this.filename = filename;
    this.now = options.now || (() => Date.now());
  }

  load() {
    if (!existsSync(this.filename)) return freshProfile();
    try {
      const source = JSON.parse(readFileSync(this.filename, "utf8"));
      const profile = migrateProfile(source);
      if (source.schemaVersion !== profile.schemaVersion) this.save(profile);
      return profile;
    } catch {
      this.backupInvalidProfile();
      return freshProfile();
    }
  }

  save(profile) {
    const validProfile = migrateProfile(profile);
    mkdirSync(path.dirname(this.filename), { recursive: true });
    const temporary = `${this.filename}.tmp`;
    writeFileSync(
      temporary,
      `${JSON.stringify(validProfile, null, 2)}\n`,
      "utf8",
    );
    renameSync(temporary, this.filename);
  }

  backupInvalidProfile() {
    if (!existsSync(this.filename)) return null;
    const backup = `${this.filename}.invalid-${this.now()}`;
    copyFileSync(this.filename, backup);
    return backup;
  }
}

module.exports = {
  JsonProfileRepository,
  MemoryProfileRepository,
  freshProfile,
};
