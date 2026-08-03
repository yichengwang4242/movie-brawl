(function (root, factory) {
  const cards =
    typeof module === "object" && module.exports
      ? require("./golden-princess-cards.js")
      : root?.MOVIE_BRAWL_GOLDEN_PRINCESS_CARDS;
  const adventure = factory(cards);
  if (typeof module === "object" && module.exports) module.exports = adventure;
  if (root) root.MOVIE_BRAWL_GOLDEN_PRINCESS_ADVENTURE = adventure;
})(typeof window !== "undefined" ? window : null, function (cards) {
  const ids = Object.fromEntries(cards.allCards.map((card) => [card.role, card.id]));
  const stages = [
    {
      id: "golden-princess-01-ghost", order: 1, movie: "倩女幽魂",
      title: "兰若寺首映夜", bossName: "黑山老妖", bossType: "small",
      health: 22, mechanic: "ghostLanternProgramme", mechanicTitle: "幽灯排片",
      mechanicText: "奇数对手回合补入 1/1 兰若幽灯；偶数回合使一个随机我方角色失去 1 攻击。",
      rewardCardIds: [ids.宁采臣, ids.兰若夜雨, ids.桃木法剑],
      deckThemes: ["premiere", "spirit"],
    },
    {
      id: "golden-princess-02-killer", order: 2, movie: "喋血双雄",
      title: "教堂双雄会", bossName: "汪海", bossType: "small",
      health: 24, mechanic: "churchCrossfire", mechanicTitle: "白鸽交火",
      mechanicText: "敌方阵容不占优时召唤 2/1 持枪杀手；占优时对我方生命最低的角色造成 1 点伤害。",
      rewardCardIds: [ids.李鹰, ids.教堂白鸽, ids.警探配枪],
      deckThemes: ["double-feature", "crime"],
    },
    {
      id: "golden-princess-03-contract", order: 3, movie: "喋血双雄",
      title: "最后一张杀手合约", bossName: "小庄", bossType: "mid",
      health: 28, mechanic: "killerContract", mechanicTitle: "杀手合约",
      mechanicText: "循环锁定与清场：先使我方攻击最高的角色眩晕，再对我方全体角色造成 1 点伤害。",
      rewardCardIds: [ids.小庄], deckThemes: ["premiere", "control"],
    },
    {
      id: "golden-princess-04-along", order: 4, movie: "阿郎的故事",
      title: "旧赛道决胜圈", bossName: "大赛车手", bossType: "small",
      health: 26, mechanic: "finalLap", mechanicTitle: "父子冲线",
      mechanicText: "每两个对手回合，使敌方生命最低的角色 +1/+1；敌方空场时召唤 1/2 赛道学徒。",
      rewardCardIds: [ids.阿郎, ids.父子冲线, ids.旧赛道头盔],
      deckThemes: ["premiere", "survival"],
    },
    {
      id: "golden-princess-05-sunset", order: 5, movie: "英雄本色III夕阳之歌",
      title: "西贡夕阳逃生线", bossName: "周英杰", bossType: "mid",
      health: 30, mechanic: "sunsetConvoy", mechanicTitle: "夕阳车队",
      mechanicText: "头目生命首次降至 18 或以下时，装备 3/2 越境手枪，并召唤一个 2/2 逃生同伴。",
      rewardCardIds: [ids.周英杰], deckThemes: ["double-feature", "tempo"],
    },
    {
      id: "golden-princess-06-swordsman", order: 6, movie: "笑傲江湖",
      title: "曲谱争夺战", bossName: "任我行", bossType: "small",
      health: 28, mechanic: "scoreDuel", mechanicTitle: "琴剑合谱",
      mechanicText: "奇数对手回合使一个敌方角色获得护盾；偶数回合使一个敌方角色获得 +1 攻击。",
      rewardCardIds: [ids.令狐冲, ids.笑傲曲谱, ids.独孤长剑],
      deckThemes: ["double-feature", "wuxia"],
    },
    {
      id: "golden-princess-07-moment", order: 7, movie: "天若有情",
      title: "旺角午夜狂奔", bossName: "七哥", bossType: "small",
      health: 30, mechanic: "midnightRun", mechanicTitle: "午夜档期",
      mechanicText: "奇数对手回合召唤 2/1 疾冲摩托手；偶数回合双方英雄各受到 1 点伤害。",
      rewardCardIds: [ids.华弟, ids.JoJo, ids.亡命摩托],
      deckThemes: ["premiere", "rush"],
    },
    {
      id: "golden-princess-08-hard-boiled", order: 8, movie: "辣手神探",
      title: "医院子夜连映", bossName: "袁浩云", bossType: "final",
      health: 36, mechanic: "midnightDoubleBill", mechanicTitle: "子夜连映",
      mechanicText: "循环首映、中场与子夜场：召唤疾冲警员并抽牌、恢复生命并给予护盾，再伤害我方全体角色。",
      rewardCardIds: [ids.袁浩云], deckThemes: ["double-feature", "finale"],
    },
  ];

  return {
    id: "golden-princess", order: 5, name: "金公主院线",
    kicker: "单机冒险 · 第五片场",
    subtitle: "排片、首映与子夜连映",
    description: "八场金公主院线与片库经典。用首映抢下每回合开场，再以不同类型卡牌连映扩大优势。",
    motif: "金", palette: "amber", art: "golden-princess-stage",
    stages, cards: cards.allCards,
  };
});
