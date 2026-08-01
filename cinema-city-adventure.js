(function (root, factory) {
  const cards =
    typeof module === "object" && module.exports
      ? require("./cinema-city-cards.js")
      : root?.MOVIE_BRAWL_CINEMA_CITY_CARDS;
  const adventure = factory(cards);
  if (typeof module === "object" && module.exports) {
    module.exports = adventure;
  }
  if (root) {
    root.MOVIE_BRAWL_CINEMA_CITY_ADVENTURE = adventure;
  }
})(typeof window !== "undefined" ? window : null, function (cards) {
  const ids = Object.fromEntries(cards.allCards.map((card) => [card.role, card.id]));
  const stages = [
    {
      id: "cinema-city-01-clues",
      order: 1,
      movie: "鬼马智多星",
      title: "智多星斗局",
      bossName: "赌局庄家",
      bossType: "small",
      health: 22,
      mechanic: "strivingRoom",
      mechanicTitle: "奋斗房度桥",
      mechanicText: "对手回合开始时，若敌方角色不足两人，召唤一个 1/1 奋斗房拍档。",
      rewardCardIds: [ids.林亚珍, ids.智多星布局, ids.机关雨伞],
      deckThemes: ["partner", "trick"],
    },
    {
      id: "cinema-city-02-yinyang",
      order: 2,
      movie: "阴阳错",
      title: "人鬼错摸",
      bossName: "还魂倩影",
      bossType: "small",
      health: 24,
      mechanic: "yinYangMisdirect",
      mechanicTitle: "阴阳错位",
      mechanicText: "每两个对手回合，使一个随机我方角色失去 1 点攻击；我方空场时头目恢复 1 点生命。",
      rewardCardIds: [ids.古志明, ids.小瑜, ids.人鬼错摸],
      deckThemes: ["summon", "comeback"],
    },
    {
      id: "cinema-city-03-aces",
      order: 3,
      movie: "最佳拍档",
      title: "钻石大追逐",
      bossName: "King Kong",
      bossType: "mid",
      health: 28,
      mechanic: "acePartners",
      mechanicTitle: "最佳拍档",
      mechanicText: "敌方角色不足两人时召唤 2/1 高科技拍档；否则一名敌方角色获得 +1/+1。",
      rewardCardIds: [ids["King Kong"]],
      deckThemes: ["partner", "tempo"],
    },
    {
      id: "cinema-city-04-happy-ghost",
      order: 4,
      movie: "开心鬼",
      title: "校园愿望夜",
      bossName: "开心鬼",
      bossType: "small",
      health: 26,
      mechanic: "happyWish",
      mechanicTitle: "青春愿望",
      mechanicText: "循环实现三个愿望：召唤开心同学、给予护盾，再抽 1 张牌。",
      rewardCardIds: [ids.开心少女, ids.青春愿望, ids.校园接力棒],
      deckThemes: ["partner", "comeback"],
    },
    {
      id: "cinema-city-05-opera",
      order: 5,
      movie: "刀马旦",
      title: "戏台三线会师",
      bossName: "曹云",
      bossType: "mid",
      health: 30,
      mechanic: "operaCrosscut",
      mechanicTitle: "三线会师",
      mechanicText: "敌方角色不足三人时召唤 1/1 戏班同伴；达到三人后，全体获得 +1 攻击。",
      rewardCardIds: [ids.曹云],
      deckThemes: ["partner", "ensemble"],
    },
    {
      id: "cinema-city-06-city-on-fire",
      order: 6,
      movie: "龙虎风云",
      title: "天台卧底局",
      bossName: "阿虎",
      bossType: "small",
      health: 28,
      mechanic: "undercoverSignal",
      mechanicTitle: "卧底暗号",
      mechanicText: "每两个对手回合，使我方攻击最高的角色失去 1 点攻击；我方空场时英雄受到 1 点伤害。",
      rewardCardIds: [ids.高秋, ids.天台暗号, ids.警用左轮],
      deckThemes: ["comeback", "control"],
    },
    {
      id: "cinema-city-07-prison",
      order: 7,
      movie: "监狱风云",
      title: "监仓点名",
      bossName: "杀手雄",
      bossType: "small",
      health: 30,
      mechanic: "prisonRollCall",
      mechanicTitle: "强制转仓",
      mechanicText: "每三个对手回合，将我方生命最低的角色返回手牌，其费用增加 1。",
      rewardCardIds: [ids.狱中拍档, ids.牢房换位, ids.饭堂铁盘],
      deckThemes: ["return", "partner"],
    },
    {
      id: "cinema-city-08-heroic",
      order: 8,
      movie: "英雄本色",
      title: "码头英雄夜",
      bossName: "宋子豪",
      bossType: "final",
      health: 36,
      mechanic: "heroicBrotherhood",
      mechanicTitle: "兄弟本色",
      mechanicText: "循环召唤义气拍档、补充手牌与戏力，再使敌方全体获得 +1 攻击。",
      rewardCardIds: [ids.宋子豪],
      deckThemes: ["partner", "comeback"],
    },
  ];

  return {
    id: "cinema-city",
    order: 3,
    name: "新艺城片场",
    kicker: "单机冒险 · 第三片场",
    subtitle: "鬼马计谋、最佳拍档与剧情反转",
    description: "八场新艺城类型片奇遇。善用拍档、反转与转场重演，在头目机制中寻找破局时机。",
    motif: "新",
    palette: "teal",
    art: "cinema-city-stage",
    stages,
    cards: cards.allCards,
  };
});
