"use strict";

class GoldenPrincessEncounterRules {
  static mechanics = [
    "ghostLanternProgramme",
    "churchCrossfire",
    "killerContract",
    "finalLap",
    "sunsetConvoy",
    "scoreDuel",
    "midnightRun",
    "midnightDoubleBill",
  ];

  constructor(encounter) {
    this.encounter = encounter;
  }

  handle(mechanic) {
    if (!GoldenPrincessEncounterRules.mechanics.includes(mechanic)) return false;
    this[mechanic]();
    return true;
  }

  get engine() {
    return this.encounter.engine;
  }

  summon(role, attack, health, motif, keywords = []) {
    this.encounter.summon(role, attack, health, motif, keywords);
  }

  random(side) {
    return this.engine.cards.random.item(this.engine.players[side].board);
  }

  ghostLanternProgramme() {
    if (this.engine.turn % 2 !== 0) {
      this.summon("兰若幽灯", 1, 1, "灯");
      return;
    }
    const target = this.random("player");
    if (!target) {
      this.engine.combat.damageHero("player", 1, null, "enemy");
      return;
    }
    target.currentAttack = Math.max(0, target.currentAttack - 1);
    this.engine.state.addLog(`${target.role}被幽灯迷引，失去 1 攻击。`, "encounter");
  }

  churchCrossfire() {
    const enemy = this.engine.players.enemy;
    const player = this.engine.players.player;
    if (enemy.board.length <= player.board.length) {
      this.summon("持枪杀手", 2, 1, "杀", ["rush"]);
      return;
    }
    const target = [...player.board].sort(
      (left, right) => left.currentHealth - right.currentHealth,
    )[0];
    if (target) this.engine.combat.damageMinion(target, 1, null, "enemy");
    else this.engine.combat.damageHero("player", 1, null, "enemy");
    this.engine.state.addLog("教堂交火锁定我方最脆弱的位置。", "encounter");
  }

  killerContract() {
    if (this.engine.turn % 2 !== 0) {
      const target = [...this.engine.players.player.board].sort(
        (left, right) => right.currentAttack - left.currentAttack,
      )[0];
      if (target) {
        target.skipNextReady = true;
        target.attacksRemaining = 0;
        target.stunned = true;
        this.engine.state.addLog(`${target.role}被杀手合约锁定。`, "encounter");
      }
      return;
    }
    for (const target of [...this.engine.players.player.board]) {
      this.engine.combat.damageMinion(target, 1, null, "enemy");
    }
    if (!this.engine.players.player.board.length) {
      this.engine.combat.damageHero("player", 1, null, "enemy");
    }
    this.engine.state.addLog("杀手合约进入清场阶段。", "encounter");
  }

  finalLap() {
    if (this.engine.turn % 2 !== 0) return;
    const target = [...this.engine.players.enemy.board].sort(
      (left, right) => left.currentHealth - right.currentHealth,
    )[0];
    if (!target) {
      this.summon("赛道学徒", 1, 2, "赛");
      return;
    }
    target.currentAttack += 1;
    target.maxHealth += 1;
    target.currentHealth += 1;
    this.engine.state.addLog(`${target.role}冲进决胜圈，获得 +1/+1。`, "encounter");
  }

  sunsetConvoy() {
    const enemy = this.engine.players.enemy;
    if (enemy.health > 18 || this.encounter.triggered.has("sunsetConvoy")) return;
    this.encounter.triggered.add("sunsetConvoy");
    this.engine.effects.resolve([{
      type: "summon", amount: 1,
      token: { role: "逃生同伴", attack: 2, health: 2, motif: "逃" },
    }], { side: "enemy", self: null });
    const weapon = this.engine.cards.createInstance({
      id: "boss-weapon-border-pistol",
      type: "weapon",
      star: "头目",
      role: "越境手枪",
      movie: "英雄本色III夕阳之歌",
      cost: 0,
      attack: 3,
      health: 0,
      durability: 2,
      motif: "枪",
      palette: "amber",
      text: "仅限头目关卡。",
      keywords: [],
      effects: [],
      deathEffects: [],
    });
    this.engine.equipWeapon("enemy", weapon);
    this.engine.state.addLog("夕阳车队开火，逃生同伴入场。", "encounter");
  }

  scoreDuel() {
    const target = this.random("enemy");
    if (!target) {
      this.summon("曲谱剑客", 2, 1, "曲");
      return;
    }
    if (this.engine.turn % 2 !== 0) {
      target.shield = true;
      this.engine.state.addLog(`${target.role}听琴定神，获得护盾。`, "encounter");
      return;
    }
    target.currentAttack += 1;
    this.engine.state.addLog(`${target.role}以剑和曲，获得 +1 攻击。`, "encounter");
  }

  midnightRun() {
    if (this.engine.turn % 2 !== 0) {
      this.summon("午夜摩托手", 2, 1, "车", ["rush"]);
      return;
    }
    this.engine.combat.damageHero("player", 1, null, "enemy");
    this.engine.combat.damageHero("enemy", 1, null, "enemy");
    this.engine.state.addLog("午夜档期进入倒计时，双方英雄受到 1 点伤害。", "encounter");
  }

  midnightDoubleBill() {
    const beat = (this.engine.turn - 1) % 3;
    if (beat === 0) {
      this.summon("子夜重案警员", 2, 1, "警", ["rush"]);
      this.engine.state.drawCards("enemy", 1, this.engine.cards);
      this.engine.state.addLog("首映场：重案警员入场，头目抽牌。", "encounter");
      return;
    }
    if (beat === 1) {
      const restored = this.engine.state.healHero("enemy", 1);
      const target = this.random("enemy");
      if (target) target.shield = true;
      this.engine.state.addLog(`中场休整：头目恢复 ${restored} 点生命，并为角色补上护盾。`, "encounter");
      return;
    }
    for (const target of [...this.engine.players.player.board]) {
      this.engine.combat.damageMinion(target, 1, null, "enemy");
    }
    if (!this.engine.players.player.board.length) {
      this.engine.combat.damageHero("player", 1, null, "enemy");
    }
    this.engine.state.addLog("子夜场开火，我方阵容受到 1 点伤害。", "encounter");
  }
}

module.exports = { GoldenPrincessEncounterRules };
