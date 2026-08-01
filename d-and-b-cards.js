(function (root, factory) {
  const builders =
    typeof module === "object" && module.exports
      ? require("./card-builders.js")
      : root?.MOVIE_BRAWL_CARD_BUILDERS;
  const cards = factory(builders);
  if (typeof module === "object" && module.exports) {
    module.exports = cards;
  }
  if (root) {
    root.MOVIE_BRAWL_D_AND_B_CARDS = cards;
  }
})(typeof window !== "undefined" ? window : null, function (builders) {
  const { role, spell, weapon } = builders.studioCardBuilders({
    id: "d-and-b",
    region: "德宝片场",
  });

  const normalCards = [
    role({
      star: "德宝群像",
      role: "吴阿秋",
      movie: "双龙出海",
      cost: 1,
      attack: 1,
      health: 2,
      motif: "秋",
      palette: "teal",
      text: "独角：若没有其他友方角色，抽 1 张牌。",
      effects: [{
        type: "soloSpotlight",
        effects: [{ type: "draw", amount: 1 }],
      }],
    }),
    role({
      star: "德宝群像",
      role: "贝多芬",
      movie: "双龙出海",
      cost: 2,
      attack: 2,
      health: 2,
      motif: "芬",
      palette: "amber",
      text: "接班：若本回合已有友方角色退场，自身 +1/+1。",
      effects: [{
        type: "handover",
        effects: [{ type: "buffSelf", attack: 1, health: 1 }],
      }],
    }),
    spell({
      role: "警车包抄",
      movie: "双龙出海",
      cost: 2,
      motif: "警",
      palette: "crimson",
      text: "对生命最低的敌方角色造成 1 点伤害。双线：领先时再伤害敌方英雄 1 点，否则召唤一个 1/1 巡逻警员。",
      effects: [
        { type: "damageWeakestEnemyMinion", amount: 1 },
        {
          type: "twoTrack",
          commercialEffects: [{ type: "damageEnemyHero", amount: 1 }],
          creativeEffects: [{
            type: "summon",
            amount: 1,
            token: { role: "巡逻警员", attack: 1, health: 1, motif: "巡" },
          }],
        },
      ],
    }),
    role({
      star: "德宝群像",
      role: "骠叔",
      movie: "富贵逼人",
      cost: 2,
      attack: 2,
      health: 3,
      motif: "骠",
      palette: "gold",
      text: "双线：领先时自身获得 +1 攻击，否则己方英雄恢复 2 点生命。",
      effects: [{
        type: "twoTrack",
        commercialEffects: [{ type: "buffSelf", attack: 1, health: 0 }],
        creativeEffects: [{ type: "healHero", amount: 2 }],
      }],
    }),
    role({
      star: "德宝群像",
      role: "骠婶",
      movie: "富贵逼人",
      cost: 2,
      attack: 1,
      health: 3,
      motif: "婶",
      palette: "coral",
      text: "独角：若没有其他友方角色，抽 1 张牌。",
      effects: [{
        type: "soloSpotlight",
        effects: [{ type: "draw", amount: 1 }],
      }],
    }),
    spell({
      role: "横财彩票",
      movie: "富贵逼人",
      cost: 1,
      motif: "彩",
      palette: "gold",
      text: "双线：领先时一个随机友方角色获得 +1 攻击，否则抽 1 张牌。",
      effects: [{
        type: "twoTrack",
        commercialEffects: [{ type: "buffRandomFriendly", attack: 1, health: 0 }],
        creativeEffects: [{ type: "draw", amount: 1 }],
      }],
    }),
    role({
      star: "德宝群像",
      role: "徐先生",
      movie: "癫佬正传",
      cost: 3,
      attack: 2,
      health: 4,
      motif: "徐",
      palette: "steel",
      text: "独角：己方英雄恢复 2 点生命。",
      effects: [{
        type: "soloSpotlight",
        effects: [{ type: "healHero", amount: 2 }],
      }],
    }),
    role({
      star: "德宝群像",
      role: "叶姑娘",
      movie: "癫佬正传",
      cost: 2,
      attack: 2,
      health: 3,
      motif: "叶",
      palette: "jade",
      text: "接班：一个随机友方角色获得护盾。",
      effects: [{
        type: "handover",
        effects: [{ type: "shieldRandomFriendly" }],
      }],
    }),
    spell({
      role: "街头支援",
      movie: "癫佬正传",
      cost: 2,
      motif: "援",
      palette: "jade",
      text: "召唤一个 1/2 且具有嘲讽的社区义工。接班：抽 1 张牌。",
      effects: [
        {
          type: "summon",
          amount: 1,
          token: {
            role: "社区义工",
            attack: 1,
            health: 2,
            motif: "社",
            keywords: ["taunt"],
          },
        },
        { type: "handover", effects: [{ type: "draw", amount: 1 }] },
      ],
    }),
    role({
      star: "杨紫琼",
      role: "霍明明",
      movie: "中华战士",
      cost: 3,
      attack: 3,
      health: 2,
      motif: "霍",
      palette: "crimson",
      text: "疾冲。独角：自身获得 +0/+1。",
      keywords: ["rush"],
      effects: [{
        type: "soloSpotlight",
        effects: [{ type: "buffSelf", attack: 0, health: 1 }],
      }],
    }),
    spell({
      role: "战地电台",
      movie: "中华战士",
      cost: 2,
      motif: "讯",
      palette: "teal",
      text: "双线：领先时一个随机友方角色 +1/+1，否则抽 1 张牌。",
      effects: [{
        type: "twoTrack",
        commercialEffects: [{ type: "buffRandomFriendly", attack: 1, health: 1 }],
        creativeEffects: [{ type: "draw", amount: 1 }],
      }],
    }),
    weapon({
      role: "飞行索具",
      movie: "中华战士",
      cost: 3,
      attack: 2,
      durability: 2,
      motif: "索",
      palette: "steel",
      text: "接班：对生命最低的敌方角色造成 2 点伤害。",
      effects: [{
        type: "handover",
        effects: [{ type: "damageWeakestEnemyMinion", amount: 2 }],
      }],
    }),
    role({
      star: "德宝群像",
      role: "阿雄",
      movie: "最后胜利",
      cost: 3,
      attack: 3,
      health: 3,
      motif: "雄",
      palette: "amber",
      text: "接班：抽 1 张牌。",
      effects: [{
        type: "handover",
        effects: [{ type: "draw", amount: 1 }],
      }],
    }),
    role({
      star: "德宝群像",
      role: "Mimi",
      movie: "最后胜利",
      cost: 2,
      attack: 2,
      health: 2,
      motif: "M",
      palette: "coral",
      text: "独角：自身获得护盾。",
      effects: [{
        type: "soloSpotlight",
        effects: [{ type: "shieldRandomFriendly" }],
      }],
    }),
    spell({
      role: "旺角接应",
      movie: "最后胜利",
      cost: 2,
      motif: "接",
      palette: "amber",
      text: "召唤一个 2/1 街头接应。双线：领先时使其获得疾冲，否则己方英雄恢复 2 点生命。",
      effects: [
        {
          type: "summon",
          amount: 1,
          token: { role: "街头接应", attack: 2, health: 1, motif: "街" },
        },
        {
          type: "twoTrack",
          commercialEffects: [{ type: "rushRandomFriendly" }],
          creativeEffects: [{ type: "healHero", amount: 2 }],
        },
      ],
    }),
  ];

  const bossCards = [
    role({
      star: "杨紫琼",
      role: "吴洛茜",
      movie: "皇家师姐",
      cost: 4,
      attack: 4,
      health: 4,
      motif: "茜",
      palette: "crimson",
      rarity: "头目",
      text: "疾冲。独角：自身获得护盾。",
      keywords: ["rush"],
      effects: [{
        type: "soloSpotlight",
        effects: [{ type: "shieldRandomFriendly" }],
      }],
    }),
    role({
      star: "周润发",
      role: "船头尺",
      movie: "秋天的童话",
      cost: 5,
      attack: 4,
      health: 6,
      motif: "尺",
      palette: "gold",
      rarity: "头目",
      text: "双线：领先时己方英雄恢复 2 点生命，否则抽 1 张牌。",
      effects: [{
        type: "twoTrack",
        commercialEffects: [{ type: "healHero", amount: 2 }],
        creativeEffects: [{ type: "draw", amount: 1 }],
      }],
    }),
    role({
      star: "周润发",
      role: "叶剑飞",
      movie: "等待黎明",
      cost: 6,
      attack: 5,
      health: 6,
      motif: "黎",
      palette: "steel",
      rarity: "最终头目",
      text: "接班：召唤一个 2/2 且具有嘲讽的黎明同伴。",
      effects: [{
        type: "handover",
        effects: [{
          type: "summon",
          amount: 1,
          token: {
            role: "黎明同伴",
            attack: 2,
            health: 2,
            motif: "明",
            keywords: ["taunt"],
          },
        }],
      }],
    }),
  ];

  return {
    normalCards,
    bossCards,
    allCards: [...normalCards, ...bossCards],
  };
});
