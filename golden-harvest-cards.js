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
    root.MOVIE_BRAWL_GOLDEN_HARVEST_CARDS = cards;
  }
})(typeof window !== "undefined" ? window : null, function (builders) {
  const { role, spell, weapon } = builders.studioCardBuilders({
    id: "golden-harvest",
    region: "嘉禾片场",
  });

  const normalCards = [
    role({
      star: "嘉禾群像",
      role: "冰厂工友",
      movie: "唐山大兄",
      cost: 1,
      attack: 2,
      health: 1,
      motif: "冰",
      palette: "steel",
      text: "连拍：若本回合已打出另一张牌，自身 +0/+1。",
      effects: [{
        type: "combo",
        effects: [{ type: "buffSelf", attack: 0, health: 1 }],
      }],
    }),
    spell({
      role: "冰厂突围",
      movie: "唐山大兄",
      cost: 2,
      motif: "破",
      palette: "crimson",
      text: "对生命最低的敌方角色造成 2 点伤害。连拍：抽 1 张牌。",
      effects: [
        { type: "damageWeakestEnemyMinion", amount: 2 },
        { type: "combo", effects: [{ type: "draw", amount: 1 }] },
      ],
    }),
    weapon({
      role: "双节棍",
      movie: "唐山大兄",
      cost: 2,
      attack: 2,
      durability: 2,
      motif: "双",
      palette: "amber",
      text: "2 点攻击，2 点耐久。连拍：对一个随机敌人造成 1 点伤害。",
      effects: [{
        type: "combo",
        effects: [{ type: "damageRandomEnemy", amount: 1 }],
      }],
    }),
    role({
      star: "嘉禾群像",
      role: "纸扎替身",
      movie: "鬼打鬼",
      cost: 2,
      attack: 3,
      health: 1,
      motif: "纸",
      palette: "violet",
      text: "亡语：召唤一个 1/1 纸人。",
      keywords: ["deathrattle"],
      deathEffects: [{
        type: "summon",
        amount: 1,
        token: { role: "纸人", attack: 1, health: 1, motif: "纸" },
      }],
    }),
    spell({
      role: "定身灵符",
      movie: "鬼打鬼",
      cost: 2,
      motif: "符",
      palette: "gold",
      text: "随机敌方角色眩晕一回合。连拍：获得 1 点临时戏力。",
      effects: [
        { type: "stunRandomEnemy" },
        { type: "combo", effects: [{ type: "gainTempMana", amount: 1 }] },
      ],
    }),
    weapon({
      role: "桃木剑",
      movie: "鬼打鬼",
      cost: 3,
      attack: 3,
      durability: 2,
      motif: "桃",
      palette: "jade",
      text: "3 点攻击，2 点耐久。连拍：召唤一个 1/1 纸人。",
      effects: [{
        type: "combo",
        effects: [{
          type: "summon",
          amount: 1,
          token: { role: "纸人", attack: 1, health: 1, motif: "纸" },
        }],
      }],
    }),
    role({
      star: "嘉禾群像",
      role: "茶壶",
      movie: "奇谋妙计五福星",
      cost: 3,
      attack: 3,
      health: 2,
      motif: "茶",
      palette: "amber",
      text: "入场：召唤一个 1/1 福星拍档。",
      effects: [{
        type: "summon",
        amount: 1,
        token: { role: "福星拍档", attack: 1, health: 1, motif: "福" },
      }],
    }),
    spell({
      role: "五星合拍",
      movie: "奇谋妙计五福星",
      cost: 3,
      motif: "福",
      palette: "gold",
      text: "所有友方角色 +1/+0。连拍：所有友方角色获得疾冲。",
      effects: [
        { type: "buffAllFriendly", attack: 1, health: 0 },
        { type: "combo", effects: [{ type: "rushAllFriendly" }] },
      ],
    }),
    weapon({
      role: "逃脱面包车",
      movie: "奇谋妙计五福星",
      cost: 3,
      attack: 3,
      durability: 1,
      motif: "车",
      palette: "steel",
      text: "装备：抽 1 张牌。",
      effects: [{ type: "draw", amount: 1 }],
    }),
    role({
      star: "嘉禾群像",
      role: "战地队员",
      movie: "东方秃鹰",
      cost: 3,
      attack: 3,
      health: 2,
      motif: "鹰",
      palette: "jade",
      text: "疾冲。特技：若己方英雄装备武器，自身获得 +1 攻击。",
      keywords: ["rush"],
      effects: [{
        type: "whileArmed",
        effects: [{ type: "buffSelf", attack: 1, health: 0 }],
      }],
    }),
    spell({
      role: "丛林伏击",
      movie: "东方秃鹰",
      cost: 3,
      motif: "伏",
      palette: "jade",
      text: "召唤两个 1/1 且具有疾冲的突击队员。连拍：对敌方英雄造成 1 点伤害。",
      effects: [
        {
          type: "summon",
          amount: 2,
          token: {
            role: "突击队员",
            attack: 1,
            health: 1,
            motif: "突",
            keywords: ["rush"],
          },
        },
        {
          type: "combo",
          effects: [{ type: "damageEnemyHero", amount: 1 }],
        },
      ],
    }),
    weapon({
      role: "军用匕首",
      movie: "东方秃鹰",
      cost: 2,
      attack: 2,
      durability: 2,
      motif: "刃",
      palette: "steel",
      text: "装备：随机友方角色获得疾冲。连拍：随机友方角色获得 +1 攻击。",
      effects: [
        { type: "rushRandomFriendly" },
        {
          type: "combo",
          effects: [{ type: "buffRandomFriendly", attack: 1, health: 0 }],
        },
      ],
    }),
    role({
      star: "嘉禾群像",
      role: "宝芝林弟子",
      movie: "黄飞鸿",
      cost: 2,
      attack: 3,
      health: 2,
      motif: "林",
      palette: "jade",
      text: "特技：若己方英雄装备武器，自身 +0/+1。",
      effects: [{
        type: "whileArmed",
        effects: [{ type: "buffSelf", attack: 0, health: 1 }],
      }],
    }),
    spell({
      role: "佛山无影脚",
      movie: "黄飞鸿",
      cost: 3,
      motif: "影",
      palette: "gold",
      text: "对生命最低的敌方角色造成 3 点伤害。连拍：对敌方英雄造成 1 点伤害。",
      effects: [
        { type: "damageWeakestEnemyMinion", amount: 3 },
        {
          type: "combo",
          effects: [{ type: "damageEnemyHero", amount: 1 }],
        },
      ],
    }),
    weapon({
      role: "宝芝林长棍",
      movie: "黄飞鸿",
      cost: 3,
      attack: 3,
      durability: 2,
      motif: "棍",
      palette: "amber",
      text: "装备：随机友方角色获得 +1 攻击。连拍：抽 1 张牌。",
      effects: [
        { type: "buffRandomFriendly", attack: 1, health: 0 },
        { type: "combo", effects: [{ type: "draw", amount: 1 }] },
      ],
    }),
  ];

  const bossCards = [
    role({
      star: "成龙",
      role: "马如龙",
      movie: "A计划",
      cost: 4,
      attack: 4,
      health: 3,
      motif: "马",
      palette: "steel",
      rarity: "头目",
      text: "疾冲。连拍：获得 1 点临时戏力。",
      keywords: ["rush"],
      effects: [{
        type: "combo",
        effects: [{ type: "gainTempMana", amount: 1 }],
      }],
    }),
    role({
      star: "成龙",
      role: "陈家驹",
      movie: "警察故事",
      cost: 5,
      attack: 5,
      health: 4,
      motif: "警",
      palette: "crimson",
      rarity: "头目",
      text: "疾冲。特技：若己方英雄装备武器，对生命最低的敌方角色造成 2 点伤害。",
      keywords: ["rush"],
      effects: [{
        type: "whileArmed",
        effects: [{ type: "damageWeakestEnemyMinion", amount: 2 }],
      }],
    }),
    role({
      star: "李小龙",
      role: "唐龙",
      movie: "猛龙过江",
      cost: 7,
      attack: 6,
      health: 6,
      motif: "龙",
      palette: "gold",
      rarity: "最终头目",
      text: "疾冲。入场：抽 1 张牌。",
      keywords: ["rush"],
      effects: [{ type: "draw", amount: 1 }],
    }),
  ];

  return {
    normalCards,
    bossCards,
    allCards: [...normalCards, ...bossCards],
  };
});
