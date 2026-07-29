(function (root, factory) {
  const LogTranslator = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = { LogTranslator };
  }
  if (root) root.MOVIE_BRAWL_LOG_TRANSLATOR = { LogTranslator };
})(typeof window !== "undefined" ? window : null, function () {
  const EXACT_EN = {
    "首幕开拍，影迷获得先手。": "The opening scene begins. The Movie Fan goes first.",
    "影迷结束回合，镜头转向对手。":
      "The Movie Fan ends the turn. The camera moves to the opponent.",
    "镜头回到影迷手中。": "The camera returns to the Movie Fan.",
    "双方同时退场，本局平局。": "Both sides fall at once. The match is a draw.",
    "影迷赢下首映。": "The Movie Fan wins the premiere.",
    "反派制片方拿下档期。": "The Villainous Producer takes the release slot.",
    "索命印记落下。": "The Marked for Death effect strikes.",
    "方刚进入断臂觉醒。": "Fang Gang enters One-Armed Awakening.",
    "腕力房训练：敌方角色获得 +0/+1。":
      "Strength Chamber: enemy characters gain +0/+1.",
    "兵器房训练：头目抽牌并获得 1 点临时戏力。":
      "Weapons Chamber: the boss draws a card and gains 1 temporary Film Power.",
  };

  class LogTranslator {
    constructor(i18n) {
      this.i18n = i18n;
    }

    translate(message) {
      if (this.i18n.locale !== "en" || !message) return message;
      if (EXACT_EN[message]) return EXACT_EN[message];

      const patterns = [
        [/^场地规则：(.+)。$/, (value) => `Encounter rule: ${this.i18n.adventureValue(value)}.`],
        [/^(.+) 为(影迷|反派制片方)恢复 (\d+) 点生命。$/, (role, side, amount) =>
          `${this.i18n.entity(role)} restores ${amount} Health to the ${this.i18n.entity(side)}.`],
        [/^(.+) 的护盾挡下了伤害。$/, (role) =>
          `${this.i18n.entity(role)}'s Shield blocks the damage.`],
        [/^(.+) 反弹 (\d+) 点伤害。$/, (role, amount) =>
          `${this.i18n.entity(role)} retaliates for ${amount} damage.`],
        [/^(影迷|反派制片方)英雄受到 (\d+) 点伤害。$/, (side, amount) =>
          `${this.i18n.entity(`${side}英雄`)} takes ${amount} damage.`],
        [/^(.+) 直接攻击(影迷|反派制片方)英雄。$/, (role, side) =>
          `${this.i18n.entity(role)} attacks the ${this.i18n.entity(`${side}英雄`)}.`],
        [/^(.+) 与 (.+) 交战。$/, (left, right) =>
          `${this.i18n.entity(left)} battles ${this.i18n.entity(right)}.`],
        [/^(影迷|反派制片方)使用 (.+) 攻击敌方英雄。$/, (side, weapon) =>
          `The ${this.i18n.entity(side)} attacks the enemy hero with ${this.i18n.entity(weapon)}.`],
        [/^(影迷|反派制片方)使用 (.+) 攻击 (.+)。$/, (side, weapon, target) =>
          `The ${this.i18n.entity(side)} attacks ${this.i18n.entity(target)} with ${this.i18n.entity(weapon)}.`],
        [/^(.+) 耐久耗尽。$/, (role) =>
          `${this.i18n.entity(role)} runs out of Durability.`],
        [/^(影迷|反派制片方)恢复 (\d+) 点生命。$/, (side, amount) =>
          `The ${this.i18n.entity(side)} restores ${amount} Health.`],
        [/^(.+) 获得 \+(\d+)\/\+(\d+)。$/, (role, attack, health) =>
          `${this.i18n.entity(role)} gains +${attack}/+${health}.`],
        [/^(.+) 的攻击降低 (\d+)。$/, (role, amount) =>
          `${this.i18n.entity(role)} loses ${amount} Attack.`],
        [/^(影迷|反派制片方)获得 (\d+) 点临时戏力。$/, (side, amount) =>
          `The ${this.i18n.entity(side)} gains ${amount} temporary Film Power.`],
        [/^(影迷|反派制片方)召唤了 (.+)。$/, (side, role) =>
          `The ${this.i18n.entity(side)} summons ${this.i18n.entity(role)}.`],
        [/^(.+) 获得护盾。$/, (role) =>
          `${this.i18n.entity(role)} gains Shield.`],
        [/^(.+) 获得疾冲。$/, (role) =>
          `${this.i18n.entity(role)} gains Rush.`],
        [/^(.+) 被导演喊卡。$/, (role) =>
          `${this.i18n.entity(role)} is stopped by the director.`],
        [/^(影迷|反派制片方)获得一张通用卡。$/, (side) =>
          `The ${this.i18n.entity(side)} gains a Neutral card.`],
        [/^(.+) 的亡语触发。$/, (role) =>
          `${this.i18n.entity(role)}'s Deathrattle triggers.`],
        [/^(影迷|反派制片方)打出 (.+)。$/, (side, role) =>
          `The ${this.i18n.entity(side)} plays ${this.i18n.entity(role)}.`],
        [/^(.+) 被替换。$/, (role) =>
          `${this.i18n.entity(role)} is replaced.`],
        [/^(影迷|反派制片方)装备 (.+)（(\d+)\/(\d+)）。$/, (side, role, attack, durability) =>
          `The ${this.i18n.entity(side)} equips ${this.i18n.entity(role)} (${attack}/${durability}).`],
        [/^(影迷|反派制片方)牌库见底，受到 (\d+) 点疲劳伤害。$/, (side, amount) =>
          `The ${this.i18n.entity(side)}'s deck is empty and takes ${amount} Fatigue damage.`],
        [/^(影迷|反派制片方)手牌已满，(.+) 被弃置。$/, (side, role) =>
          `The ${this.i18n.entity(side)}'s hand is full. ${this.i18n.entity(role)} is discarded.`],
        [/^(影迷|反派制片方)抽到一张牌。$/, (side) =>
          `The ${this.i18n.entity(side)} draws a card.`],
        [/^(.+) 退场。$/, (role) =>
          `${this.i18n.entity(role)} leaves the board.`],
        [/^(.+) 获得反伤 (\d+)。$/, (role, amount) =>
          `${this.i18n.entity(role)} gains Retaliate ${amount}.`],
        [/^(.+) 获得新的亡语。$/, (role) =>
          `${this.i18n.entity(role)} gains a new Deathrattle.`],
        [/^(.+) 获得燕影护身。$/, (role) =>
          `${this.i18n.entity(role)} gains Swallow Shadow protection.`],
        [/^(.+) 进入五毒阵位。$/, (role) =>
          `${this.i18n.entity(role)} takes a place in the Five Venoms Formation.`],
        [/^(.+) 通过金臂横练获得 \+1 攻击。$/, (role) =>
          `${this.i18n.entity(role)} gains +1 Attack from Golden Arm Training.`],
        [/^白莲法坛恢复 (\d+) 点生命。$/, (amount) =>
          `The White Lotus Altar restores ${amount} Health.`],
      ];

      for (const [pattern, formatter] of patterns) {
        const match = message.match(pattern);
        if (match) return formatter(...match.slice(1));
      }

      const fusion = message.match(/^(.+)融合为 (.+)。$/);
      if (fusion) {
        const ingredients = fusion[1]
          .split("与")
          .map((name) => this.i18n.entity(name))
          .join(" and ");
        return `${ingredients} fuse into ${this.i18n.entity(fusion[2])}.`;
      }

      return message;
    }
  }

  return LogTranslator;
});
