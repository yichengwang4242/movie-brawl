"use strict";

const { AdventureCatalog } = require("./adventure-catalog.js");
const { MemoryProfileRepository } = require("./profile-repository.js");
const { GameRuleError } = require("../game/rules.js");

class AdventureService {
  constructor(options = {}) {
    this.catalog = options.catalog || new AdventureCatalog();
    this.repository = options.repository || new MemoryProfileRepository();
  }

  state() {
    const profile = this.repository.load();
    return {
      profile,
      pendingReward: this.pendingReward(profile),
      adventures: this.catalog.adventures.map((adventure) =>
        this.catalog.publicAdventure(adventure, profile),
      ),
    };
  }

  createGameOptions(stageId, seed) {
    const match = this.catalog.stage(stageId);
    if (!match) {
      throw new GameRuleError("STAGE_NOT_FOUND", "这个关卡不存在。");
    }
    const profile = this.repository.load();
    const publicAdventure = this.catalog.publicAdventure(match.adventure, profile);
    const publicStage = publicAdventure.stages.find((stage) => stage.id === stageId);
    if (!publicStage.unlocked) {
      throw new GameRuleError("STAGE_LOCKED", "请先完成前一个关卡。");
    }
    if (this.pendingReward(profile)) {
      throw new GameRuleError("REWARD_PENDING", "请先领取上一关奖励。");
    }
    const ownedCards = this.catalog.cards(profile.ownedCardIds);
    const playerBonusCards = [
      ...ownedCards.filter((card) => card.adventure === match.adventure.id),
      ...ownedCards.filter((card) => card.adventure !== match.adventure.id),
    ];

    return {
      seed,
      difficulty:
        match.stage.bossType === "small"
          ? "easy"
          : match.stage.bossType === "mid"
            ? "normal"
            : "hard",
      enemyName: match.stage.bossName,
      enemyHealth: match.stage.health,
      enemyDeck: this.catalog.buildEnemyDeck(match.adventure, match.stage, seed),
      playerBonusCards,
      encounter: match.stage,
    };
  }

  complete(stageId, winner) {
    if (winner !== "player") return this.state();
    const match = this.catalog.stage(stageId);
    if (!match) return this.state();
    const profile = this.repository.load();
    if (!profile.completedStageIds.includes(stageId)) {
      profile.completedStageIds.push(stageId);
      this.repository.save(profile);
    }
    return this.state();
  }

  claim(stageId, cardId) {
    const match = this.catalog.stage(stageId);
    if (!match) {
      throw new GameRuleError("STAGE_NOT_FOUND", "这个关卡不存在。");
    }
    const profile = this.repository.load();
    if (!profile.completedStageIds.includes(stageId)) {
      throw new GameRuleError("REWARD_LOCKED", "尚未击败这个头目。");
    }
    if (profile.claimedStageIds.includes(stageId)) {
      throw new GameRuleError("REWARD_CLAIMED", "这个关卡奖励已经领取。");
    }
    if (!match.stage.rewardCardIds.includes(cardId)) {
      throw new GameRuleError("INVALID_REWARD", "这张卡不在本关奖励中。");
    }

    profile.claimedStageIds.push(stageId);
    if (!profile.ownedCardIds.includes(cardId)) profile.ownedCardIds.push(cardId);
    this.repository.save(profile);
    return {
      card: this.catalog.card(cardId),
      ...this.state(),
    };
  }

  pendingReward(profile) {
    for (const adventure of this.catalog.adventures) {
      const stage = adventure.stages.find(
        (candidate) =>
          profile.completedStageIds.includes(candidate.id) &&
          !profile.claimedStageIds.includes(candidate.id),
      );
      if (stage) {
        return {
          stageId: stage.id,
          bossType: stage.bossType,
          title: stage.title,
          cards: this.catalog.cards(stage.rewardCardIds),
        };
      }
    }
    return null;
  }
}

module.exports = { AdventureService };
