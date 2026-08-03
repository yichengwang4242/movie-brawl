(function (root, factory) {
  const cards = typeof module === "object" && module.exports
    ? require("./milkyway-image-cards.js")
    : root?.MOVIE_BRAWL_MILKYWAY_IMAGE_CARDS;
  const adventure = factory(cards);
  if (typeof module === "object" && module.exports) module.exports = adventure;
  if (root) root.MOVIE_BRAWL_MILKYWAY_IMAGE_ADVENTURE = adventure;
})(typeof window !== "undefined" ? window : null, function (cards) {
  const ids = Object.fromEntries(cards.allCards.map((card) => [card.role, card.id]));
  const stages = [
    {
      id: "milkyway-image-01-prefix", order: 1, movie: "一个字头的诞生",
      title: "命运岔路口", bossName: "命运庄家", bossType: "small",
      health: 22, mechanic: "branchingFate", mechanicTitle: "两条江湖路",
      mechanicText: "奇数对手回合召唤 1/1 江湖路人；偶数回合使一个敌方角色 +1/+1，空场时改为伤害我方英雄。",
      rewardCardIds: [ids.黄阿狗, ids.命运岔路, ids.江湖硬币],
      deckThemes: ["deadline", "fate"],
    },
    {
      id: "milkyway-image-02-longest-nite", order: 2, movie: "暗花",
      title: "澳门最长一夜", bossName: "洪先生", bossType: "small",
      health: 24, mechanic: "macauDeadlock", mechanicTitle: "暗花死局",
      mechanicText: "对手回合开始时眩晕一个随机我方角色；我方空场时，英雄受到 1 点伤害。",
      rewardCardIds: [ids.阿琛, ids.关闸暗号, ids.凌晨左轮],
      deckThemes: ["standoff", "control"],
    },
    {
      id: "milkyway-image-03-running-out", order: 3, movie: "暗战",
      title: "七十二小时暗战", bossName: "张彼德", bossType: "mid",
      health: 28, mechanic: "seventyTwoHours", mechanicTitle: "72 小时倒计时",
      mechanicText: "循环三个阶段：头目抽牌、我方攻击最高的角色失去 1 攻击，再对我方英雄造成 1 点伤害。",
      rewardCardIds: [ids.张彼德], deckThemes: ["deadline", "tempo"],
    },
    {
      id: "milkyway-image-04-mission", order: 4, movie: "枪火",
      title: "商场五人阵", bossName: "文哥", bossType: "small",
      health: 26, mechanic: "bodyguardFormation", mechanicTitle: "静默保镖阵",
      mechanicText: "敌方少于三个角色时召唤 1/2 静默保镖；首次凑齐三人时，敌方全体获得 +1 攻击。",
      rewardCardIds: [ids.阿鬼, ids.商场站位, ids.保镖手枪],
      deckThemes: ["standoff", "formation"],
    },
    {
      id: "milkyway-image-05-ptu", order: 5, movie: "PTU",
      title: "尖沙咀失枪夜", bossName: "何文展", bossType: "mid",
      health: 30, mechanic: "lostGunSearch", mechanicTitle: "失枪搜索线",
      mechanicText: "奇数对手回合补入 1/1 PTU 警员；偶数回合使我方攻击最高的角色失去 1 攻击。",
      rewardCardIds: [ids.何文展], deckThemes: ["deadline", "search"],
    },
    {
      id: "milkyway-image-06-election", order: 6, movie: "黑社会",
      title: "龙头棍选举夜", bossName: "大D", bossType: "small",
      health: 28, mechanic: "electionNight", mechanicTitle: "社团选举",
      mechanicText: "循环拉票、护票与定局：头目抽牌、使一个敌方角色获得护盾，再使敌方全体获得 +1 攻击。",
      rewardCardIds: [ids.乐少, ids.龙头棍, ids.票箱点算],
      deckThemes: ["standoff", "election"],
    },
    {
      id: "milkyway-image-07-exiled", order: 7, movie: "放·逐",
      title: "澳门最后一顿饭", bossName: "大飞", bossType: "small",
      health: 30, mechanic: "exiledCountdown", mechanicTitle: "放逐倒计时",
      mechanicText: "头目生命首次降至 18 或以下时，召唤两个 2/1 疾冲追兵。",
      rewardCardIds: [ids.阿火, ids.澳门饭局, ids.旧式手枪],
      deckThemes: ["deadline", "brotherhood"],
    },
    {
      id: "milkyway-image-08-detective", order: 8, movie: "神探",
      title: "镜室七重人格", bossName: "陈桂彬", bossType: "final",
      health: 36, mechanic: "sevenPersonalities", mechanicTitle: "七重人格",
      mechanicText: "循环进取、恐惧与贪念：召唤疾冲人格、恢复生命并给予护盾，再对我方生命最低的角色造成 2 点伤害。",
      rewardCardIds: [ids.陈桂彬], deckThemes: ["standoff", "finale"],
    },
  ];

  return {
    id: "milkyway-image", order: 6, name: "银河映像",
    kicker: "单机冒险 · 第六片场",
    subtitle: "冷峻站位、宿命对峙与倒计时",
    description: "八场银河映像黑色经典。让双方阵容进入对峙，再把关键卡留到戏力见底时完成定局。",
    motif: "银", palette: "steel", art: "milkyway-image-stage",
    stages, cards: cards.allCards,
  };
});
