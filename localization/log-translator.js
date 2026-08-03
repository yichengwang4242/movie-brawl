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
    "纸扎法坛映出新的替身。": "The paper altar conjures another effigy.",
    "钟楼敲响，追逐进入险段。": "The clock tower rings as the chase turns dangerous.",
    "商场特技启动：敌方全体获得 +1 攻击。":
      "Mall Stunt: all enemy characters gain +1 Attack.",
    "丛林交叉火力发动。": "Jungle crossfire erupts.",
    "猛攻式：我方全体角色受到 1 点伤害。":
      "Assault Form: all friendly characters take 1 damage.",
    "青春愿望补上一张牌。": "A youthful wish adds another card.",
    "三线会师：敌方全体获得 +1 攻击。":
      "Three-Way Convergence: all enemy characters gain +1 Attack.",
    "卧底暗号直指我方英雄。": "The undercover signal points straight at your hero.",
    "兄弟接应：头目抽牌并获得 1 点临时戏力。":
      "Brotherhood Backup: the boss draws a card and gains 1 temporary Film Power.",
    "英雄本色：敌方全体获得 +1 攻击。":
      "A Better Brotherhood: all enemy characters gain +1 Attack.",
    "横财入袋：头目抽 1 张牌。":
      "Windfall: the boss draws 1 card.",
    "横财烦恼波及我方英雄。":
      "Windfall Trouble spills over and damages your hero.",
    "街头现实压向双方最脆弱的角色。":
      "Street Reality bears down on each side's most vulnerable character.",
    "国际动作组完成全场爆破。":
      "The International Action Unit completes a full-board blast.",
    "欠账追数：头目抽 2 张牌，敌方全体获得 +1 攻击。":
      "Debt Collection: the boss draws 2 cards and all enemy characters gain +1 Attack.",
    "空袭掠过街区，双方阵容受到 1 点伤害。":
      "An air raid crosses the district. Both boards take 1 damage.",
    "教堂交火锁定我方最脆弱的位置。":
      "Church crossfire locks onto your most vulnerable position.",
    "杀手合约进入清场阶段。":
      "The Killer's Contract enters its clearing phase.",
    "夕阳车队开火，逃生同伴入场。":
      "The Sunset Convoy opens fire and an Escape Companion enters.",
    "午夜档期进入倒计时，双方英雄受到 1 点伤害。":
      "The Midnight Slot counts down. Both heroes take 1 damage.",
    "首映场：重案警员入场，头目抽牌。":
      "Premiere: a Midnight Detective enters and the boss draws a card.",
    "子夜场开火，我方阵容受到 1 点伤害。":
      "The Midnight Show opens fire. Your board takes 1 damage.",
    "命运岔路出现一名江湖路人。":
      "A drifter appears at the fork in fate.",
    "无人选择岔路，我方英雄受到 1 点伤害。":
      "No one takes the fork. Your hero takes 1 damage.",
    "澳门死局逼近，我方英雄受到 1 点伤害。":
      "The Macau deadlock closes in. Your hero takes 1 damage.",
    "倒计时 72 小时：头目抽 1 张牌。":
      "72-hour countdown: the boss draws 1 card.",
    "倒计时继续推进。": "The countdown continues.",
    "倒计时归零，我方英雄受到 1 点伤害。":
      "The countdown expires. Your hero takes 1 damage.",
    "静默保镖阵就位，敌方全体获得 +1 攻击。":
      "The silent bodyguard formation locks in. All enemy characters gain +1 Attack.",
    "失枪搜索线补入一名 PTU 警员。":
      "A PTU Officer joins the lost-gun search line.",
    "搜索线收紧，我方英雄受到 1 点伤害。":
      "The search line tightens. Your hero takes 1 damage.",
    "拉票阶段：头目抽 1 张牌。":
      "Canvassing: the boss draws 1 card.",
    "选举定局，敌方全体获得 +1 攻击。":
      "The election is settled. All enemy characters gain +1 Attack.",
    "放逐倒计时触发，两名疾冲追兵入场。":
      "The exile countdown triggers. Two Rush Pursuers enter.",
    "进取人格现身并获得疾冲。":
      "The Aggressive Persona appears with Rush.",
    "贪念人格锁定我方最脆弱的位置。":
      "The Greedy Persona targets your most vulnerable position.",
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
        [/^(.+) 借铁布衫架势获得 \+0\/\+1。$/, (role) =>
          `${this.i18n.entity(role)} gains +0/+1 from Iron Shirt Stance.`],
        [/^(.+) 借醒狮抢青获得 \+1 攻击。$/, (role) =>
          `${this.i18n.entity(role)} gains +1 Attack from the Lion Dance.`],
        [/^(.+) 进入截击架势。$/, (role) =>
          `${this.i18n.entity(role)} enters Intercept Form.`],
        [/^(.+)触发连拍。$/, (role) =>
          `${this.i18n.entity(role)} triggers Combo.`],
        [/^(.+)完成持械特技。$/, (role) =>
          `${this.i18n.entity(role)} completes an armed Stunt.`],
        [/^(.+)触发拍档。$/, (role) =>
          `${this.i18n.entity(role)} triggers Partner.`],
        [/^(.+)触发剧情反转。$/, (role) =>
          `${this.i18n.entity(role)} triggers Comeback.`],
        [/^(.+)转场回到手牌，费用降低 (\d+)。$/, (role, amount) =>
          `${this.i18n.entity(role)} returns to hand and costs ${amount} less.`],
        [/^(.+)转场回到手牌，费用增加 (\d+)。$/, (role, amount) =>
          `${this.i18n.entity(role)} returns to hand and costs ${amount} more.`],
        [/^(.+)触发独角。$/, (role) =>
          `${this.i18n.entity(role)} triggers Solo.`],
        [/^(.+)选择商业线。$/, (role) =>
          `${this.i18n.entity(role)} selects the Commercial Track.`],
        [/^(.+)选择创作线。$/, (role) =>
          `${this.i18n.entity(role)} selects the Creative Track.`],
        [/^(.+)完成接班。$/, (role) =>
          `${this.i18n.entity(role)} completes Handover.`],
        [/^(.+)触发首映。$/, (role) =>
          `${this.i18n.entity(role)} triggers Premiere.`],
        [/^(.+)接上连映。$/, (role) =>
          `${this.i18n.entity(role)} starts a Double Feature.`],
        [/^(.+)进入对峙。$/, (role) =>
          `${this.i18n.entity(role)} enters Standoff.`],
        [/^(.+)压线完成时限。$/, (role) =>
          `${this.i18n.entity(role)} completes Deadline.`],
        [/^(.+)选定江湖路，获得 \+1\/\+1。$/, (role) =>
          `${this.i18n.entity(role)} chooses an underworld path and gains +1/+1.`],
        [/^(.+)被暗花死局锁住。$/, (role) =>
          `${this.i18n.entity(role)} is locked in the longest deadlock.`],
        [/^(.+)被谈判拖延，失去 1 攻击。$/, (role) =>
          `${this.i18n.entity(role)} is delayed by the negotiation and loses 1 Attack.`],
        [/^(.+)接受盘查，失去 1 攻击。$/, (role) =>
          `${this.i18n.entity(role)} is stopped for questioning and loses 1 Attack.`],
        [/^(.+)守住票箱，获得护盾。$/, (role) =>
          `${this.i18n.entity(role)} guards the ballot box and gains Shield.`],
        [/^恐惧人格退守，头目恢复 (\d+) 点生命并获得护盾。$/, (amount) =>
          `The Fearful Persona retreats. The boss restores ${amount} Health and gains Shield.`],
        [/^(.+)被幽灯迷引，失去 1 攻击。$/, (role) =>
          `${this.i18n.entity(role)} is led astray by spirit lanterns and loses 1 Attack.`],
        [/^(.+)被杀手合约锁定。$/, (role) =>
          `${this.i18n.entity(role)} is marked by the Killer's Contract.`],
        [/^(.+)冲进决胜圈，获得 \+1\/\+1。$/, (role) =>
          `${this.i18n.entity(role)} enters the final lap and gains +1/+1.`],
        [/^(.+)听琴定神，获得护盾。$/, (role) =>
          `${this.i18n.entity(role)} finds focus in the music and gains Shield.`],
        [/^(.+)以剑和曲，获得 \+1 攻击。$/, (role) =>
          `${this.i18n.entity(role)} joins sword to score and gains +1 Attack.`],
        [/中场休整：头目恢复 (\d+) 点生命，并为角色补上护盾。$/, (amount) =>
          `Intermission: the boss restores ${amount} Health and grants a character Shield.`],
        [/^(.+)完成警署轮班，获得 \+1 攻击。$/, (role) =>
          `${this.i18n.entity(role)} completes the police shift and gains +1 Attack.`],
        [/^(.+)守住家当，获得 \+0\/\+1。$/, (role) =>
          `${this.i18n.entity(role)} protects the family savings and gains +0/+1.`],
        [/^(.+)被证物争夺拖住。$/, (role) =>
          `${this.i18n.entity(role)} is held up by the evidence struggle.`],
        [/^(.+)得到异乡照应，获得 \+1\/\+1。$/, (role) =>
          `${this.i18n.entity(role)} receives support abroad and gains +1/+1.`],
        [/^唐人街邻里为头目恢复 (\d+) 点生命。$/, (amount) =>
          `The Chinatown Neighbors restore ${amount} Health to the boss.`],
        [/^(.+)获得专业护具。$/, (role) =>
          `${this.i18n.entity(role)} receives professional protective gear.`],
        [/^战时补给：头目抽牌并恢复 (\d+) 点生命。$/, (amount) =>
          `Wartime Supplies: the boss draws a card and restores ${amount} Health.`],
        [/^(.+)陷入阴阳错位，失去 1 点攻击。$/, (role) =>
          `${this.i18n.entity(role)} is misdirected and loses 1 Attack.`],
        [/^还魂倩影恢复 (\d+) 点生命。$/, (amount) =>
          `The Returning Spirit restores ${amount} Health.`],
        [/^(.+)接上拍档配合，获得 \+1\/\+1。$/, (role) =>
          `${this.i18n.entity(role)} links up with a Partner and gains +1/+1.`],
        [/^(.+)实现护身愿望。$/, (role) =>
          `${this.i18n.entity(role)} receives a protective wish.`],
        [/^(.+)收到假暗号，失去 1 点攻击。$/, (role) =>
          `${this.i18n.entity(role)} receives a false signal and loses 1 Attack.`],
        [/^(.+)被强制转仓，费用增加 1。$/, (role) =>
          `${this.i18n.entity(role)} is transferred to hand and costs 1 more.`],
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
