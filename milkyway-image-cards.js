(function (root, factory) {
  const builders =
    typeof module === "object" && module.exports
      ? require("./card-builders.js")
      : root?.MOVIE_BRAWL_CARD_BUILDERS;
  const cards = factory(builders);
  if (typeof module === "object" && module.exports) module.exports = cards;
  if (root) root.MOVIE_BRAWL_MILKYWAY_IMAGE_CARDS = cards;
})(typeof window !== "undefined" ? window : null, function (builders) {
  const { role, spell, weapon } = builders.studioCardBuilders({
    id: "milkyway-image",
    region: "银河映像",
  });
  const standoff = (effects) => ({ type: "standoff", effects });
  const deadline = (effects) => ({ type: "deadline", effects });

  const normalCards = [
    role({
      star: "刘青云", role: "黄阿狗", movie: "一个字头的诞生",
      cost: 1, attack: 1, health: 2, motif: "狗", palette: "steel",
      text: "时限：若出牌后剩余戏力不超过 1，自身获得 +1 攻击。",
      effects: [deadline([{ type: "buffSelf", attack: 1, health: 0 }])],
    }),
    spell({
      role: "命运岔路", movie: "一个字头的诞生", cost: 2,
      motif: "岔", palette: "violet",
      text: "召唤一个 1/1 江湖路人。时限：己方英雄恢复 1 点生命。",
      effects: [
        { type: "summon", amount: 1, token: { role: "江湖路人", attack: 1, health: 1, motif: "路" } },
        deadline([{ type: "healHero", amount: 1 }]),
      ],
    }),
    weapon({
      role: "江湖硬币", movie: "一个字头的诞生", cost: 2,
      attack: 2, durability: 1, motif: "币", palette: "amber",
      text: "2 点攻击，1 点耐久。对峙：若双方角色数相同，抽 1 张牌。",
      effects: [standoff([{ type: "draw", amount: 1 }])],
    }),
    role({
      star: "梁朝伟", role: "阿琛", movie: "暗花",
      cost: 2, attack: 2, health: 3, motif: "琛", palette: "steel",
      text: "对峙：对生命最低的敌方角色造成 1 点伤害。",
      effects: [standoff([{ type: "damageWeakestEnemyMinion", amount: 1 }])],
    }),
    spell({
      role: "关闸暗号", movie: "暗花", cost: 1,
      motif: "号", palette: "violet",
      text: "一个随机敌方角色失去 1 攻击。时限：抽 1 张牌。",
      effects: [
        { type: "weakenRandomEnemy", amount: 1 },
        deadline([{ type: "draw", amount: 1 }]),
      ],
    }),
    weapon({
      role: "凌晨左轮", movie: "暗花", cost: 3,
      attack: 3, durability: 2, motif: "轮", palette: "crimson",
      text: "3 点攻击，2 点耐久。时限：一个随机友方角色获得护盾。",
      effects: [deadline([{ type: "shieldRandomFriendly" }])],
    }),
    role({
      star: "黄秋生", role: "阿鬼", movie: "枪火",
      cost: 2, attack: 2, health: 3, motif: "鬼", palette: "steel",
      text: "对峙：自身获得 +1 攻击。",
      effects: [standoff([{ type: "buffSelf", attack: 1, health: 0 }])],
    }),
    spell({
      role: "商场站位", movie: "枪火", cost: 3,
      motif: "位", palette: "jade",
      text: "所有友方角色获得护盾。时限：抽 1 张牌。",
      effects: [
        { type: "shieldAllFriendly" },
        deadline([{ type: "draw", amount: 1 }]),
      ],
    }),
    weapon({
      role: "保镖手枪", movie: "枪火", cost: 2,
      attack: 2, durability: 2, motif: "保", palette: "steel",
      text: "2 点攻击，2 点耐久。对峙：一个随机友方角色获得疾冲。",
      effects: [standoff([{ type: "rushRandomFriendly" }])],
    }),
    role({
      star: "任达华", role: "乐少", movie: "黑社会",
      cost: 3, attack: 2, health: 4, motif: "乐", palette: "amber",
      text: "对峙：抽 1 张牌。",
      effects: [standoff([{ type: "draw", amount: 1 }])],
    }),
    weapon({
      role: "龙头棍", movie: "黑社会", cost: 3,
      attack: 2, durability: 3, motif: "棍", palette: "amber",
      text: "2 点攻击，3 点耐久。时限：一个随机友方角色 +1/+1。",
      effects: [deadline([{ type: "buffRandomFriendly", attack: 1, health: 1 }])],
    }),
    spell({
      role: "票箱点算", movie: "黑社会", cost: 2,
      motif: "票", palette: "amber",
      text: "召唤两个 1/1 社团票委。对峙：己方英雄恢复 1 点生命。",
      effects: [
        { type: "summon", amount: 2, token: { role: "社团票委", attack: 1, health: 1, motif: "票" } },
        standoff([{ type: "healHero", amount: 1 }]),
      ],
    }),
    role({
      star: "黄秋生", role: "阿火", movie: "放·逐",
      cost: 3, attack: 3, health: 3, motif: "火", palette: "crimson",
      text: "时限：一个随机友方角色获得护盾。",
      effects: [deadline([{ type: "shieldRandomFriendly" }])],
    }),
    spell({
      role: "澳门饭局", movie: "放·逐", cost: 2,
      motif: "饭", palette: "jade",
      text: "所有友方角色获得 +1 攻击。对峙：己方英雄恢复 1 点生命。",
      effects: [
        { type: "buffAllFriendly", attack: 1, health: 0 },
        standoff([{ type: "healHero", amount: 1 }]),
      ],
    }),
    weapon({
      role: "旧式手枪", movie: "放·逐", cost: 2,
      attack: 2, durability: 2, motif: "旧", palette: "steel",
      text: "2 点攻击，2 点耐久。对峙：抽 1 张牌。",
      effects: [standoff([{ type: "draw", amount: 1 }])],
    }),
  ];

  const bossCards = [
    role({
      star: "刘德华", role: "张彼德", movie: "暗战",
      cost: 5, attack: 4, health: 5, motif: "彼", palette: "violet",
      rarity: "头目", text: "疾冲。时限：抽 1 张牌。",
      keywords: ["rush"], effects: [deadline([{ type: "draw", amount: 1 }])],
    }),
    role({
      star: "任达华", role: "何文展", movie: "PTU",
      cost: 5, attack: 4, health: 6, motif: "展", palette: "steel",
      rarity: "头目", text: "嘲讽。时限：己方英雄恢复 2 点生命。",
      keywords: ["taunt"], effects: [deadline([{ type: "healHero", amount: 2 }])],
    }),
    role({
      star: "刘青云", role: "陈桂彬", movie: "神探",
      cost: 6, attack: 5, health: 6, motif: "彬", palette: "violet",
      rarity: "最终头目", text: "对峙：对生命最低的敌方角色造成 2 点伤害。",
      effects: [standoff([{ type: "damageWeakestEnemyMinion", amount: 2 }])],
    }),
  ];

  return { normalCards, bossCards, allCards: [...normalCards, ...bossCards] };
});
