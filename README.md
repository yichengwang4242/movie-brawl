# Movie Brawl

A small server-authoritative solo card game featuring characters from classic
Hong Kong and Mainland Chinese films and television series.

> Current version: `0.1.0` solo adventure MVP. Card balance and content are
> still in development. PVP, accounts, and cloud saves are not included yet.

![Shaw Studio adventure screen](docs/screenshots/shaw-adventure.jpg)

![Server-authoritative card battle](docs/screenshots/battle.jpg)

## Why I Built This Game

I have always loved Hong Kong cinema, especially nostalgic classics that carry
the texture and shared memories of their time. I am also a card game fan, so I
wanted to bring familiar screen characters and studio stories into a card
battler that can keep growing over time.

## Game Content

- 10 stars with 6 character cards each, for a total of 60 character cards.
- Instant Chinese and English switching across the interface, all 123 cards,
  adventure content, battle logs, and error messages.
- A 15-card beginner deck with four 1-cost cards, five 2-cost cards, four
  3-cost cards, and two core cards. The opening hand is guaranteed to include a
  1-cost, 2-cost, and 3-cost card.
- 105 Basic and Classic cards, plus 18 characters, spells, and weapons earned
  through the Shaw Studio adventure.
- Eight Shaw Studio stages. Stages 3 and 5 are mid-bosses, and stage 8 is the
  final boss.
- Defeating a standard boss for the first time offers a choice of three common
  cards. Mid-bosses and the final boss award their corresponding boss cards.
- Adventure progress and the collection are stored in a local server save.
  Locked studio cards cannot enter the player's deck.
- A 1v1 battle system with Film Power, decks, hands, boards, fatigue, and
  victory resolution.
- Three independent AI strategies: Easy, Normal, and Hard.
- Taunt, Shield, Rush, Lifesteal, Stun, Summon, Deathrattle, Retaliate, and
  Fusion mechanics.
- Weapons have Attack and Durability, allowing the hero to attack once per
  turn while equipped.
- Collection search and filtering, deck composition details, and local career
  records.

## Getting Started

On macOS, double-click the included `.command` launcher.

Alternatively, run this command from the project directory:

```bash
npm start
```

Then open <http://127.0.0.1:4173>.

The project requires Node.js 20 or later and has no third-party runtime
dependencies.

Your language choice is saved in the current browser. Chinese and English use
the same card rules, adventure progress, and `data/profile.json` save. Changing
language does not restart an active match.

## How to Play

1. Enter Shaw Studio from the Adventure screen and challenge its eight stages
   in order.
2. After defeating a standard boss, choose one of three cards. Mid-bosses and
   the final boss unlock their corresponding boss cards directly.
3. Reward cards replace the closest-cost Basic card of the same type, keeping
   the deck at 15 cards.
4. Progress is stored in `data/profile.json`. Delete this file to reset the
   adventure save.

## Project Structure

```text
.
├── index.html                 # Page structure
├── styles.css                # Visual design and responsive layout
├── app.js                    # Browser bootstrap
├── game-data.js              # Shared client/server card data
├── shaw-cards.js             # Shaw Studio reward cards
├── shaw-adventure.js         # Eight-stage adventure configuration
├── starter-cards.js          # Beginner common cards
├── assets/                   # Original game visual assets
├── localization/             # UI, card, film, adventure, and log translations
├── server.js                 # HTTP server and static asset entrypoint
├── client/
│   ├── game-controller.js    # Frontend flow controller
│   ├── i18n.js               # Browser localization entrypoint
│   ├── game-api-client.js    # Match API client
│   ├── battle-view.js        # Battle board view
│   ├── card-renderer.js      # Card and inspector rendering
│   ├── collection-view.js    # Collection view
│   ├── adventure-view.js     # Adventure map and stage details
│   ├── outcome-view.js       # Results and reward selection
│   └── feedback-view.js      # Loading, error, and outcome feedback
├── server/
│   ├── game-engine.js        # Public battle engine entrypoint
│   ├── game-service.js       # Match session management
│   ├── adventure/            # Catalog, saves, rewards, and boss mechanics
│   └── game/
│       ├── game-engine.js    # Action orchestration
│       ├── game-state.js     # Match state and lifecycle
│       ├── card-factory.js   # Deck and card instances
│       ├── combat-resolver.js # Attacks and damage
│       ├── effect-resolver.js # Card effects
│       ├── death-resolver.js # Deathrattles and death queue
│       ├── advanced-effect-handlers.js # Fusion and Retaliate buffs
│       ├── ai-director.js    # AI turn orchestration
│       ├── ai/               # Three AI difficulty strategies
│       └── game-serializer.js # Client-safe match state
└── test/
    ├── game-engine.test.js   # Core rule regression tests
    ├── i18n.test.js          # Chinese and English coverage
    └── architecture.test.js  # Module boundary checks
```

The browser only submits actions. The server validates and resolves Film Power
costs, legal targets, combat, card effects, AI turns, and victory through
`server/game-engine.js`. Standard effects are registered in `EffectResolver`,
while compound mechanics such as Fusion belong in `AdvancedEffectHandlers`.

Boss battles use a separate `BossEncounter` layer for stage rules and phase
effects. Reward cards use standard constructed-play data and never inherit a
boss's bonus health, exclusive weapon, or encounter ability.

## Testing

```bash
npm test
```

The test suite covers card data, the beginner mana curve, server-side action
validation, three AI strategies, combat keywords, Deathrattle resolution,
adventure progression and rewards, bilingual content, and architecture rules
that prevent the project from collapsing back into a monolith.

## Development Status

- Complete: server-authoritative battles, three AI difficulties, a 15-card
  beginner deck, the eight-stage Shaw Studio adventure, 123 cards, bilingual
  presentation, and local saves.
- In progress: stage balance, consistent card wording, animation, and audio
  feedback.
- Planned: more studios, deck building, save slots, and a complete tutorial.

## Content Notice

This is a non-commercial learning project and game prototype. The rights to
film and television titles, characters, and related names belong to their
respective owners. The interface and original visual assets in this repository
are included only to demonstrate game design and engineering work.
