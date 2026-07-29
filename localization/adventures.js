(function (root, factory) {
  const translations = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = translations;
  }
  if (root) root.MOVIE_BRAWL_ADVENTURES_EN = translations;
})(typeof window !== "undefined" ? window : null, function () {
  return {
    shaw: {
      name: "Shaw Studio",
      subtitle: "Blades, fists, and the Thirty-Six Chambers",
      description:
        "Eight classic martial-arts trials where boss rules and card combinations matter more than oversized rewards.",
    },
    stages: {
      "shaw-01-inn": {
        title: "Trial at the Inn",
        bossName: "Jade-Faced Tiger",
        mechanicTitle: "Inn Ambush",
        mechanicText:
          "At the start of the boss turn, summon a 1/1 Bandit Minion if the enemy board has fewer than two characters.",
      },
      "shaw-02-guillotine": {
        title: "Death on a Flying Blade",
        bossName: "Flying Guillotine Commander",
        mechanicTitle: "Marked for Death",
        mechanicText:
          "Every second boss turn, deal 1 damage to your lowest-Health character. If you control none, damage your hero instead.",
      },
      "shaw-03-swallow": {
        title: "The Golden Swallow Arrives",
        bossName: "Golden Swallow",
        mechanicTitle: "Vanishing Swallow",
        mechanicText:
          "At the start of every even turn, an enemy character gains Shield. If none are present, summon Swallow Shadow.",
      },
      "shaw-04-venoms": {
        title: "Venom House Labyrinth",
        bossName: "Centipede",
        mechanicTitle: "Five Venoms Formation",
        mechanicText:
          "At the start of every even turn, an enemy character gains Retaliate 1. The effect does not stack without limit.",
      },
      "shaw-05-blade": {
        title: "Rebirth of the Broken Blade",
        bossName: "Fang Gang",
        mechanicTitle: "One-Armed Awakening",
        mechanicText:
          "The first time the boss falls to 18 Health or less, equip a 4/2 Broken Blade. The reward card does not inherit this boss weapon.",
      },
      "shaw-06-golden-arm": {
        title: "The Golden Arm",
        bossName: "Golden Arm Kid",
        mechanicTitle: "Golden Arm Training",
        mechanicText:
          "Every second boss turn, one enemy character gains +1 Attack, forcing you to contest the board.",
      },
      "shaw-07-lotus": {
        title: "White Lotus Altar",
        bossName: "White Lotus Chief",
        mechanicTitle: "White Lotus Altar",
        mechanicText:
          "While the boss controls a character, restore 1 Health. With an empty board, summon a 1/2 White Lotus Acolyte.",
      },
      "shaw-08-chambers": {
        title: "The Thirty-Six Chambers",
        bossName: "San Te",
        mechanicTitle: "Chamber-by-Chamber Training",
        mechanicText:
          "Cycle through Wooden Dummy, Strength, and Weapons training to summon defenders, increase Health, and draw cards.",
      },
    },
  };
});
