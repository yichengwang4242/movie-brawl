(function (root, factory) {
  const cards =
    typeof module === "object" && module.exports
      ? require("./golden-harvest-cards.js")
      : root?.MOVIE_BRAWL_GOLDEN_HARVEST_CARDS;
  const adventure = factory(cards);
  if (typeof module === "object" && module.exports) {
    module.exports = adventure;
  }
  if (root) {
    root.MOVIE_BRAWL_GOLDEN_HARVEST_ADVENTURE = adventure;
  }
})(typeof window !== "undefined" ? window : null, function (cards) {
  const ids = Object.fromEntries(cards.allCards.map((card) => [card.role, card.id]));
  const stages = [
    {
      id: "golden-harvest-01-factory",
      order: 1,
      movie: "唐山大兄",
      title: "冰厂追凶",
      bossName: "米老板",
      bossType: "small",
      health: 22,
      mechanic: "iceFactory",
      mechanicTitle: "工厂围堵",
      mechanicText: "对手回合开始时，若场上没有打手，召唤一个 2/1 冰厂打手。",
      rewardCardIds: [ids.冰厂工友, ids.冰厂突围, ids.双节棍],
      deckThemes: ["rush", "tempo"],
    },
    {
      id: "golden-harvest-02-spooky",
      order: 2,
      movie: "鬼打鬼",
      title: "纸扎法坛",
      bossName: "钱真人",
      bossType: "small",
      health: 24,
      mechanic: "paperAltar",
      mechanicTitle: "借尸还魂",
      mechanicText: "每两个对手回合，若敌方有角色则复制其最低生命角色为 1/1 纸人；否则召唤纸人。",
      rewardCardIds: [ids.纸扎替身, ids.定身灵符, ids.桃木剑],
      deckThemes: ["deathrattle", "summon"],
    },
    {
      id: "golden-harvest-03-project-a",
      order: 3,
      movie: "A计划",
      title: "钟楼追逐",
      bossName: "马如龙",
      bossType: "mid",
      health: 28,
      mechanic: "clockTower",
      mechanicTitle: "钟楼险坠",
      mechanicText: "每三个对手回合钟楼敲响，对所有我方角色造成 1 点伤害；无角色则伤害英雄。",
      rewardCardIds: [ids.马如龙],
      deckThemes: ["rush", "weapon"],
    },
    {
      id: "golden-harvest-04-lucky-stars",
      order: 4,
      movie: "奇谋妙计五福星",
      title: "五福奇兵",
      bossName: "冷面杀手",
      bossType: "small",
      health: 26,
      mechanic: "luckyStars",
      mechanicTitle: "福星接力",
      mechanicText: "对手回合开始时，若敌方角色不足三人，召唤一个 1/1 福星拍档。",
      rewardCardIds: [ids.茶壶, ids.五星合拍, ids.逃脱面包车],
      deckThemes: ["swarm", "buff"],
    },
    {
      id: "golden-harvest-05-police-story",
      order: 5,
      movie: "警察故事",
      title: "商场大追捕",
      bossName: "陈家驹",
      bossType: "mid",
      health: 30,
      mechanic: "mallStunt",
      mechanicTitle: "商场特技",
      mechanicText: "头目生命首次降至 18 点或以下时，敌方全体获得 +1 攻击，并召唤一个 2/2 疾冲的重案警员。",
      rewardCardIds: [ids.陈家驹],
      deckThemes: ["tempo", "rush"],
    },
    {
      id: "golden-harvest-06-condors",
      order: 6,
      movie: "东方秃鹰",
      title: "丛林突袭",
      bossName: "将军",
      bossType: "small",
      health: 28,
      mechanic: "jungleRaid",
      mechanicTitle: "交叉火力",
      mechanicText: "每两个对手回合，对我方攻击最高的角色造成 1 点伤害；空场时召唤突击队员。",
      rewardCardIds: [ids.战地队员, ids.丛林伏击, ids.军用匕首],
      deckThemes: ["rush", "damage"],
    },
    {
      id: "golden-harvest-07-lion",
      order: 7,
      movie: "黄飞鸿",
      title: "醒狮擂台",
      bossName: "严振东",
      bossType: "small",
      health: 30,
      mechanic: "lionDance",
      mechanicTitle: "醒狮抢青",
      mechanicText: "每两个对手回合，一名敌方角色获得 +1 攻击；没有角色时召唤一个 2/1 疾冲的醒狮队员。",
      rewardCardIds: [ids.宝芝林弟子, ids.佛山无影脚, ids.宝芝林长棍],
      deckThemes: ["taunt", "buff"],
    },
    {
      id: "golden-harvest-08-colosseum",
      order: 8,
      movie: "猛龙过江",
      title: "罗马斗场",
      bossName: "唐龙",
      bossType: "final",
      health: 36,
      mechanic: "colosseumDuel",
      mechanicTitle: "截拳三式",
      mechanicText: "循环切换试探、截击与猛攻：召唤疾冲拳手、强化攻击，再对我方全体造成 1 点伤害。",
      rewardCardIds: [ids.唐龙],
      deckThemes: ["balanced", "rush"],
    },
  ];

  return {
    id: "golden-harvest",
    order: 2,
    name: "嘉禾制片厂",
    kicker: "单机冒险 · 第二片场",
    subtitle: "拳脚、特技与动作喜剧黄金时代",
    description: "八场嘉禾动作经典。难度来自片场规则与头目配合，奖励卡保持普通构筑强度。",
    motif: "嘉",
    palette: "gold",
    art: "golden-harvest-stage",
    stages,
    cards: cards.allCards,
  };
});
