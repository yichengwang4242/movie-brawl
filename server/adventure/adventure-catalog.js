"use strict";

const cardPool = require("../../game-data.js");
const studioRegistry = require("../../studio-registry.js");
const {
  EncounterRuleRegistry,
} = require("./encounter-rule-registry.js");
const { RandomSource } = require("../game/random-source.js");
const { GameRuleError } = require("../game/rules.js");
const {
  validateCardIdContract,
} = require("../content/card-id-contract.js");

class AdventureCatalog {
  constructor() {
    this.adventures = studioRegistry.adventures;
    this.cardsById = new Map(
      cardPool.allCards.map((card) => [card.id, card]),
    );
    validateCardIdContract(cardPool.allCards);
    this.validateContent();
  }

  validateContent() {
    if (this.cardsById.size !== cardPool.allCards.length) {
      throw new Error("Card registry contains duplicate IDs.");
    }
    const supportedMechanics = EncounterRuleRegistry.supportedMechanics();
    const stageIds = new Set();
    for (const adventure of this.adventures) {
      for (const stage of adventure.stages) {
        if (stageIds.has(stage.id)) {
          throw new Error(`Duplicate adventure stage ID: ${stage.id}`);
        }
        stageIds.add(stage.id);
        if (!supportedMechanics.has(stage.mechanic)) {
          throw new Error(`Unknown encounter mechanic: ${stage.mechanic}`);
        }
        for (const cardId of stage.rewardCardIds) {
          if (!this.cardsById.has(cardId)) {
            throw new Error(`Unknown reward card ${cardId} in ${stage.id}`);
          }
        }
      }
    }
  }

  adventure(id) {
    return this.adventures.find((adventure) => adventure.id === id) || null;
  }

  stage(stageId) {
    for (const adventure of this.adventures) {
      const stage = adventure.stages.find((candidate) => candidate.id === stageId);
      if (stage) return { adventure, stage };
    }
    return null;
  }

  card(cardId) {
    return this.cardsById.get(cardId) || null;
  }

  cards(cardIds) {
    return cardIds.map((id) => this.card(id)).filter(Boolean);
  }

  buildEnemyDeck(adventure, stage, seed) {
    const random = new RandomSource((seed || 1) + stage.order * 97);
    const priorRewards = adventure.stages
      .filter((candidate) => candidate.order <= stage.order)
      .flatMap((candidate) => candidate.rewardCardIds);
    const thematic = this.cards([...new Set(priorRewards)]);
    const support = cardPool.allCards.filter(
      (card) =>
        !card.adventure &&
        card.cost <= Math.min(6, 3 + Math.ceil(stage.order / 2)) &&
        !card.requirements?.minFriendly,
    );
    if (!thematic.length && !support.length) {
      throw new GameRuleError("EMPTY_BOSS_DECK", "头目牌组尚未配置。");
    }
    const thematicSlots = thematic.length
      ? Math.min(9, 5 + Math.floor(stage.order / 2))
      : 0;
    const thematicPool = random.shuffle(thematic);
    const supportPool = random.shuffle(support);
    const deck = [
      ...this.takeCycling(thematicPool, thematicSlots),
      ...this.takeCycling(
        supportPool.length ? supportPool : thematicPool,
        15 - thematicSlots,
      ),
    ];
    return random.shuffle(deck);
  }

  takeCycling(cards, amount) {
    return Array.from(
      { length: amount },
      (_, index) => cards[index % cards.length],
    );
  }

  publicAdventure(adventure, profile) {
    const completed = new Set(profile.completedStageIds);
    const claimed = new Set(profile.claimedStageIds);
    return {
      id: adventure.id,
      order: adventure.order,
      name: adventure.name,
      kicker: adventure.kicker,
      subtitle: adventure.subtitle,
      description: adventure.description,
      motif: adventure.motif,
      palette: adventure.palette,
      art: adventure.art,
      ownedCount: adventure.cards.filter((card) =>
        profile.ownedCardIds.includes(card.id),
      ).length,
      completedCount: adventure.stages.filter((stage) => completed.has(stage.id)).length,
      stages: adventure.stages.map((stage, index) => ({
        ...stage,
        unlocked: index === 0 || completed.has(adventure.stages[index - 1].id),
        completed: completed.has(stage.id),
        rewardClaimed: claimed.has(stage.id),
        rewardCards: this.cards(stage.rewardCardIds),
      })),
    };
  }
}

module.exports = { AdventureCatalog };
