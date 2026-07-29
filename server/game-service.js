"use strict";

const { randomUUID } = require("node:crypto");
const { createGame, performAction, toPublicState } = require("./game-engine.js");
const { AdventureService } = require("./adventure/adventure-service.js");

class GameService {
  constructor(options = {}) {
    this.games = new Map();
    this.maxGames = options.maxGames || 100;
    this.adventures = options.adventureService || new AdventureService();
  }

  create(options = {}) {
    this.prune();
    const id = randomUUID();
    const stageId = options.stageId || null;
    const engineOptions = stageId
      ? this.adventures.createGameOptions(stageId, options.seed)
      : options;
    const engine = createGame(engineOptions);
    this.games.set(id, {
      engine,
      stageId,
      resultRecorded: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return this.serialize(id);
  }

  get(id) {
    const game = this.games.get(id);
    if (!game) return null;
    return this.serialize(id);
  }

  act(id, action) {
    const game = this.games.get(id);
    if (!game) return null;
    performAction(game.engine, action, "player");
    if (
      game.stageId &&
      game.engine.phase === "gameOver" &&
      !game.resultRecorded
    ) {
      this.adventures.complete(game.stageId, game.engine.winner);
      game.resultRecorded = true;
    }
    game.updatedAt = Date.now();
    return this.serialize(id);
  }

  serialize(id) {
    const game = this.games.get(id);
    return {
      gameId: id,
      ...toPublicState(game.engine),
      adventure: game.stageId
        ? {
            stageId: game.stageId,
            pendingReward: this.adventures.state().pendingReward,
          }
        : null,
    };
  }

  prune() {
    if (this.games.size < this.maxGames) return;
    const oldest = [...this.games.entries()].sort(
      (left, right) => left[1].updatedAt - right[1].updatedAt,
    )[0];
    if (oldest) this.games.delete(oldest[0]);
  }
}

module.exports = { GameService };
