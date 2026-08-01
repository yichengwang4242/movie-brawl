"use strict";

class DandBEncounterRules {
  static mechanics = [
    "pomPomShift",
    "lotteryCycle",
    "microfilmCase",
    "streetReality",
    "chinatownSupport",
    "internationalUnit",
    "lastVictoryDebt",
    "wartimeDawn",
  ];

  constructor(encounter) {
    this.encounter = encounter;
  }

  handle(mechanic) {
    if (!DandBEncounterRules.mechanics.includes(mechanic)) return false;
    this[mechanic]();
    return true;
  }

  get engine() {
    return this.encounter.engine;
  }

  summon(role, attack, health, motif, keywords = []) {
    this.encounter.summon(role, attack, health, motif, keywords);
  }

  pomPomShift() {
    const board = this.engine.players.enemy.board;
    if (this.engine.turn % 2 !== 0) {
      if (board.length < 2) this.summon("巡逻警员", 1, 1, "巡");
      return;
    }
    const target = this.engine.cards.random.item(board);
    if (!target) {
      this.summon("巡逻警员", 1, 1, "巡");
      return;
    }
    target.currentAttack += 1;
    this.engine.state.addLog(`${target.role}完成警署轮班，获得 +1 攻击。`, "encounter");
  }

  lotteryCycle() {
    const beat = (this.engine.turn - 1) % 3;
    if (beat === 0) {
      this.engine.state.drawCards("enemy", 1, this.engine.cards);
      this.engine.state.addLog("横财入袋：头目抽 1 张牌。", "encounter");
      return;
    }
    if (beat === 1) {
      const target = this.engine.cards.random.item(this.engine.players.enemy.board);
      if (target) {
        target.maxHealth += 1;
        target.currentHealth += 1;
        this.engine.state.addLog(`${target.role}守住家当，获得 +0/+1。`, "encounter");
      }
      return;
    }
    this.engine.combat.damageHero("player", 1, null, "enemy");
    this.engine.state.addLog("横财烦恼波及我方英雄。", "encounter");
  }

  microfilmCase() {
    const enemy = this.engine.players.enemy;
    const player = this.engine.players.player;
    if (enemy.board.length <= player.board.length) {
      this.summon("皇家探员", 2, 1, "探", ["rush"]);
      return;
    }
    const target = this.engine.cards.random.item(player.board);
    if (target) {
      target.skipNextReady = true;
      target.attacksRemaining = 0;
      target.stunned = true;
      this.engine.state.addLog(`${target.role}被证物争夺拖住。`, "encounter");
    }
  }

  streetReality() {
    if (this.engine.turn % 2 !== 0) return;
    for (const side of ["player", "enemy"]) {
      const target = [...this.engine.players[side].board].sort(
        (left, right) => left.currentHealth - right.currentHealth,
      )[0];
      if (target) this.engine.combat.damageMinion(target, 1, null, "enemy");
    }
    if (!this.engine.players.player.board.length) {
      this.engine.combat.damageHero("player", 1, null, "enemy");
    }
    this.engine.state.addLog("街头现实压向双方最脆弱的角色。", "encounter");
  }

  chinatownSupport() {
    const board = this.engine.players.enemy.board;
    if (!board.length) {
      this.summon("唐人街邻里", 1, 2, "邻");
      return;
    }
    if (board.length === 1) {
      board[0].currentAttack += 1;
      board[0].maxHealth += 1;
      board[0].currentHealth += 1;
      this.engine.state.addLog(`${board[0].role}得到异乡照应，获得 +1/+1。`, "encounter");
      return;
    }
    const restored = this.engine.state.healHero("enemy", 1);
    if (restored) this.engine.state.addLog(`唐人街邻里为头目恢复 ${restored} 点生命。`, "encounter");
  }

  internationalUnit() {
    const beat = (this.engine.turn - 1) % 3;
    if (beat === 0) {
      this.summon("国际动作队员", 2, 1, "动", ["rush"]);
      return;
    }
    if (beat === 1) {
      const target = this.engine.cards.random.item(this.engine.players.enemy.board);
      if (target) {
        target.shield = true;
        this.engine.state.addLog(`${target.role}获得专业护具。`, "encounter");
      }
      return;
    }
    for (const target of [...this.engine.players.player.board]) {
      this.engine.combat.damageMinion(target, 1, null, "enemy");
    }
    this.engine.state.addLog("国际动作组完成全场爆破。", "encounter");
  }

  lastVictoryDebt() {
    const enemy = this.engine.players.enemy;
    if (enemy.health > 18 || this.encounter.triggered.has("lastVictoryDebt")) return;
    this.encounter.triggered.add("lastVictoryDebt");
    this.engine.state.drawCards("enemy", 2, this.engine.cards);
    for (const target of enemy.board) target.currentAttack += 1;
    this.engine.state.addLog("欠账追数：头目抽 2 张牌，敌方全体获得 +1 攻击。", "encounter");
  }

  wartimeDawn() {
    const beat = (this.engine.turn - 1) % 3;
    if (beat === 0) {
      this.summon("黎明守望者", 2, 2, "黎", ["taunt"]);
      return;
    }
    if (beat === 1) {
      for (const side of ["player", "enemy"]) {
        for (const target of [...this.engine.players[side].board]) {
          this.engine.combat.damageMinion(target, 1, null, "enemy");
        }
      }
      this.engine.state.addLog("空袭掠过街区，双方阵容受到 1 点伤害。", "encounter");
      return;
    }
    this.engine.state.drawCards("enemy", 1, this.engine.cards);
    const restored = this.engine.state.healHero("enemy", 1);
    this.engine.state.addLog(`战时补给：头目抽牌并恢复 ${restored} 点生命。`, "encounter");
  }
}

module.exports = { DandBEncounterRules };
