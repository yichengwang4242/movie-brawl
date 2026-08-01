(function (root, factory) {
  const cards =
    typeof module === "object" && module.exports
      ? require("./d-and-b-cards.js")
      : root?.MOVIE_BRAWL_D_AND_B_CARDS;
  const adventure = factory(cards);
  if (typeof module === "object" && module.exports) {
    module.exports = adventure;
  }
  if (root) {
    root.MOVIE_BRAWL_D_AND_B_ADVENTURE = adventure;
  }
})(typeof window !== "undefined" ? window : null, function (cards) {
  const ids = Object.fromEntries(cards.allCards.map((card) => [card.role, card.id]));
  const stages = [
    {
      id: "d-and-b-01-pom-pom",
      order: 1,
      movie: "双龙出海",
      title: "乌龙巡逻线",
      bossName: "吴阿秋与贝多芬",
      bossType: "small",
      health: 22,
      mechanic: "pomPomShift",
      mechanicTitle: "警署轮班",
      mechanicText: "奇数对手回合补充巡逻警员，偶数回合则使一名敌方角色获得 +1 攻击。",
      rewardCardIds: [ids.吴阿秋, ids.贝多芬, ids.警车包抄],
      deckThemes: ["solo", "handover"],
    },
    {
      id: "d-and-b-02-fortune",
      order: 2,
      movie: "富贵逼人",
      title: "横财屋邨夜",
      bossName: "骠叔一家",
      bossType: "small",
      health: 24,
      mechanic: "lotteryCycle",
      mechanicTitle: "横财三拍",
      mechanicText: "循环经历中奖、守财与烦恼：头目抽牌、强化角色生命，再对我方英雄造成 1 点伤害。",
      rewardCardIds: [ids.骠叔, ids.骠婶, ids.横财彩票],
      deckThemes: ["two-track", "family"],
    },
    {
      id: "d-and-b-03-yes-madam",
      order: 3,
      movie: "皇家师姐",
      title: "微型菲林案",
      bossName: "吴洛茜",
      bossType: "mid",
      health: 28,
      mechanic: "microfilmCase",
      mechanicTitle: "证物争夺",
      mechanicText: "敌方阵容不占优时召唤 2/1 皇家探员；占优时随机眩晕一个我方角色。",
      rewardCardIds: [ids.吴洛茜],
      deckThemes: ["solo", "tempo"],
    },
    {
      id: "d-and-b-04-lunatics",
      order: 4,
      movie: "癫佬正传",
      title: "街头求援",
      bossName: "徐先生",
      bossType: "small",
      health: 26,
      mechanic: "streetReality",
      mechanicTitle: "街头现实",
      mechanicText: "每两个对手回合，双方生命最低的角色各受到 1 点伤害；我方空场时伤害英雄。",
      rewardCardIds: [ids.徐先生, ids.叶姑娘, ids.街头支援],
      deckThemes: ["handover", "survival"],
    },
    {
      id: "d-and-b-05-autumn",
      order: 5,
      movie: "秋天的童话",
      title: "唐人街秋日",
      bossName: "船头尺",
      bossType: "mid",
      health: 30,
      mechanic: "chinatownSupport",
      mechanicTitle: "异乡照应",
      mechanicText: "敌方空场时召唤唐人街邻里，只有一个角色时使其 +1/+1，多人时头目恢复 1 点生命。",
      rewardCardIds: [ids.船头尺],
      deckThemes: ["solo", "two-track"],
    },
    {
      id: "d-and-b-06-warriors",
      order: 6,
      movie: "中华战士",
      title: "边城护送战",
      bossName: "霍明明",
      bossType: "small",
      health: 28,
      mechanic: "internationalUnit",
      mechanicTitle: "国际动作组",
      mechanicText: "循环召唤疾冲队员、给予护盾，再对我方全体角色造成 1 点伤害。",
      rewardCardIds: [ids.霍明明, ids.战地电台, ids.飞行索具],
      deckThemes: ["solo", "action"],
    },
    {
      id: "d-and-b-07-last-victory",
      order: 7,
      movie: "最后胜利",
      title: "旺角最后一局",
      bossName: "阿雄",
      bossType: "small",
      health: 30,
      mechanic: "lastVictoryDebt",
      mechanicTitle: "欠账追数",
      mechanicText: "头目生命首次降至 18 点或以下时抽 2 张牌，并使敌方全体获得 +1 攻击。",
      rewardCardIds: [ids.阿雄, ids.Mimi, ids.旺角接应],
      deckThemes: ["handover", "two-track"],
    },
    {
      id: "d-and-b-08-dawn",
      order: 8,
      movie: "等待黎明",
      title: "战火等黎明",
      bossName: "叶剑飞",
      bossType: "final",
      health: 36,
      mechanic: "wartimeDawn",
      mechanicTitle: "战时三幕",
      mechanicText: "循环组织抵抗、空袭街区与分配补给：召唤嘲讽角色、伤害双方阵容，再抽牌并恢复生命。",
      rewardCardIds: [ids.叶剑飞],
      deckThemes: ["handover", "balanced"],
    },
  ];

  return {
    id: "d-and-b",
    order: 4,
    name: "德宝片场",
    kicker: "单机冒险 · 第四片场",
    subtitle: "两条腿走路的都市创意与专业动作",
    description: "八场德宝电影奇遇。用独角、双线与接班判断场面，在商业类型和创作路线之间灵活换挡。",
    motif: "德",
    palette: "jade",
    art: "d-and-b-stage",
    stages,
    cards: cards.allCards,
  };
});
