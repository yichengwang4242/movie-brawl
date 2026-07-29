"use strict";

const { RULES, GameRuleError, otherSide, sideName } = require("./rules.js");
const { AdvancedEffectHandlers } = require("./advanced-effect-handlers.js");

class EffectResolver {
  constructor(state, cardFactory, combat, deathResolver) {
    this.state = state;
    this.cards = cardFactory;
    this.combat = combat;
    this.deaths = deathResolver;
    this.handlers = new Map([
      ["damageEnemyHero", this.damageEnemyHero.bind(this)],
      ["damageRandomEnemy", this.damageRandomEnemy.bind(this)],
      ["damageAllEnemies", this.damageAllEnemies.bind(this)],
      ["damageWeakestEnemyMinion", this.damageWeakestEnemyMinion.bind(this)],
      ["draw", this.draw.bind(this)],
      ["healHero", this.healHero.bind(this)],
      ["buffSelf", this.buffSelf.bind(this)],
      ["buffRandomFriendly", this.buffRandomFriendly.bind(this)],
      ["buffAllFriendly", this.buffAllFriendly.bind(this)],
      ["weakenAllEnemies", this.weakenAllEnemies.bind(this)],
      ["weakenRandomEnemy", this.weakenRandomEnemy.bind(this)],
      ["gainTempMana", this.gainTempMana.bind(this)],
      ["summon", this.summon.bind(this)],
      ["shieldAllFriendly", this.shieldAllFriendly.bind(this)],
      ["shieldRandomFriendly", this.shieldRandomFriendly.bind(this)],
      ["rushRandomFriendly", this.rushRandomFriendly.bind(this)],
      ["rushAllFriendly", this.rushAllFriendly.bind(this)],
      ["stunRandomEnemy", this.stunRandomEnemy.bind(this)],
      ["addRandomNeutral", this.addRandomNeutral.bind(this)],
    ]);
    const advanced = new AdvancedEffectHandlers(state, cardFactory);
    for (const [type, handler] of advanced.registry()) {
      this.handlers.set(type, handler);
    }
  }

  resolve(effects, context, options = {}) {
    for (const effect of effects) {
      const handler = this.handlers.get(effect.type);
      if (!handler) {
        throw new GameRuleError(
          "UNKNOWN_EFFECT",
          `尚未支持技能效果：${effect.type}`,
        );
      }
      handler(effect, context);
      if (!options.deferDeaths) this.deaths.resolve();
      this.state.checkGameOver();
      if (this.state.phase === "gameOver") return;
    }
  }

  buff(card, attack = 0, health = 0) {
    card.currentAttack = Math.max(0, card.currentAttack + attack);
    card.maxHealth = Math.max(1, card.maxHealth + health);
    card.currentHealth = Math.max(1, card.currentHealth + health);
  }

  randomFriendly(side) {
    return this.cards.random.item(this.state.player(side).board);
  }

  randomEnemy(side) {
    return this.cards.random.item(this.state.player(otherSide(side)).board);
  }

  damageEnemyHero(effect, context) {
    this.combat.damageHero(
      otherSide(context.side),
      effect.amount,
      context.self,
      context.side,
    );
  }

  damageRandomEnemy(effect, context) {
    const opponentSide = otherSide(context.side);
    const opponent = this.state.player(opponentSide);
    const target = this.cards.random.item([...opponent.board, "hero"]);
    if (target === "hero") {
      this.combat.damageHero(
        opponentSide,
        effect.amount,
        context.self,
        context.side,
      );
    } else {
      this.combat.damageMinion(
        target,
        effect.amount,
        context.self,
        context.side,
      );
    }
  }

  damageAllEnemies(effect, context) {
    const board = [...this.state.player(otherSide(context.side)).board];
    for (const target of board) {
      this.combat.damageMinion(
        target,
        effect.amount,
        context.self,
        context.side,
      );
    }
  }

  damageWeakestEnemyMinion(effect, context) {
    const opponentSide = otherSide(context.side);
    const board = this.state.player(opponentSide).board;
    if (!board.length) {
      this.combat.damageHero(
        opponentSide,
        effect.amount,
        context.self,
        context.side,
      );
      return;
    }
    const target = [...board].sort(
      (left, right) =>
        left.currentHealth - right.currentHealth ||
        right.currentAttack - left.currentAttack,
    )[0];
    this.combat.damageMinion(
      target,
      effect.amount,
      context.self,
      context.side,
    );
  }

  draw(effect, context) {
    this.state.drawCards(context.side, effect.amount, this.cards);
  }

  healHero(effect, context) {
    const restored = this.state.healHero(context.side, effect.amount);
    if (restored > 0) {
      this.state.addLog(
        `${sideName(context.side)}恢复 ${restored} 点生命。`,
        "heal",
      );
    }
  }

  buffSelf(effect, context) {
    if (context.self) this.buff(context.self, effect.attack, effect.health);
  }

  buffRandomFriendly(effect, context) {
    const target = this.randomFriendly(context.side);
    if (!target) return;
    this.buff(target, effect.attack, effect.health);
    this.state.addLog(
      `${target.role} 获得 +${effect.attack || 0}/+${effect.health || 0}。`,
      "buff",
    );
  }

  buffAllFriendly(effect, context) {
    for (const target of this.state.player(context.side).board) {
      this.buff(target, effect.attack, effect.health);
    }
  }

  weakenAllEnemies(effect, context) {
    for (const target of this.state.player(otherSide(context.side)).board) {
      target.currentAttack = Math.max(0, target.currentAttack - effect.amount);
    }
  }

  weakenRandomEnemy(effect, context) {
    const target = this.randomEnemy(context.side);
    if (!target) return;
    target.currentAttack = Math.max(0, target.currentAttack - effect.amount);
    this.state.addLog(
      `${target.role} 的攻击降低 ${effect.amount}。`,
      "debuff",
    );
  }

  gainTempMana(effect, context) {
    const owner = this.state.player(context.side);
    const gained = Math.min(effect.amount, RULES.maxMana - owner.mana);
    owner.mana += gained;
    if (gained > 0) {
      this.state.addLog(
        `${sideName(context.side)}获得 ${gained} 点临时戏力。`,
        "mana",
      );
    }
  }

  summon(effect, context) {
    const owner = this.state.player(context.side);
    for (let count = 0; count < effect.amount; count += 1) {
      if (owner.board.length >= RULES.boardLimit) return;
      const token = this.cards.createToken(effect.token);
      token.summonedTurn = this.state.turn;
      if (token.keywords.includes("rush")) {
        token.attacksRemaining = 1;
        token.attackRestriction = "minions";
      }
      owner.board.push(token);
      this.state.addLog(
        `${sideName(context.side)}召唤了 ${token.role}。`,
        "summon",
      );
    }
  }

  shieldAllFriendly(effect, context) {
    for (const target of this.state.player(context.side).board) {
      target.shield = true;
    }
  }

  shieldRandomFriendly(effect, context) {
    const target = this.randomFriendly(context.side);
    if (!target) return;
    target.shield = true;
    this.state.addLog(`${target.role} 获得护盾。`, "shield");
  }

  grantRush(target) {
    target.keywords = [...new Set([...target.keywords, "rush"])];
    if (target.summonedTurn === this.state.turn) {
      target.attacksRemaining = Math.max(target.attacksRemaining, 1);
      target.attackRestriction = "minions";
    }
  }

  rushRandomFriendly(effect, context) {
    const target = this.randomFriendly(context.side);
    if (!target) return;
    this.grantRush(target);
    this.state.addLog(`${target.role} 获得疾冲。`, "buff");
  }

  rushAllFriendly(effect, context) {
    for (const target of this.state.player(context.side).board) {
      this.grantRush(target);
    }
  }

  stunRandomEnemy(effect, context) {
    const target = this.randomEnemy(context.side);
    if (!target) return;
    target.skipNextReady = true;
    target.attacksRemaining = 0;
    target.stunned = true;
    this.state.addLog(`${target.role} 被导演喊卡。`, "debuff");
  }

  addRandomNeutral(effect, context) {
    const owner = this.state.player(context.side);
    for (let count = 0; count < (effect.amount || 1); count += 1) {
      if (owner.hand.length >= RULES.handLimit) return;
      owner.hand.push(this.cards.createRandomNeutral());
      this.state.addLog(`${sideName(context.side)}获得一张通用卡。`);
    }
  }
}

module.exports = { EffectResolver };
