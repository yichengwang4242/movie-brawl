"use strict";

const {
  AdventureService,
} = require("../server/adventure/adventure-service.js");
const {
  MemoryProfileRepository,
} = require("../server/adventure/profile-repository.js");
const {
  createGame,
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
    schemaVersion: 2,
    completedStageIds: previous.map((stage) => stage.id),
    claimedStageIds: previous.map((stage) => stage.id),
    ownedCardIds: previous.map((stage) => stage.rewardCardIds[0]),
  };
  const service = new AdventureService({
    repository: new MemoryProfileRepository(profile),
  });
  return createGame(
    service.createGameOptions(
      adventure.stages[stageIndex].id,
      seed + stageIndex,
    ),
  );
}

module.exports = { baseRole, createAdventureStageGame, placeCard };
