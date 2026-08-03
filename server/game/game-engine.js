"use strict";

const { RULES, GameRuleError, sideName } = require("./rules.js");
const { CardFactory } = require("./card-factory.js");
const { GameState } = require("./game-state.js");
const { CombatResolver } = require("./combat-resolver.js");
const { EffectResolver } = require("./effect-resolver.js");
const { AiDirector } = require("./ai-director.js");
const { GameSerializer } = require("./game-serializer.js");
const { DeathResolver } = require("./death-resolver.js");
const { BossEncounter } = require("../adventure/boss-encounter.js");

class GameEngine {
  constructor(options = {}) {
    this.state = new GameState();
    this.cards = new CardFactory({ seed: options.seed });
    this.deaths = new DeathResolver(this.state);
    this.combat = new CombatResolver(this.state, this.deaths);
    this.effects = new EffectResolver(
      this.state,
      this.cards,
      this.combat,
      this.deaths,
    );
    this.deaths.setEffectResolver(this.effects);
    this.encounter = options.encounter
      ? new BossEncounter(this, options.encounter)
      : null;
    this.ai = new AiDirector(this, options.difficulty);
    this.serializer = new GameSerializer(this);
    const playerDeck =
      options.playerDeck ||
      this.cards.createDeck({ bonusCards: options.playerBonusCards });
    this.state.initialize(this.cards, {
      playerDeck,
      enemyDeck: options.enemyDeck,
      enemyName: options.enemyName,
      enemyHealth: options.enemyHealth,
    });
    this.encounter?.setup();
  }

  get players() {
    return this.state.players;
  }

  get phase() {
    return this.state.phase;
  }

  get winner() {
    return this.state.winner;
  }

  get turn() {
    return this.state.turn;
  }

  get activeSide() {
    return this.state.activeSide;
  }

  get logs() {
    return this.state.logs;
  }

  get version() {
    return this.state.version;
  }

  get aiDifficulty() {
    return this.ai.difficulty;
  }

  isCardPlayable(side, card) {
    const player = this.players[side];
    return (
      this.phase === "playing" &&
      this.activeSide === side &&
      card.cost <= player.mana &&
      (card.type !== "role" || player.board.length < RULES.boardLimit) &&
      (!card.requirements?.minFriendly ||
        player.board.length >= card.requirements.minFriendly)
    );
  }

  performAction(action, side = "player") {
    this.assertPlayingTurn(side);
    if (!action || typeof action.type !== "string") {
      throw new GameRuleError("INVALID_ACTION", "动作格式不正确。");
    }

    switch (action.type) {
      case "PLAY_CARD":
        this.playCard(side, action.cardId);
        break;
      case "ATTACK":
        this.combat.attack(side, action.attackerId, action.target);
        break;
      case "HERO_ATTACK":
        this.combat.heroAttack(side, action.target);
        break;
      case "END_TURN":
        this.endPlayerTurn();
        break;
      default:
        throw new GameRuleError("UNKNOWN_ACTION", `未知动作：${action.type}`);
    }

    this.state.version += 1;
  }

  assertPlayingTurn(side) {
    if (this.phase !== "playing") {
      throw new GameRuleError("GAME_OVER", "本局已经结束。");
    }
    if (this.activeSide !== side) {
      throw new GameRuleError("WRONG_TURN", "现在不是你的回合。");
    }
  }

  playCard(side, instanceId) {
    const player = this.players[side];
    const handIndex = player.hand.findIndex(
      (card) => card.instanceId === instanceId,
    );
    const card = player.hand[handIndex];
    if (!card) {
      throw new GameRuleError("CARD_NOT_FOUND", "这张牌已经不在手牌中。");
    }
    if (card.cost > player.mana) {
      throw new GameRuleError("NOT_ENOUGH_MANA", "戏力不足。");
    }
    if (card.type === "role" && player.board.length >= RULES.boardLimit) {
      throw new GameRuleError("BOARD_FULL", "片场已经满员。");
    }
    if (
      card.requirements?.minFriendly &&
      player.board.length < card.requirements.minFriendly
    ) {
      throw new GameRuleError(
        "REQUIREMENTS_NOT_MET",
        `至少需要 ${card.requirements.minFriendly} 个友方角色。`,
      );
    }

    player.mana -= card.cost;
    this.state.zones.removeFromHand(side, card.instanceId);
    player.cardsPlayedThisTurn += 1;
    player.cardTypesPlayedThisTurn.push(card.type);
    this.state.addLog(
      `${sideName(side)}打出 ${card.role}。`,
      side === "player" ? "player" : "enemy",
    );

    if (card.type === "role") {
      this.summonRole(side, card);
      this.effects.resolve(card.effects, { side, self: card });
    } else if (card.type === "weapon") {
      this.equipWeapon(side, card);
      this.effects.resolve(card.effects, { side, self: card });
    } else {
      this.effects.resolve(card.effects, { side, self: null });
      this.state.zones.moveToGraveyard(side, card, "spell-resolved");
    }

    this.deaths.resolve();
    this.state.checkGameOver();
  }

  summonRole(side, card) {
    card.summonedTurn = this.turn;
    if (card.keywords.includes("rush")) {
      card.attacksRemaining = 1;
      card.attackRestriction = "minions";
    }
    this.state.zones.addToBoard(side, card);
  }

  equipWeapon(side, card) {
    const player = this.players[side];
    const replaced = this.state.zones.equipWeapon(side, card);
    if (replaced) {
      this.state.addLog(`${replaced.role} 被替换。`, "weapon");
    }
    if (!player.heroAttackUsedThisTurn) player.heroAttacksRemaining = 1;
    this.state.addLog(
      `${sideName(side)}装备 ${card.role}（${card.currentAttack}/${card.currentDurability}）。`,
      "weapon",
    );
  }

  endPlayerTurn() {
    this.state.addLog("影迷结束回合，镜头转向对手。", "system");
    this.state.beginTurn("enemy", this.cards);
    if (this.phase === "playing") this.encounter?.beforeEnemyTurn();
    if (this.phase === "playing") this.ai.runTurn();
    if (this.phase === "playing") {
      this.state.turn += 1;
      this.state.beginTurn("player", this.cards);
      this.encounter?.beforePlayerTurn();
      this.state.addLog("镜头回到影迷手中。", "system");
    }
  }

  toPublicState() {
    return this.serializer.toPublicState();
  }
}

module.exports = { GameEngine };
