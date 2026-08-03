"use strict";

class MilkywayImageEncounterRules {
  static mechanics = [
    "branchingFate",
    "macauDeadlock",
    "seventyTwoHours",
    "bodyguardFormation",
    "lostGunSearch",
    "electionNight",
    "exiledCountdown",
    "sevenPersonalities",
  ];

  constructor(encounter) {
    this.encounter = encounter;
  }

  handle(mechanic) {
    if (!MilkywayImageEncounterRules.mechanics.includes(mechanic)) return false;
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

  strongest(side) {
    return [...this.engine.players[side].board].sort(
      (left, right) => right.currentAttack - left.currentAttack,
    )[0];
  }

  weakest(side) {
    return [...this.engine.players[side].board].sort(
      (left, right) => left.currentHealth - right.currentHealth,
    )[0];
  }

  branchingFate() {
    if (this.engine.turn % 2 !== 0) {
      this.summon("江湖路人", 1, 1, "路");
      this.engine.state.addLog("命运岔路出现一名江湖路人。", "encounter");
      return;
    }
    const target = this.random("enemy");
    if (!target) {
      this.engine.combat.damageHero("player", 1, null, "enemy");
      this.engine.state.addLog("无人选择岔路，我方英雄受到 1 点伤害。", "encounter");
      return;
    }
    target.currentAttack += 1;
    target.maxHealth += 1;
    target.currentHealth += 1;
    this.engine.state.addLog(`${target.role}选定江湖路，获得 +1/+1。`, "encounter");
  }

  macauDeadlock() {
    const target = this.random("player");
    if (!target) {
      this.engine.combat.damageHero("player", 1, null, "enemy");
      this.engine.state.addLog("澳门死局逼近，我方英雄受到 1 点伤害。", "encounter");
      return;
    }
    target.skipNextReady = true;
    target.attacksRemaining = 0;
    target.stunned = true;
    this.engine.state.addLog(`${target.role}被暗花死局锁住。`, "encounter");
  }

  seventyTwoHours() {
    const beat = (this.engine.turn - 1) % 3;
    if (beat === 0) {
      this.engine.state.drawCards("enemy", 1, this.engine.cards);
      this.engine.state.addLog("倒计时 72 小时：头目抽 1 张牌。", "encounter");
      return;
    }
    if (beat === 1) {
      const target = this.strongest("player");
      if (target) {
        target.currentAttack = Math.max(0, target.currentAttack - 1);
        this.engine.state.addLog(`${target.role}被谈判拖延，失去 1 攻击。`, "encounter");
      } else {
        this.engine.state.addLog("倒计时继续推进。", "encounter");
      }
      return;
    }
    this.engine.combat.damageHero("player", 1, null, "enemy");
    this.engine.state.addLog("倒计时归零，我方英雄受到 1 点伤害。", "encounter");
  }

  bodyguardFormation() {
    const board = this.engine.players.enemy.board;
    if (board.length < 3) this.summon("静默保镖", 1, 2, "保");
    if (board.length < 3 || this.encounter.triggered.has("bodyguardFormation")) {
      return;
    }
    this.encounter.triggered.add("bodyguardFormation");
    for (const target of board) target.currentAttack += 1;
    this.engine.state.addLog("静默保镖阵就位，敌方全体获得 +1 攻击。", "encounter");
  }

  lostGunSearch() {
    if (this.engine.turn % 2 !== 0) {
      if (this.engine.players.enemy.board.length < 2) {
        this.summon("PTU警员", 1, 1, "警");
        this.engine.state.addLog("失枪搜索线补入一名 PTU 警员。", "encounter");
      }
      return;
    }
    const target = this.strongest("player");
    if (!target) {
      this.engine.combat.damageHero("player", 1, null, "enemy");
      this.engine.state.addLog("搜索线收紧，我方英雄受到 1 点伤害。", "encounter");
      return;
    }
    target.currentAttack = Math.max(0, target.currentAttack - 1);
    this.engine.state.addLog(`${target.role}接受盘查，失去 1 攻击。`, "encounter");
  }

  electionNight() {
    const beat = (this.engine.turn - 1) % 3;
    if (beat === 0) {
      this.engine.state.drawCards("enemy", 1, this.engine.cards);
      this.engine.state.addLog("拉票阶段：头目抽 1 张牌。", "encounter");
      return;
    }
    if (beat === 1) {
      let target = this.random("enemy");
      if (!target) {
        this.summon("社团护票", 1, 2, "票");
        target = this.engine.players.enemy.board.at(-1);
      }
      if (target) target.shield = true;
      this.engine.state.addLog(`${target?.role || "护票队"}守住票箱，获得护盾。`, "encounter");
      return;
    }
    for (const target of this.engine.players.enemy.board) {
      target.currentAttack += 1;
    }
    this.engine.state.addLog("选举定局，敌方全体获得 +1 攻击。", "encounter");
  }

  exiledCountdown() {
    const enemy = this.engine.players.enemy;
    if (enemy.health > 18 || this.encounter.triggered.has("exiledCountdown")) {
      return;
    }
    this.encounter.triggered.add("exiledCountdown");
    this.summon("追兵", 2, 1, "追", ["rush"]);
    this.summon("追兵", 2, 1, "追", ["rush"]);
    this.engine.state.addLog("放逐倒计时触发，两名疾冲追兵入场。", "encounter");
  }

  sevenPersonalities() {
    const beat = (this.engine.turn - 1) % 3;
    if (beat === 0) {
      this.summon("进取人格", 2, 2, "进", ["rush"]);
      this.engine.state.addLog("进取人格现身并获得疾冲。", "encounter");
      return;
    }
    if (beat === 1) {
      const restored = this.engine.state.healHero("enemy", 1);
      let target = this.random("enemy");
      if (!target) {
        this.summon("恐惧人格", 1, 2, "惧");
        target = this.engine.players.enemy.board.at(-1);
      }
      if (target) target.shield = true;
      this.engine.state.addLog(
        `恐惧人格退守，头目恢复 ${restored} 点生命并获得护盾。`,
        "encounter",
      );
      return;
    }
    const target = this.weakest("player");
    if (target) this.engine.combat.damageMinion(target, 2, null, "enemy");
    else this.engine.combat.damageHero("player", 1, null, "enemy");
    this.engine.state.addLog("贪念人格锁定我方最脆弱的位置。", "encounter");
  }
}

module.exports = { MilkywayImageEncounterRules };
