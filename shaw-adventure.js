(function (root, factory) {
  const cards =
    typeof module === "object" && module.exports
      ? require("./shaw-cards.js")
      : root?.MOVIE_BRAWL_SHAW_CARDS;
  const adventure = factory(cards);
  if (typeof module === "object" && module.exports) {
    module.exports = adventure;
  }
  if (root) {
    root.MOVIE_BRAWL_SHAW_ADVENTURE = adventure;
  }
})(typeof window !== "undefined" ? window : null, function (cards) {
  const ids = Object.fromEntries(cards.allCards.map((card) => [card.role, card.id]));
  const stages = [
    {
      id: "shaw-01-inn",
      order: 1,
      movie: "大醉侠",
      title: "客栈试锋",
      bossName: "玉面虎",
      bossType: "small",
      health: 22,
      mechanic: "innAmbush",
      mechanicTitle: "客栈伏兵",
      mechanicText: "对手回合开始时，若阵容不足两人，召唤一个 1/1 山寨喽啰。",
      rewardCardIds: [ids.醉侠随从, ids.客栈伏击, ids.短锋剑],
      deckThemes: ["inn", "swarm"],
    },
    {
      id: "shaw-02-guillotine",
      order: 2,
      movie: "血滴子",
      title: "飞轮索命",
      bossName: "血滴子统领",
      bossType: "small",
      health: 24,
      mechanic: "guillotineMark",
      mechanicTitle: "索命印记",
      mechanicText: "每两个对手回合，对生命最低的我方角色造成 1 点伤害；无角色则伤害英雄。",
      rewardCardIds: [ids.血滴子死士, ids.飞索锁敌, ids.血滴子],
      deckThemes: ["weapon", "deathrattle"],
    },
    {
      id: "shaw-03-swallow",
      order: 3,
      movie: "大醉侠",
      title: "金燕临门",
      bossName: "金燕子",
      bossType: "mid",
      health: 28,
      mechanic: "goldenSwallow",
      mechanicTitle: "燕影无痕",
      mechanicText: "偶数回合开始时，一名敌方角色获得护盾；没有角色时召唤燕影。",
      rewardCardIds: [ids.金燕子],
      deckThemes: ["tempo", "shield"],
    },
    {
      id: "shaw-04-venoms",
      order: 4,
      movie: "五毒",
      title: "毒门疑阵",
      bossName: "蜈蚣",
      bossType: "small",
      health: 26,
      mechanic: "venomFormation",
      mechanicTitle: "五毒阵",
      mechanicText: "偶数回合开始时，一名敌方角色获得反伤 1；效果不会无限叠加。",
      rewardCardIds: [ids.蜈蚣门徒, ids.蛇形换位, ids.毒门钢刺],
      deckThemes: ["venom", "reflect"],
    },
    {
      id: "shaw-05-blade",
      order: 5,
      movie: "独臂刀",
      title: "断刃重生",
      bossName: "方刚",
      bossType: "mid",
      health: 30,
      mechanic: "brokenBlade",
      mechanicTitle: "断臂觉醒",
      mechanicText: "生命首次降至 18 点或以下时，装备 4/2 断刃，但奖励卡不会继承这件头目武器。",
      rewardCardIds: [ids.方刚],
      deckThemes: ["rush", "weapon"],
    },
    {
      id: "shaw-06-golden-arm",
      order: 6,
      movie: "金臂童",
      title: "铜墙金臂",
      bossName: "金臂童",
      bossType: "small",
      health: 28,
      mechanic: "goldenArm",
      mechanicTitle: "金臂横练",
      mechanicText: "每两个对手回合，一名敌方角色获得 +1 攻击，逼迫玩家及时交换场面。",
      rewardCardIds: [ids.金臂门卫, ids.铁布衫, ids.金臂护腕],
      deckThemes: ["taunt", "buff"],
    },
    {
      id: "shaw-07-lotus",
      order: 7,
      movie: "洪文定三破白莲教",
      title: "白莲法坛",
      bossName: "白莲教主",
      bossType: "small",
      health: 30,
      mechanic: "whiteLotus",
      mechanicTitle: "白莲法坛",
      mechanicText: "有随从时头目恢复 1 点生命；空场时召唤一个 1/2 白莲香众。",
      rewardCardIds: [ids.白莲弟子, ids.莲台护法, ids.回马枪],
      deckThemes: ["healing", "taunt"],
    },
    {
      id: "shaw-08-chambers",
      order: 8,
      movie: "少林三十六房",
      title: "三十六房",
      bossName: "三德和尚",
      bossType: "final",
      health: 36,
      mechanic: "thirtySixChambers",
      mechanicTitle: "逐房修炼",
      mechanicText: "依次进行木人巷、腕力房与兵器房训练，循环召唤、强化生命和补充手牌。",
      rewardCardIds: [ids.三德和尚],
      deckThemes: ["training", "balanced"],
    },
  ];

  return {
    id: "shaw",
    name: "邵氏片场",
    subtitle: "刀光、拳影与三十六房",
    description: "八场经典武侠试炼。头目强在规则与配合，奖励卡均按普通构筑强度结算。",
    motif: "邵",
    palette: "crimson",
    stages,
    cards: cards.allCards,
  };
});
