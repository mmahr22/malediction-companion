# Malediction Companion

> *"To step into the shadow of a dying god."*

A mobile + web companion app for the dark fantasy miniatures card game **[Malediction](https://loot-studios.com/malediction)**. Replaces tokens, dice, and pen-and-paper for 2–6 players — track Mastery, Echo, Husks, initiative, and round progression while keeping your eyes on the battlefield.

Built with React Native + Expo. Runs on **iOS**, **Android**, and **web**.

---

**[Quick Start](#quick-start)** · **[Features](#features)** · **[Card Database](#card-database)** · **[Tech Stack](#tech-stack)** · **[Project Structure](#project-structure)** · **[Roadmap](#roadmap)**

---

## Quick Start

```bash
git clone https://github.com/mmahr22/malediction-companion.git
cd malediction-companion
npm install
npx expo start        # mobile — scan QR with Expo Go
npx expo start --web  # browser
```

> **nvm users:** prefix commands with `PATH=~/.nvm/versions/node/v24.16.0/bin:$PATH`

---

## Features

### Game Tracker

- **2–6 player support** — table layout engine rotates top-row panels 180° so every player faces their own screen edge
- **Mastery tracking** — tap the top or bottom half of a panel to increment / decrement; large animated gold display with spring feedback
- **Echo tracking** — compact +/− widget per player, auto-funded each round via income formula `min(round, 5) × 2`
- **Husk tracker** — per-player objective control; each husk is worth ±10 Mastery; total husks enforced by the active Mastery goal (2 for beginner, 4 otherwise)
- **Round tracker** — tap to advance; Echo distributes automatically to all players
- **Initiative tracker** — sword icon on each player's name pill; tap to claim (transfers from previous holder, persists through the round)
- **Win condition** — configurable Mastery goal (25 / 45 / 50 / 55 / 60); opt-in **Claim Victory** button appears when goal is reached; victory overlay with final stats
- **Hold-to-repeat** — hold any +/− button for accelerating repeat: 400ms delay → ×10 burst → ×10 burst → rapid fire at 150ms
- **Full persistence** — game state survives app close / reopen via AsyncStorage; schema migration handled automatically

### Seeker Selection

All 10 launch Seekers with full card art, faction sigils, Legacy card details, and starting Echo:

| Seeker | Faction(s) | Starting Echo | Legacy |
|---|---|---|---|
| Sigrith Andravos | Order | 25 | Andravon |
| Vorendal, the Dreadheart | Legion | 25 | Heartlock |
| Thundersteps | Primal | 25 | Storm's Eye |
| Polinore, Prime Archivist | Conclave | 25 | Runefold Gauntlet |
| Auric Evenhand | Order / Primal | 20 | Will of the Forge |
| Countess Morrida Umberland | Legion / Conclave | 20 | Soul-Stitcher |
| In'Gor, the Spiritbound | Primal / Legion | 20 | Effigy of Chaos |
| Londriel, Spellwarden | Conclave / Order | 20 | Ark of Lamentation |
| Griza, Lingering Wound | Order / Legion | 20 | Ihreniv |
| Kar-Mamok | Primal / Conclave | 20 | Liena, Who Dreams |

Single-faction Seekers start with 25 Echo; dual-faction Seekers start with 20.

### Player Profiles

- Create named profiles with a color accent (8 swatches)
- Profile picker in the setup flow — tap to pre-fill a player slot
- Per-profile stats computed from game history: W/G record, win %, favorite Seeker
- History tab shows profile cards with click-to-filter on the game log

### Game History

- Every completed game is recorded (via victory claim or End Game)
- Stores: date, Mastery goal, rounds played, all player names + Seekers + final Mastery + husks held
- Persistent log across sessions, separate from game state
- Clear all option

### Card Database

Full reference for all **184 cards** in the Malediction base set — see [Card Database](#card-database) below.

---

## Card Database

184 cards scraped from [heraldhelper.com](https://heraldhelper.com) via `scrape-cards.mjs`, covering:

| Type | Count | Description |
|---|---|---|
| Unit | 65 | Deployable miniatures with combat stats |
| Spell | 74 | Activated abilities (traits: Channel, Swift) |
| Attachment | 31 | Equipment and relics (traits: Item, Relic) |
| Legacy | 10 | Seeker-specific passive upgrades |
| Terrain | 4 | Board elements |

**Per card:** name, rank (Basic / Elite / Unique / Legendary), faction(s), type, traits, echo cost, full stats (Accuracy, Power, Range, Speed, Defense, Max Health, Base Size), all rule text abilities, and card art image.

**Filters:** Type · Rarity · Trait (Seeker, Channel, Swift, Item, Relic) · Search by name

**Card detail view:** side-by-side layout — art on the left, stat table on the right, full rules text below. Tap the card art to open a full-screen lightbox.

### Re-scraping

If card data changes upstream, re-run the scraper:

```bash
node scrape-cards.mjs   # outputs scraped-cards.json
```

Then regenerate `src/data/cards.ts`:

```js
node -e "
const cards = JSON.parse(require('fs').readFileSync('./scraped-cards.json','utf8'));
const NUMERIC = ['accuracy','powerHit','powerGraze','range','speed','defense','maxHealth'];
const cleaned = cards.map(c => {
  const out = { ...c };
  NUMERIC.forEach(k => { if (out[k] === null) delete out[k]; });
  return out;
});
require('fs').writeFileSync('./src/data/cards.ts',
  \"import { Card } from './types';\n\nexport const cards: Card[] = \" +
  JSON.stringify(cleaned, null, 2) + ';\n'
);
"
```

---

## Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | React Native + Expo | SDK 54 |
| Language | TypeScript | strict mode |
| State | Zustand v5 | `persist` + AsyncStorage |
| Navigation | React Navigation v7 | bottom tabs + native stack |
| Fonts | Cinzel / CinzelDecorative | `@expo-google-fonts` |
| Icons | MaterialCommunityIcons | `@expo/vector-icons` |
| Haptics | expo-haptics | bundled |
| Build | EAS Build | Android AAB |

### Notable Implementation Details

**Web / Zustand compatibility** — Metro redirects `zustand/middleware` to its CJS build on web to avoid an `import.meta` SyntaxError. Configured in `metro.config.js` via `resolveRequest`. Do not add a `babel.config.js` — it breaks native builds.

**Animated.spring on web** — `useNativeDriver: false` is required on all spring animations for web compatibility.

**Alert on web** — `Alert.alert` is a no-op on web. All confirmation dialogs use `Platform.OS === 'web' ? window.confirm(...) : Alert.alert(...)`.

---

## Project Structure

```
malediction-companion/
├── App.tsx                        # Font loading, root render
├── app.json                       # Expo config + EAS project ID
├── eas.json                       # EAS build profiles (dev / preview / production)
├── metro.config.js                # Zustand CJS fix for web
├── scrape-cards.mjs               # One-shot card data scraper
├── assets/
│   ├── factions/                  # faction-order/conclave/legion/primal.png
│   └── seekers/                   # 10 Seeker portrait JPGs
└── src/
    ├── data/
    │   ├── types.ts               # Core interfaces (Player, GameState, Card, PlayerProfile…)
    │   ├── cards.ts               # All 184 cards (generated)
    │   └── sampleSeekers.ts       # Seeker roster with stats, legacy, art
    ├── store/
    │   ├── gameStore.ts           # Active game state + actions
    │   ├── historyStore.ts        # Append-only game history log
    │   └── profileStore.ts        # Persistent player profiles
    ├── theme/
    │   ├── theme.ts               # Colors, fonts, spacing, radius
    │   └── factions.ts            # FACTION_COLORS, FACTION_IMAGES
    ├── navigation/
    │   ├── RootNavigator.tsx      # Bottom tabs (Game · Cards · History · Decks)
    │   └── types.ts               # CardsStackParamList
    ├── screens/
    │   ├── PlayerSetupScreen.tsx  # Pre-game lobby + profile picker
    │   ├── GameTrackerScreen.tsx  # Main game view
    │   ├── CardDatabaseScreen.tsx # Browse + filter 184 cards
    │   ├── CardDetailScreen.tsx   # Card art + stats + lightbox
    │   ├── GameHistoryScreen.tsx  # Per-profile stats + game log
    │   └── DecklistsScreen.tsx    # Scaffold (deck builder, coming soon)
    └── components/
        ├── PlayerPanel.tsx        # Per-player panel — Mastery, Echo, Husks, initiative
        ├── CounterControl.tsx     # Hold-to-repeat ±N control
        ├── HuskWidget.tsx         # Husk counter with cap enforcement
        ├── EchoWidget.tsx         # Echo +/− widget
        ├── RoundBar.tsx           # Fixed bottom bar
        ├── SeekerPickerModal.tsx  # Seeker selection
        ├── NewProfileModal.tsx    # Profile creation (name + color)
        └── FactionDots.tsx        # Faction icon row
```

---

## Visual Design

**Palette**

| Token | Hex | Usage |
|---|---|---|
| `background` | `#0B0710` | App background (near-black purple) |
| `surface` | `#1C1422` | Cards, modals, panels |
| `border` | `#3D2C4A` | Dividers, input outlines |
| `gold` | `#D4AF37` | Mastery, primary accent, active states |
| `purple` | `#8B5FBF` | Echo, secondary accent |
| `danger` | `#8C1F28` | Reset / destructive actions |
| `textPrimary` | `#F2E9E4` | Body text |
| `textMuted` | `#9C8AA5` | Labels, placeholders |

**Typography**
- `CinzelDecorative_700Bold` — app branding
- `Cinzel_600SemiBold` — headings, player names, large numbers, labels

**Factions**

| Faction | Accent |
|---|---|
| Order of the Shattered Throne | `#E8E8E8` silver |
| Legion of the Fallen | `#2A7A2A` dark green |
| Primal Blood | `#CC2200` deep red |
| Conclave of the Spheres | `#1A5FAD` blue |

---

## Android Build

The app is configured for EAS Build targeting the Google Play Store.

```bash
# Login (first time)
eas login

# Production build (outputs .aab for Play Store)
eas build --platform android --profile production
```

Build artifacts are managed by [Expo Application Services](https://expo.dev/eas).

---

## Roadmap

| Feature | Status |
|---|---|
| Game tracker (Mastery, Echo, Round) | ✅ Done |
| Husk tracker | ✅ Done |
| Win condition + Mastery goal | ✅ Done |
| Initiative tracker | ✅ Done |
| Game history log | ✅ Done |
| Player profiles | ✅ Done (v1) |
| Card database (184 cards) | ✅ Done |
| Card lightbox viewer | ✅ Done |
| Android Play Store build | 🔄 In review |
| Deck builder | ⏳ Next |
| Profile management (edit / delete) | ⏳ Planned |
| Husk tracker icon (miniature art) | ⏳ Planned |
| iOS TestFlight build | ⏳ Planned |

---

## Contributing

This project is in active private development for a playgroup. Community release is planned once the deck builder is complete. Watch the repo for updates.

---

## License

MIT
