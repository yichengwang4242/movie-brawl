"use strict";

const cardPool = require("../../game-data.js");
const shaw = require("../../shaw-adventure.js");
const shawCards = require("../../shaw-cards.js");
const { RandomSource } = require("../game/random-source.js");
const { GameRuleError } = require("../game/rules.js");

class AdventureCatalog {
  constructor() {
    this.adventures = [shaw];
    this.cardsById = new Map(
      [...cardPool.allCards, ...shawCards.allCards].map((card) => [card.id, card]),
    );
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

  buildEnemyDeck(stage, seed) {
    const random = new RandomSource((seed || 1) + stage.order * 97);
    const priorRewards = shaw.stages
      .filter((candidate) => candidate.order <= stage.order)
      .flatMap((candidate) => candidate.rewardCardIds);
    const thematic = this.cards([...new Set(priorRewards)]);
    const support = cardPool.allCards.filter(
      (card) =>
        !card.adventure &&
        card.cost <= Math.min(6, 3 + Math.ceil(stage.order / 2)) &&
        !card.requirements?.minFriendly,
    );
    const candidates = random.shuffle([...thematic, ...support]);
    if (!candidates.length) {
      throw new GameRuleError("EMPTY_BOSS_DECK", "头目牌组尚未配置。");
    }
    const deck = [];
    for (let index = 0; deck.length < 15; index += 1) {
      deck.push(candidates[index % candidates.length]);
    }
    return random.shuffle(deck);
  }

  publicAdventure(adventure, profile) {
    const completed = new Set(profile.completedStageIds);
    const claimed = new Set(profile.claimedStageIds);
    return {
      id: adventure.id,
      name: adventure.name,
      subtitle: adventure.subtitle,
      description: adventure.description,
      motif: adventure.motif,
      palette: adventure.palette,
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
