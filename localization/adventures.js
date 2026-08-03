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
      kicker: "Solo Adventure · Studio One",
      subtitle: "Blades, fists, and the Thirty-Six Chambers",
      description:
        "Eight classic martial-arts trials where boss rules and card combinations matter more than oversized rewards.",
    },
    "golden-harvest": {
      name: "Golden Harvest Studio",
      kicker: "Solo Adventure · Studio Two",
      subtitle: "Fists, stunts, and the golden age of action comedy",
      description:
        "Eight Golden Harvest action classics. Encounter rules create the challenge while reward cards stay at normal deck-building power.",
    },
    "cinema-city": {
      name: "Cinema City Studio",
      kicker: "Solo Adventure · Studio Three",
      subtitle: "Caper tricks, perfect partners, and story reversals",
      description:
        "Eight Cinema City genre adventures built around Partner, Comeback, and clever returns to hand.",
    },
    "d-and-b": {
      name: "D & B Studio",
      kicker: "Solo Adventure · Studio Four",
      subtitle: "Urban creativity and professional action on two tracks",
      description:
        "Eight D & B film adventures. Read the board with Solo, Two-Track, and Handover while shifting between commercial genre craft and creative drama.",
    },
    "golden-princess": {
      name: "Golden Princess Circuit",
      kicker: "Solo Adventure · Studio Five",
      subtitle: "Programming, premieres, and midnight double features",
      description:
        "Eight classics from the Golden Princess circuit and library. Open each turn with Premiere, then switch card types to build a Double Feature.",
    },
    "milkyway-image": {
      name: "Milkyway Image",
      kicker: "Solo Adventure · Studio Six",
      subtitle: "Cold formations, fateful standoffs, and ticking clocks",
      description:
        "Eight Milkyway Image crime classics. Match the opposing formation for Standoff, then spend down to the wire to trigger Deadline.",
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
      "golden-harvest-01-factory": {
        title: "The Ice Factory",
        bossName: "Boss Mi",
        mechanicTitle: "Factory Blockade",
        mechanicText:
          "At the start of the boss turn, summon a 2/1 Ice Factory Enforcer if the enemy board is empty.",
      },
      "golden-harvest-02-spooky": {
        title: "Paper Altar",
        bossName: "Sorcerer Chin",
        mechanicTitle: "Borrowed Spirit",
        mechanicText:
          "Every second boss turn, the altar summons a 1/1 Paper Effigy.",
      },
      "golden-harvest-03-project-a": {
        title: "Clock Tower Chase",
        bossName: "Dragon Ma",
        mechanicTitle: "Clock Tower Drop",
        mechanicText:
          "Every third boss turn, deal 1 damage to all your characters. If you control none, damage your hero instead.",
      },
      "golden-harvest-04-lucky-stars": {
        title: "Lucky Stars in Action",
        bossName: "Stone-Faced Killer",
        mechanicTitle: "Lucky Stars Relay",
        mechanicText:
          "At the start of the boss turn, summon a 1/1 Lucky Star Partner if the enemy board has fewer than three characters.",
      },
      "golden-harvest-05-police-story": {
        title: "Mall Pursuit",
        bossName: "Chan Ka-kui",
        mechanicTitle: "Mall Stunt",
        mechanicText:
          "The first time the boss falls to 18 Health or less, all enemy characters gain +1 Attack and a 2/2 Rush officer joins them.",
      },
      "golden-harvest-06-condors": {
        title: "Jungle Raid",
        bossName: "The General",
        mechanicTitle: "Crossfire",
        mechanicText:
          "Every second boss turn, deal 1 damage to your highest-Attack character. With an empty board, summon an Assault Trooper.",
      },
      "golden-harvest-07-lion": {
        title: "Lion Dance Arena",
        bossName: "Yim Chun-tung",
        mechanicTitle: "Lion Dance High-Pole",
        mechanicText:
          "Every second boss turn, an enemy character gains +1 Attack. If none are present, summon a 2/1 Rush Lion Dancer.",
      },
      "golden-harvest-08-colosseum": {
        title: "The Colosseum",
        bossName: "Tang Lung",
        mechanicTitle: "Three Jeet Kune Do Forms",
        mechanicText:
          "Cycle through Probe, Intercept, and Assault to summon a Rush fighter, increase Attack, then deal 1 damage to all your characters.",
      },
      "cinema-city-01-clues": {
        title: "The Mastermind's Game",
        bossName: "The House Dealer",
        mechanicTitle: "Striving Room Brainstorm",
        mechanicText:
          "At the start of the boss turn, summon a 1/1 Striving Room Partner if the enemy board has fewer than two characters.",
      },
      "cinema-city-02-yinyang": {
        title: "Mortal and Spirit Missteps",
        bossName: "Returning Spirit",
        mechanicTitle: "Yin-Yang Misdirection",
        mechanicText:
          "Every second boss turn, a random friendly character loses 1 Attack. With an empty board, the boss restores 1 Health.",
      },
      "cinema-city-03-aces": {
        title: "The Great Diamond Chase",
        bossName: "King Kong",
        mechanicTitle: "Perfect Partners",
        mechanicText:
          "With fewer than two enemy characters, summon a 2/1 Hi-Tech Partner. Otherwise, an enemy character gains +1/+1.",
      },
      "cinema-city-04-happy-ghost": {
        title: "A Night of Schoolyard Wishes",
        bossName: "Happy Ghost",
        mechanicTitle: "Youthful Wishes",
        mechanicText:
          "Cycle through three wishes: summon a Happy Classmate, grant Shield, then draw a card.",
      },
      "cinema-city-05-opera": {
        title: "Three Threads on One Stage",
        bossName: "Tsao Wan",
        mechanicTitle: "Three-Way Convergence",
        mechanicText:
          "While the enemy controls fewer than three characters, summon a 1/1 Opera Companion. At three, all enemies gain +1 Attack.",
      },
      "cinema-city-06-city-on-fire": {
        title: "The Rooftop Undercover Game",
        bossName: "Fu",
        mechanicTitle: "Undercover Signal",
        mechanicText:
          "Every second boss turn, your highest-Attack character loses 1 Attack. With an empty board, your hero takes 1 damage.",
      },
      "cinema-city-07-prison": {
        title: "Prison Roll Call",
        bossName: "Officer Scarface",
        mechanicTitle: "Forced Transfer",
        mechanicText:
          "Every third boss turn, return your lowest-Health character to your hand and increase its Cost by 1.",
      },
      "cinema-city-08-heroic": {
        title: "A Heroic Night at the Docks",
        bossName: "Sung Tse-ho",
        mechanicTitle: "A Better Brotherhood",
        mechanicText:
          "Cycle through summoning a Brotherhood Partner, drawing with temporary Film Power, and granting all enemies +1 Attack.",
      },
      "d-and-b-01-pom-pom": {
        title: "The Bungled Patrol",
        bossName: "Ah Chau and Beethoven",
        mechanicTitle: "Police Shift",
        mechanicText:
          "On odd boss turns, add a Patrol Officer. On even turns, an enemy character gains +1 Attack.",
      },
      "d-and-b-02-fortune": {
        title: "Windfall at the Estate",
        bossName: "The Bill Family",
        mechanicTitle: "Three Beats of Fortune",
        mechanicText:
          "Cycle through winning, protecting the windfall, and new trouble: the boss draws, increases a character's Health, then deals 1 damage to your hero.",
      },
      "d-and-b-03-yes-madam": {
        title: "The Microfilm Case",
        bossName: "Inspector Ng",
        mechanicTitle: "Evidence Scramble",
        mechanicText:
          "When the enemy board is not ahead, summon a 2/1 Royal Inspector. When it is ahead, Stun a random friendly character.",
      },
      "d-and-b-04-lunatics": {
        title: "Street Outreach",
        bossName: "Mr Tsui",
        mechanicTitle: "Street Reality",
        mechanicText:
          "Every second boss turn, each side's lowest-Health character takes 1 damage. With an empty friendly board, your hero takes the damage.",
      },
      "d-and-b-05-autumn": {
        title: "Autumn in Chinatown",
        bossName: "Samuel Pang",
        mechanicTitle: "Far-from-Home Support",
        mechanicText:
          "With an empty enemy board, summon a Chinatown Neighbor. A lone enemy gains +1/+1; a wider board restores 1 boss Health.",
      },
      "d-and-b-06-warriors": {
        title: "The Frontier Escort",
        bossName: "Ming-ming",
        mechanicTitle: "International Action Unit",
        mechanicText:
          "Cycle through summoning a Rush operative, granting Shield, then dealing 1 damage to all your characters.",
      },
      "d-and-b-07-last-victory": {
        title: "One Last Game in Mong Kok",
        bossName: "Hung",
        mechanicTitle: "Debt Collection",
        mechanicText:
          "The first time the boss falls to 18 Health or less, draw two cards and give all enemy characters +1 Attack.",
      },
      "d-and-b-08-dawn": {
        title: "Waiting Through the War",
        bossName: "Yip Kim-fai",
        mechanicTitle: "Three Wartime Acts",
        mechanicText:
          "Cycle through resistance, air raid, and rations: summon a Taunt defender, damage both boards, then draw and restore Health.",
      },
      "golden-princess-01-ghost": {
        title: "Premiere Night at Lan Ro Temple",
        bossName: "Black Mountain Demon",
        mechanicTitle: "Spirit-Lantern Programme",
        mechanicText:
          "On odd boss turns, summon a 1/1 Lan Ro Spirit Lantern. On even turns, a random friendly character loses 1 Attack.",
      },
      "golden-princess-02-killer": {
        title: "The Church of Two Gunmen",
        bossName: "Wong Hoi",
        mechanicTitle: "Doves in the Crossfire",
        mechanicText:
          "When the enemy board is not ahead, summon a 2/1 Rush Contract Gunman. When it is ahead, deal 1 damage to your lowest-Health character.",
      },
      "golden-princess-03-contract": {
        title: "One Last Contract",
        bossName: "Ah Jong",
        mechanicTitle: "The Killer's Contract",
        mechanicText:
          "Alternate between marking your highest-Attack character with Stun and dealing 1 damage to all your characters.",
      },
      "golden-princess-04-along": {
        title: "The Final Lap",
        bossName: "Champion Racer",
        mechanicTitle: "Father and Son Finish",
        mechanicText:
          "Every second boss turn, the lowest-Health enemy gains +1/+1. With an empty enemy board, summon a 1/2 Track Apprentice.",
      },
      "golden-princess-05-sunset": {
        title: "Escape into the Saigon Sunset",
        bossName: "Chow Ying-kit",
        mechanicTitle: "Sunset Convoy",
        mechanicText:
          "The first time the boss falls to 18 Health or less, equip a 3/2 Border Pistol and summon a 2/2 Escape Companion.",
      },
      "golden-princess-06-swordsman": {
        title: "Battle for the Sacred Score",
        bossName: "Ren Woxing",
        mechanicTitle: "Zither and Sword in Concert",
        mechanicText:
          "On odd boss turns, an enemy character gains Shield. On even turns, an enemy character gains +1 Attack.",
      },
      "golden-princess-07-moment": {
        title: "Midnight Run through Mong Kok",
        bossName: "Brother Seven",
        mechanicTitle: "The Midnight Slot",
        mechanicText:
          "On odd boss turns, summon a 2/1 Rush Midnight Rider. On even turns, both heroes take 1 damage.",
      },
      "golden-princess-08-hard-boiled": {
        title: "Hospital Midnight Double Feature",
        bossName: "Inspector Tequila Yuen",
        mechanicTitle: "Midnight Double Feature",
        mechanicText:
          "Cycle through a Premiere that summons and draws, an Intermission that heals and grants Shield, and a Midnight Show that damages your board.",
      },
      "milkyway-image-01-prefix": {
        title: "Two Roads through the Underworld",
        bossName: "Dealer of Fate",
        mechanicTitle: "Two Paths through Fate",
        mechanicText:
          "On odd boss turns, summon a 1/1 Underworld Drifter. On even turns, an enemy gains +1/+1; with an empty board, your hero takes 1 damage.",
      },
      "milkyway-image-02-longest-nite": {
        title: "Macau's Longest Night",
        bossName: "Mr Hung",
        mechanicTitle: "The Longest Deadlock",
        mechanicText:
          "At the start of each boss turn, Stun a random friendly character. With an empty board, your hero takes 1 damage.",
      },
      "milkyway-image-03-running-out": {
        title: "The Seventy-Two Hour Game",
        bossName: "Cheung Peter",
        mechanicTitle: "72-Hour Countdown",
        mechanicText:
          "Cycle through a boss draw, reducing your highest-Attack character by 1 Attack, then dealing 1 damage to your hero.",
      },
      "milkyway-image-04-mission": {
        title: "Five Men in the Mall",
        bossName: "Boss Lung",
        mechanicTitle: "Silent Bodyguard Formation",
        mechanicText:
          "While the enemy controls fewer than three characters, summon a 1/2 Silent Bodyguard. The first completed formation grants all enemies +1 Attack.",
      },
      "milkyway-image-05-ptu": {
        title: "The Lost Gun in Tsim Sha Tsui",
        bossName: "Sergeant Ho",
        mechanicTitle: "Lost-Gun Search Line",
        mechanicText:
          "On odd boss turns, add a 1/1 PTU Officer. On even turns, your highest-Attack character loses 1 Attack.",
      },
      "milkyway-image-06-election": {
        title: "The Dragon Head Election",
        bossName: "Big D",
        mechanicTitle: "Society Election Night",
        mechanicText:
          "Cycle through canvassing, guarding the ballot, and the result: the boss draws, grants Shield, then gives all enemies +1 Attack.",
      },
      "milkyway-image-07-exiled": {
        title: "One Last Dinner in Macau",
        bossName: "Boss Fay",
        mechanicTitle: "Countdown to Exile",
        mechanicText:
          "The first time the boss falls to 18 Health or less, summon two 2/1 Rush Pursuers.",
      },
      "milkyway-image-08-detective": {
        title: "Seven Faces in the Mirror Room",
        bossName: "Bun",
        mechanicTitle: "Seven Personalities",
        mechanicText:
          "Cycle through Aggression, Fear, and Greed: summon a Rush persona, heal and grant Shield, then damage your lowest-Health character.",
      },
    },
  };
});
