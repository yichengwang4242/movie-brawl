(function (root, factory) {
  const builders =
    typeof module === "object" && module.exports
      ? require("./card-builders.js")
      : root?.MOVIE_BRAWL_CARD_BUILDERS;
  const cards = factory(builders);
  if (typeof module === "object" && module.exports) module.exports = cards;
  if (root) root.MOVIE_BRAWL_GOLDEN_PRINCESS_CARDS = cards;
})(typeof window !== "undefined" ? window : null, function (builders) {
  const { role, spell, weapon } = builders.studioCardBuilders({
    id: "golden-princess",
    region: "金公主院线",
  });

  const premiere = (effects) => ({ type: "premiere", effects });
  const doubleFeature = (effects) => ({ type: "doubleFeature", effects });

  const normalCards = [
    role({
      star: "金公主群像", role: "宁采臣", movie: "倩女幽魂",
      cost: 1, attack: 1, health: 2, motif: "书", palette: "violet",
      text: "首映：抽 1 张牌。",
      effects: [premiere([{ type: "draw", amount: 1 }])],
    }),
    spell({
      role: "兰若夜雨", movie: "倩女幽魂", cost: 2,
      motif: "雨", palette: "violet",
      text: "召唤两个 1/1 幽灯。连映：己方英雄恢复 1 点生命。",
      effects: [
        { type: "summon", amount: 2, token: { role: "兰若幽灯", attack: 1, health: 1, motif: "灯" } },
        doubleFeature([{ type: "healHero", amount: 1 }]),
      ],
    }),
    weapon({
      role: "桃木法剑", movie: "倩女幽魂", cost: 2,
      attack: 2, durability: 2, motif: "符", palette: "amber",
      text: "2 点攻击，2 点耐久。首映：一个随机友方角色获得护盾。",
      effects: [premiere([{ type: "shieldRandomFriendly" }])],
    }),
    role({
      star: "周润发", role: "李鹰", movie: "喋血双雄",
      cost: 2, attack: 2, health: 3, motif: "鹰", palette: "steel",
      text: "连映：对生命最低的敌方角色造成 1 点伤害。",
      effects: [doubleFeature([{ type: "damageWeakestEnemyMinion", amount: 1 }])],
    }),
    spell({
      role: "教堂白鸽", movie: "喋血双雄", cost: 1,
      motif: "鸽", palette: "steel",
      text: "一个随机友方角色获得护盾。首映：己方英雄恢复 1 点生命。",
      effects: [
        { type: "shieldRandomFriendly" },
        premiere([{ type: "healHero", amount: 1 }]),
      ],
    }),
    weapon({
      role: "警探配枪", movie: "喋血双雄", cost: 3,
      attack: 3, durability: 2, motif: "枪", palette: "crimson",
      text: "3 点攻击，2 点耐久。连映：抽 1 张牌。",
      effects: [doubleFeature([{ type: "draw", amount: 1 }])],
    }),
    role({
      star: "周润发", role: "阿郎", movie: "阿郎的故事",
      cost: 3, attack: 3, health: 2, motif: "郎", palette: "crimson",
      text: "亡语：抽 1 张牌。首映：己方英雄恢复 1 点生命。",
      keywords: ["deathrattle"],
      deathEffects: [{ type: "draw", amount: 1 }],
      effects: [premiere([{ type: "healHero", amount: 1 }])],
    }),
    spell({
      role: "父子冲线", movie: "阿郎的故事", cost: 2,
      motif: "线", palette: "amber",
      text: "一个随机友方角色 +1/+1。连映：抽 1 张牌。",
      effects: [
        { type: "buffRandomFriendly", attack: 1, health: 1 },
        doubleFeature([{ type: "draw", amount: 1 }]),
      ],
    }),
    weapon({
      role: "旧赛道头盔", movie: "阿郎的故事", cost: 2,
      attack: 1, durability: 3, motif: "盔", palette: "steel",
      text: "1 点攻击，3 点耐久。首映：一个随机友方角获得护盾。",
      effects: [premiere([{ type: "shieldRandomFriendly" }])],
    }),
    role({
      star: "许冠杰", role: "令狐冲", movie: "笑傲江湖",
      cost: 3, attack: 3, health: 3, motif: "冲", palette: "jade",
      text: "连映：自身获得 +1 攻击。",
      effects: [doubleFeature([{ type: "buffSelf", attack: 1, health: 0 }])],
    }),
    spell({
      role: "笑傲曲谱", movie: "笑傲江湖", cost: 2,
      motif: "曲", palette: "jade",
      text: "抽 1 张牌。首映：己方英雄恢复 2 点生命。",
      effects: [
        { type: "draw", amount: 1 },
        premiere([{ type: "healHero", amount: 2 }]),
      ],
    }),
    weapon({
      role: "独孤长剑", movie: "笑傲江湖", cost: 3,
      attack: 2, durability: 3, motif: "剑", palette: "jade",
      text: "2 点攻击，3 点耐久。连映：一个随机友方角获得疾冲。",
      effects: [doubleFeature([{ type: "rushRandomFriendly" }])],
    }),
    role({
      star: "刘德华", role: "华弟", movie: "天若有情",
      cost: 3, attack: 4, health: 2, motif: "华", palette: "crimson",
      text: "疾冲。首映：一个随机友方角获得护盾。",
      keywords: ["rush"],
      effects: [premiere([{ type: "shieldRandomFriendly" }])],
    }),
    role({
      star: "金公主群像", role: "JoJo", movie: "天若有情",
      cost: 2, attack: 1, health: 3, motif: "J", palette: "violet",
      text: "连映：抽 1 张牌。",
      effects: [doubleFeature([{ type: "draw", amount: 1 }])],
    }),
    weapon({
      role: "亡命摩托", movie: "天若有情", cost: 3,
      attack: 2, durability: 2, motif: "车", palette: "crimson",
      text: "2 点攻击，2 点耐久。首映：获得 1 点临时戏力。",
      effects: [premiere([{ type: "gainTempMana", amount: 1 }])],
    }),
  ];

  const bossCards = [
    role({
      star: "周润发", role: "小庄", movie: "喋血双雄",
      cost: 5, attack: 5, health: 4, motif: "庄", palette: "steel",
      rarity: "头目", text: "疾冲。首映：抽 1 张牌。",
      keywords: ["rush"],
      effects: [premiere([{ type: "draw", amount: 1 }])],
    }),
    role({
      star: "梅艳芳", role: "周英杰", movie: "英雄本色III夕阳之歌",
      cost: 5, attack: 4, health: 5, motif: "杰", palette: "amber",
      rarity: "头目", text: "护盾。连映：所有友方角色获得 +1 攻击。",
      keywords: ["shield"],
      effects: [doubleFeature([{ type: "buffAllFriendly", attack: 1, health: 0 }])],
    }),
    role({
      star: "周润发", role: "袁浩云", movie: "辣手神探",
      cost: 6, attack: 5, health: 6, motif: "云", palette: "crimson",
      rarity: "最终头目", text: "反伤 1。首映：对生命最低的敌方角色造成 2 点伤害。",
      keywords: ["reflect"], reflect: 1,
      effects: [premiere([{ type: "damageWeakestEnemyMinion", amount: 2 }])],
    }),
  ];

  return { normalCards, bossCards, allCards: [...normalCards, ...bossCards] };
});
