"use strict";

const { RULES, sideName } = require("./rules.js");

class GameState {
  constructor() {
    this.schemaVersion = 1;
    this.version = 1;
    this.phase = "playing";
    this.winner = null;
    this.turn = 1;
    this.activeSide = "player";
    this.eventCounter = 0;
    this.deferGameOver = false;
    this.logs = [];
    this.players = {};
  }

  initialize(cardFactory, options = {}) {
    this.players.player = this.createPlayer(
      options.playerName || "金像影迷",
      options.playerDeck || cardFactory.createDeck(),
      options.playerHealth || RULES.maxHealth,
    );
    this.players.enemy = this.createPlayer(
      options.enemyName || "反派制片方",
      options.enemyDeck || cardFactory.createDeck(),
      options.enemyHealth || RULES.maxHealth,
    );
    this.drawCards("player", RULES.openingHand.player, cardFactory, { silent: true });
    this.drawCards("enemy", RULES.openingHand.enemy, cardFactory, { silent: true });
    this.beginTurn("player", cardFactory, { draw: false });
    this.addLog("首幕开拍，影迷获得先手。", "system");
  }

  createPlayer(name, deck, maxHealth = RULES.maxHealth) {
    return {
      name,
      health: maxHealth,
      maxHealth,
      maxMana: 0,
      mana: 0,
      fatigue: 1,
      weapon: null,
      heroAttacksRemaining: 0,
      heroAttackUsedThisTurn: false,
      graveyard: [],
      deck,
      deckRecipe: deck.map((card) => ({
        id: card.id,
        type: card.type,
        star: card.star,
        role: card.role,
      })),
      hand: [],
      board: [],
    };
  }

  player(side) {
    return this.players[side];
  }

  addLog(message, tone = "normal") {
    this.eventCounter += 1;
    this.logs.push({
      id: this.eventCounter,
      turn: this.turn,
      message,
      tone,
    });
    this.logs = this.logs.slice(-30);
  }

  drawCards(side, amount, cardFactory, options = {}) {
    const player = this.player(side);
    for (let count = 0; count < amount; count += 1) {
      if (!player.deck.length) {
        const fatigue = player.fatigue;
        player.health -= fatigue;
        player.fatigue += 1;
        if (!options.silent) {
          this.addLog(
            `${sideName(side)}牌库见底，受到 ${fatigue} 点疲劳伤害。`,
            "damage",
          );
        }
        this.checkGameOver();
        if (this.phase === "gameOver") return;
        continue;
      }

      const card = cardFactory.createInstance(player.deck.shift());
      if (player.hand.length >= RULES.handLimit) {
        if (!options.silent) {
          this.addLog(`${sideName(side)}手牌已满，${card.role} 被弃置。`, "warning");
        }
        continue;
      }

      player.hand.push(card);
      if (!options.silent) this.addLog(`${sideName(side)}抽到一张牌。`);
    }
  }

  beginTurn(side, cardFactory, options = {}) {
    this.activeSide = side;
    const player = this.player(side);
    player.maxMana = Math.min(RULES.maxMana, player.maxMana + 1);
    player.mana = player.maxMana;
    player.heroAttackUsedThisTurn = false;
    player.heroAttacksRemaining = player.weapon ? 1 : 0;

    for (const card of player.board) {
      card.attackRestriction = null;
      if (card.skipNextReady) {
        card.attacksRemaining = 0;
        card.stunned = true;
        card.skipNextReady = false;
      } else {
        card.attacksRemaining = 1;
        card.stunned = false;
      }
    }

    if (options.draw !== false) this.drawCards(side, 1, cardFactory);
  }

  sideOfCard(target) {
    for (const side of ["player", "enemy"]) {
      if (this.player(side).board.includes(target)) return side;
    }
    return null;
  }

  takeDeadCards() {
    const fallenCards = [];
    for (const side of ["player", "enemy"]) {
      const player = this.player(side);
      const fallen = player.board.filter((card) => card.currentHealth <= 0);
      for (const card of fallen) {
        this.addLog(`${card.role} 退场。`, "damage");
        player.graveyard.push(card.id);
        fallenCards.push({ side, card });
      }
      player.board = player.board.filter((card) => card.currentHealth > 0);
    }
    return fallenCards;
  }

  cleanupBoards() {
    return this.takeDeadCards();
  }

  healHero(side, amount) {
    if (amount <= 0) return 0;
    const player = this.player(side);
    const restored = Math.min(amount, player.maxHealth - player.health);
    player.health += restored;
    return restored;
  }

  checkGameOver() {
    if (this.deferGameOver) return false;
    if (this.phase === "gameOver") return true;
    const playerDead = this.players.player.health <= 0;
    const enemyDead = this.players.enemy.health <= 0;
    if (!playerDead && !enemyDead) return false;

    this.phase = "gameOver";
    this.activeSide = null;
    if (playerDead && enemyDead) {
      this.winner = "draw";
      this.addLog("双方同时退场，本局平局。", "system");
    } else if (enemyDead) {
      this.winner = "player";
      this.addLog("影迷赢下首映。", "victory");
    } else {
      this.winner = "enemy";
      this.addLog("反派制片方拿下档期。", "defeat");
    }
    return true;
  }
}

module.exports = { GameState };
