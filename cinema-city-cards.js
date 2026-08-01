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
    root.MOVIE_BRAWL_CINEMA_CITY_CARDS = cards;
  }
})(typeof window !== "undefined" ? window : null, function (builders) {
  const { role, spell, weapon } = builders.studioCardBuilders({
    id: "cinema-city",
    region: "新艺城片场",
  });

  const normalCards = [
    role({
      star: "新艺城群像",
      role: "林亚珍",
      movie: "鬼马智多星",
      cost: 1,
      attack: 1,
      health: 2,
      motif: "珍",
      palette: "teal",
      text: "拍档：若另有友方角色，抽 1 张牌。",
      effects: [{
        type: "withPartner",
        effects: [{ type: "draw", amount: 1 }],
      }],
    }),
    spell({
      role: "智多星布局",
      movie: "鬼马智多星",
      cost: 2,
      motif: "计",
      palette: "amber",
      text: "使一个其他友方角色转场回到手牌，其费用降低 1；抽 1 张牌。",
      effects: [
        { type: "returnFriendlyToHand", costAdjustment: -1 },
        { type: "draw", amount: 1 },
      ],
    }),
    weapon({
      role: "机关雨伞",
      movie: "鬼马智多星",
      cost: 2,
      attack: 2,
      durability: 1,
      motif: "伞",
      palette: "crimson",
      text: "拍档：若场上有友方角色，使一个随机友方角色获得护盾。",
      effects: [{
        type: "withPartner",
        effects: [{ type: "shieldRandomFriendly" }],
      }],
    }),
    role({
      star: "新艺城群像",
      role: "古志明",
      movie: "阴阳错",
      cost: 2,
      attack: 2,
      health: 3,
      motif: "明",
      palette: "steel",
      text: "拍档：己方英雄恢复 1 点生命。",
      effects: [{
        type: "withPartner",
        effects: [{ type: "healHero", amount: 1 }],
      }],
    }),
    role({
      star: "新艺城群像",
      role: "小瑜",
      movie: "阴阳错",
      cost: 3,
      attack: 2,
      health: 3,
      motif: "瑜",
      palette: "violet",
      text: "护盾。亡语：抽 1 张牌。",
      keywords: ["shield", "deathrattle"],
      deathEffects: [{ type: "draw", amount: 1 }],
    }),
    spell({
      role: "人鬼错摸",
      movie: "阴阳错",
      cost: 2,
      motif: "错",
      palette: "teal",
      text: "召唤两个 1/1 错摸幻影。反转：己方英雄恢复 2 点生命。",
      effects: [
        {
          type: "summon",
          amount: 2,
          token: { role: "错摸幻影", attack: 1, health: 1, motif: "影" },
        },
        {
          type: "comeback",
          effects: [{ type: "healHero", amount: 2 }],
        },
      ],
    }),
    role({
      star: "新艺城群像",
      role: "开心少女",
      movie: "开心鬼",
      cost: 1,
      attack: 1,
      health: 2,
      motif: "笑",
      palette: "gold",
      text: "拍档：自身获得 +1 攻击。",
      effects: [{
        type: "withPartner",
        effects: [{ type: "buffSelf", attack: 1, health: 0 }],
      }],
    }),
    spell({
      role: "青春愿望",
      movie: "开心鬼",
      cost: 2,
      motif: "愿",
      palette: "crimson",
      text: "一个随机友方角色 +1/+1。反转：抽 1 张牌。",
      effects: [
        { type: "buffRandomFriendly", attack: 1, health: 1 },
        { type: "comeback", effects: [{ type: "draw", amount: 1 }] },
      ],
    }),
    weapon({
      role: "校园接力棒",
      movie: "开心鬼",
      cost: 2,
      attack: 1,
      durability: 3,
      motif: "棒",
      palette: "teal",
      text: "拍档：一个随机友方角色获得 +1 攻击。",
      effects: [{
        type: "withPartner",
        effects: [{ type: "buffRandomFriendly", attack: 1, health: 0 }],
      }],
    }),
    role({
      star: "周润发",
      role: "高秋",
      movie: "龙虎风云",
      cost: 3,
      attack: 3,
      health: 3,
      motif: "秋",
      palette: "steel",
      text: "反转：抽 1 张牌。",
      effects: [{
        type: "comeback",
        effects: [{ type: "draw", amount: 1 }],
      }],
    }),
    spell({
      role: "天台暗号",
      movie: "龙虎风云",
      cost: 2,
      motif: "号",
      palette: "teal",
      text: "一个随机敌方角色失去 2 点攻击。拍档：抽 1 张牌。",
      effects: [
        { type: "weakenRandomEnemy", amount: 2 },
        { type: "withPartner", effects: [{ type: "draw", amount: 1 }] },
      ],
    }),
    weapon({
      role: "警用左轮",
      movie: "龙虎风云",
      cost: 3,
      attack: 3,
      durability: 2,
      motif: "轮",
      palette: "crimson",
      text: "反转：对生命最低的敌方角色造成 2 点伤害。",
      effects: [{
        type: "comeback",
        effects: [{ type: "damageWeakestEnemyMinion", amount: 2 }],
      }],
    }),
    role({
      star: "新艺城群像",
      role: "狱中拍档",
      movie: "监狱风云",
      cost: 2,
      attack: 2,
      health: 3,
      motif: "友",
      palette: "amber",
      text: "拍档：自身获得 +1 攻击。",
      effects: [{
        type: "withPartner",
        effects: [{ type: "buffSelf", attack: 1, health: 0 }],
      }],
    }),
    spell({
      role: "牢房换位",
      movie: "监狱风云",
      cost: 1,
      motif: "换",
      palette: "steel",
      text: "使一个其他友方角色转场回到手牌，其费用降低 1；使一个随机友方角色获得护盾。",
      effects: [
        { type: "returnFriendlyToHand", costAdjustment: -1 },
        { type: "shieldRandomFriendly" },
      ],
    }),
    weapon({
      role: "饭堂铁盘",
      movie: "监狱风云",
      cost: 2,
      attack: 2,
      durability: 2,
      motif: "盘",
      palette: "steel",
      text: "拍档：己方英雄恢复 1 点生命。",
      effects: [{
        type: "withPartner",
        effects: [{ type: "healHero", amount: 1 }],
      }],
    }),
  ];

  const bossCards = [
    role({
      star: "许冠杰",
      role: "King Kong",
      movie: "最佳拍档",
      cost: 4,
      attack: 4,
      health: 3,
      motif: "K",
      palette: "teal",
      rarity: "头目",
      text: "疾冲。拍档：抽 1 张牌。",
      keywords: ["rush"],
      effects: [{
        type: "withPartner",
        effects: [{ type: "draw", amount: 1 }],
      }],
    }),
    role({
      star: "林青霞",
      role: "曹云",
      movie: "刀马旦",
      cost: 5,
      attack: 4,
      health: 5,
      motif: "云",
      palette: "crimson",
      rarity: "头目",
      text: "护盾。拍档：一个随机友方角色 +1/+1。",
      keywords: ["shield"],
      effects: [{
        type: "withPartner",
        effects: [{ type: "buffRandomFriendly", attack: 1, health: 1 }],
      }],
    }),
    role({
      star: "狄龙",
      role: "宋子豪",
      movie: "英雄本色",
      cost: 6,
      attack: 5,
      health: 6,
      motif: "豪",
      palette: "amber",
      rarity: "最终头目",
      text: "反转：召唤一个 2/1 且具有疾冲的义气拍档。",
      effects: [{
        type: "comeback",
        effects: [{
          type: "summon",
          amount: 1,
          token: {
            role: "义气拍档",
            attack: 2,
            health: 1,
            motif: "义",
            keywords: ["rush"],
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
