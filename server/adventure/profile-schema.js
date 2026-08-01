"use strict";

const CURRENT_PROFILE_SCHEMA_VERSION = 2;

const CARD_ID_ALIASES = Object.freeze({
  "role-周星驰-至尊宝-v0": "role-周星驰-至尊宝",
});

class ProfileDataError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProfileDataError";
  }
}

function freshProfile() {
  return {
    schemaVersion: CURRENT_PROFILE_SCHEMA_VERSION,
    completedStageIds: [],
    claimedStageIds: [],
    ownedCardIds: [],
  };
}

function stringArray(value, field) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new ProfileDataError(`${field} must be an array of strings.`);
  }
  return [...new Set(value)];
}

function migrateProfile(source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new ProfileDataError("Profile must be an object.");
  }
  const version = source.schemaVersion ?? 1;
  if (!Number.isInteger(version) || version < 1) {
    throw new ProfileDataError("Profile schema version is invalid.");
  }
  if (version > CURRENT_PROFILE_SCHEMA_VERSION) {
    throw new ProfileDataError(`Profile schema ${version} is newer than this game.`);
  }

  const profile = {
    schemaVersion: CURRENT_PROFILE_SCHEMA_VERSION,
    completedStageIds: stringArray(
      source.completedStageIds,
      "completedStageIds",
    ),
    claimedStageIds: stringArray(source.claimedStageIds, "claimedStageIds"),
    ownedCardIds: stringArray(source.ownedCardIds, "ownedCardIds").map(
      (id) => CARD_ID_ALIASES[id] || id,
    ),
  };
  profile.ownedCardIds = [...new Set(profile.ownedCardIds)];
  return profile;
}

module.exports = {
  CARD_ID_ALIASES,
  CURRENT_PROFILE_SCHEMA_VERSION,
  ProfileDataError,
  freshProfile,
  migrateProfile,
};
