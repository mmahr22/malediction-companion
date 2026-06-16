# Malediction Companion App — Implementation Spec

> Last updated: 2026-06-15

## 1. Purpose

A mobile + web companion app for the miniatures card game **Malediction**. The app handles bookkeeping that would otherwise require tokens, dice, and pen-and-paper during a game session: Mastery (victory points), Echo (currency), round progression, and per-player Seeker identity. It also serves as a reference tool for cards and decklists between sessions.

---

## 2. Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | React Native + Expo | SDK 54.0.35 |
| Language | TypeScript | strict mode |
| State | Zustand v5 | `persist` + AsyncStorage |
| Persistence | `@react-native-async-storage/async-storage` | v2 with `migrate` |
| Fonts | Cinzel / CinzelDecorative | via `@expo-google-fonts` |
| Icons | `@expo/vector-icons` MaterialCommunityIcons | bundled with Expo |
| Haptics | `expo-haptics` | bundled with Expo |
| Navigation | React Navigation v7 | bottom tabs + native stack |
| Images | React Native `Image` + `require()` | local static assets only |

### Web bundling fix
Metro redirects `zustand/middleware` to its CJS build on web to avoid an `import.meta` SyntaxError in zustand's ESM distribution. This is handled in `metro.config.js` via a custom `resolveRequest` — **do not add a `babel.config.js`**, it breaks native builds.

```js
// metro.config.js — CJS redirect for zustand on web only
if (platform === 'web' && moduleName === 'zustand/middleware') {
  return { filePath: zustandMiddlewareCjs, type: 'sourceFile' };
}
```

`useNativeDriver: false` is required on all `Animated.spring` calls for web compatibility.

---

## 3. Repository

- **Repo**: https://github.com/mmahr22/malediction-companion (private)
- **Branch**: `main`
- **Node**: nvm v24.16.0 (`PATH=~/.nvm/versions/node/v24.16.0/bin:$PATH`)
- **Run**: `npx expo start` (dev) | `npx expo start --web` (browser)

---

## 4. Project Structure

```
malediction-companion/
├── App.tsx                        # Font loading, root render
├── app.json                       # Expo config (portrait, dark UI, expo-font plugin)
├── metro.config.js                # Web CJS fix for zustand
├── assets/
│   ├── factions/                  # faction-order.png, faction-conclave.png,
│   │                              # faction-legion.png, faction-primal.png
│   └── seekers/                   # sigrith.jpg, vorendal.jpg, thundersteps.jpg,
│                                  # polinore.jpg, auric.jpg, morrida.jpg,
│                                  # ingor.jpg, londriel.jpg, griza.jpg, kar-mamok.jpg
└── src/
    ├── data/
    │   ├── types.ts               # Core type definitions
    │   └── sampleSeekers.ts       # All 10 Seekers with stats, legacy, image
    ├── store/
    │   └── gameStore.ts           # Zustand store — game state + actions
    ├── theme/
    │   ├── theme.ts               # Colors, fonts, spacing, radius constants
    │   └── factions.ts            # FACTION_COLORS, FACTION_IMAGES, parseFactions()
    ├── navigation/
    │   ├── RootNavigator.tsx      # Bottom tabs + Cards stack
    │   └── types.ts               # CardsStackParamList type
    ├── screens/
    │   ├── GameTrackerScreen.tsx  # Main game view — layout engine + panel render
    │   ├── PlayerSetupScreen.tsx  # Pre-game lobby
    │   ├── CardDatabaseScreen.tsx # Scaffold (empty)
    │   ├── CardDetailScreen.tsx   # Scaffold (empty)
    │   └── DecklistsScreen.tsx    # Scaffold (empty)
    └── components/
        ├── PlayerPanel.tsx        # Per-player panel — mastery, echo, seeker art
        ├── EchoWidget.tsx         # Compact Echo +/- control
        ├── RoundBar.tsx           # Fixed bottom bar — round number + advance/retreat
        ├── SeekerPickerModal.tsx  # Full-screen seeker selection modal
        └── FactionDots.tsx        # Faction symbol row (PNG icons)
```

---

## 5. Data Model

```ts
// src/data/types.ts

interface Legacy {
  name: string;
  description: string;
  startingEcho: number;   // 20 or 25 depending on Seeker power level
}

interface Seeker {
  id: string;
  name: string;
  faction: string;        // e.g. "Primal Blood / Conclave of the Spheres"
  description: string;    // ability text
  legacy: Legacy;
  image?: ReturnType<typeof require>;
}

interface Player {
  id: string;
  name: string;
  mastery: number;        // victory points, starts at 0
  echo: number;           // currency, starts at seeker.legacy.startingEcho
  seeker: Seeker | null;
}

interface GameState {
  players: Player[];
  isActive: boolean;
  round: number;          // starts at 1, never goes below 1
}

// Scaffolded — not yet implemented
interface Card {
  id: string;
  name: string;
  faction: string;
  type: string;           // unit | channel | item
  cost: number;
  description: string;
}

interface Deck {
  id: string;
  name: string;
  cardIds: string[];
}
```

---

## 6. Factions

| Faction | Symbol color | Image |
|---|---|---|
| Order of the Shattered Throne | `#E8E8E8` (silver) | `faction-order.png` |
| Legion of the Fallen | `#2A7A2A` (dark green) | `faction-legion.png` |
| Primal Blood | `#CC2200` (deep red) | `faction-primal.png` |
| Conclave of the Spheres | `#1A5FAD` (blue) | `faction-conclave.png` |

Dual-faction Seekers use `parseFactions("Faction A / Faction B")` which splits on ` / ` and returns both strings. `FactionDots` renders one icon per faction.

---

## 7. Seekers (Current Roster — 10)

| Seeker | Faction(s) | Starting Echo | Legacy |
|---|---|---|---|
| Sigrith Andravos | Order | 25 | Andravon |
| Vorendal, the Dreadheart | Legion | 25 | Heartlock |
| Thundersteps | Primal | 25 | Storm's Eye |
| Polinore, Prime Archivist | Conclave | 25 | Runefold Gauntlet |
| Auric Evenhand | Primal / Order | 20 | Will of the Forge |
| Countess Morrida Umberland | Legion / Conclave | 20 | Soul-Stitcher |
| In'Gor, the Spiritbound | Primal / Legion | 20 | Effigy of Chaos |
| Londriel, Spellwarden | Conclave / Order | 20 | Ark of Lamentation |
| Griza, Lingering Wound | Order / Legion | 20 | Ihreniv |
| Kar-Mamok | Primal / Conclave | 20 | Liena, Who Dreams |

Single-faction Seekers start with 25 Echo; dual-faction Seekers start with 20.

---

## 8. Game Mechanics — Implemented

### Mastery (Victory Points)
- Tracked per player, floor 0.
- Increment/decrement by tapping the top/bottom half of a player's panel.
- Displayed as a large gold number (96px Cinzel) in the center of the panel.
- Spring-bounce animation on change (`useNativeDriver: false`).

### Echo (Currency)
- Tracked per player via `EchoWidget` (bottom-right of each panel).
- Initializes from `seeker.legacy.startingEcho` (20 or 25).
- Manual +1 / -1 buttons; floor 0.
- Auto-incremented when the round advances (see below).

### Round Tracker (`RoundBar`)
- Fixed bar at the bottom of the game screen.
- Advancing the round adds Echo to every player: `gain = min(newRound, 5) * 2`
  - Round 1→2: +4 Echo each
  - Round 2→3: +6 Echo each
  - Round 3→4: +8 Echo each
  - Round 4→5: +10 Echo each
  - Round 5+: +10 Echo each (capped)
- Decrement is available (floor 1) but does not remove Echo.

### Persistence
- Full game state persisted to AsyncStorage under key `malediction:gameState`.
- Schema version 2 with `migrate` to rename legacy fields (`victoryPoints` → `mastery`, `resourcePoints` → `echo`).
- State survives app close/reopen.

---

## 9. Game Screen Layout

The screen is a full-bleed grid of player panels with a `RoundBar` fixed below. No navigation header is shown during an active game.

### Layout engine (`buildLayout` in `GameTrackerScreen.tsx`)

| Players | Layout |
|---|---|
| 2 | 1 row top (rotated 180°) + 1 row bottom |
| 3 | 1 panel top (180°) + 2 panels bottom |
| 4 | 2×2 grid — top row 180°, bottom row 0° |
| 5 | 2 panels top (180°) + 3 panels bottom |
| 6 | 3+3 grid — top row 180°, bottom row 0° |

Top row is always rotated 180° so those players face the screen from the opposite side of the table. React Native transforms touch coordinates with visual rotation, so top-tap always increments and bottom-tap always decrements regardless of orientation.

---

## 10. Visual Design

### Palette (`src/theme/theme.ts`)

```ts
colors = {
  background: '#0B0710',   // near-black purple
  surface:    '#1C1422',   // card / modal background
  border:     '#3D2C4A',
  gold:       '#D4AF37',   // Mastery / primary accent
  purple:     '#8B5FBF',   // Echo accent
  danger:     '#8C1F28',   // reset / destructive actions
  textPrimary:'#F2E9E4',
  textMuted:  '#9C8AA5',
}
```

### Typography
- `CinzelDecorative_700Bold` — app branding, "Begin" button
- `Cinzel_600SemiBold` — headings, player names, large numbers, labels

### Player Panel visual layer order
1. Seeker portrait (full-bleed `Image`, `resizeMode="cover"`)
2. Dark scrim (`rgba(0,0,0,0.35)`) for legibility
3. Two tap zones (top half / bottom half), `+`/`−` hint at 30% opacity
4. Center overlay: Mastery number → player name badge → Seeker/faction pill
5. Echo widget (absolute, bottom-right)

Per-player background color pairs (fallback if no seeker art):

| Index | Pair |
|---|---|
| 0 | Blood crimson `#6b1520` / `#0d0305` |
| 1 | Midnight navy `#1a3d6e` / `#050e1c` |
| 2 | Forest dark `#1d5c1d` / `#051005` |
| 3 | Deep violet `#5c1a6b` / `#130416` |
| 4 | Dark teal `#1a5c5c` / `#041313` |
| 5 | Burnt amber `#6b4012` / `#1a0e05` |

---

## 11. Navigation

Three bottom tabs:

| Tab | Icon | Component |
|---|---|---|
| Game Tracker | `sword-cross` | `GameTrackerScreen` (or `PlayerSetupScreen` if no active game) |
| Cards | `cards` | `CardsStackNavigator` → `CardDatabaseScreen` + `CardDetailScreen` |
| Decks | `book-open-variant` | `DecklistsScreen` |

All headers use Cinzel gold on dark surface. Tab bar: dark surface, gold active tint, muted inactive tint.

---

## 12. Planned Features

> **Audience**: Currently targeting a private playgroup. Community release is a future goal — Polish and data completeness requirements can be looser for now.

### 12.1 Husk Tracker (Priority: High)

Husks are objective markers on the game board that players compete to control. They are directly tied to Mastery.

**Rules:**
- Standard game: **4 husks** total.
- Beginner game (25 Mastery threshold): **2 husks** total.
- Controlling a husk grants **+10 Mastery**. Losing it removes **−10 Mastery**.
- Husk control is tracked per player (e.g. Player 1 holds 2, Player 2 holds 1, Player 3 holds 1).

**Implementation:**
- Add a husk counter to each `PlayerPanel` on the game screen.
- Tapping +husk calls `adjustMastery(playerId, +10)` and increments that player's husk count.
- Tapping −husk calls `adjustMastery(playerId, -10)` and decrements (floor 0).
- The number of available husks on the board at setup is derived from the chosen Mastery goal preset (see 12.2).
- Husk counts per player are persisted in `GameState` and recorded in game history.

### 12.2 Win Condition & Mastery Goal (Priority: High)

**Rules:**
- Game ends when any player's Mastery reaches or exceeds the agreed-upon threshold.
- Mastery goal is set before the game starts in the Player Setup screen.

**Presets:**

| Label | Mastery Target | Husks |
|---|---|---|
| Beginner | 25 | 2 |
| Standard *(default)* | 45 | 4 |
| 50 | 50 | 4 |
| 55 | 55 | 4 |
| 60 | 60 | 4 |

**Implementation:**
- Add a Mastery goal selector to `PlayerSetupScreen` (preset buttons, default 45).
- Store `masteryGoal: number` in `GameState`.
- After every `adjustMastery` call, check if any player has reached `masteryGoal`.
- If yes: show a full-screen **Win Screen** with the winning player's name, Seeker, and final stats.
- Win screen should offer: "New Game" (returns to setup) and "View Summary."

### 12.3 Initiative Tracker (Priority: Medium)

Initiative in Malediction is bid-based at the start of a round. Once set, it does not change unless the player without initiative challenges and wins a new bid. Tracking the bid itself automatically is not feasible.

**Implementation:**
- Simple toggle on the game screen: one player is marked as holding initiative, the rest are not.
- Any player can tap to claim initiative (transfers it from whoever held it).
- Displayed as a small indicator on the player's panel (e.g. a sword icon or gold ring).
- Initiative resets / can be re-assigned freely — the app just shows the current state, it does not enforce bid rules.

### 12.4 Card Database (Priority: Medium — blocked on data)

The scaffold (`CardDatabaseScreen`, `CardDetailScreen`) exists but renders nothing. Card data has not been sourced yet — this feature is blocked until card data is available. Do not implement the UI before the data exists.

**When data is ready:**
- Card types: **Unit**, **Channel** (spell), **Item**, **Terrain**.
- Each card: `id`, `name`, `faction[]`, `type`, `rank` (`basic` | `elite` | `unique` | `legendary`), `cost`, `description`, `image?`.
- Filterable list: by faction, by type, by rank, by cost range.
- `CardDetailScreen`: full card art + rules text.
- Search by name.
- Neutral cards (no faction sigil) are tagged with an empty faction array and show in all faction filters.

### 12.5 Deck Builder (Priority: Medium — blocked on card database)

`DecklistsScreen` is empty. Blocked until the card database is complete.

**Deck construction rules (from rulebook):**
- Main deck: **30–50 cards** (units, spells, non-relic attachments).
- Side deck: optional, max **7 cards**. Freely swappable with the main deck after seeing opponent's Seeker, before setup.
- Per-card copy limits by rank:
  - **Basic**: max 3 copies
  - **Elite**: max 2 copies
  - **Unique**: max 1 copy
  - **Legendary**: the Seeker card itself (handled separately, not in deck)
- Faction gating: a card's faction sigil must match at least one of the chosen Seeker's sigils. Neutral cards (no sigil) go in any deck.
- Dual-faction Seekers unlock cards from both of their factions.
- Each warband also includes one **terrain card** + its matching **terrain set** (not part of the 30–50 card deck count).

**Implementation:**
- Create / name / delete decks, linked to a specific Seeker.
- Add/remove cards with inline copy-limit and faction validation.
- Deck validity indicator (card count in range, no illegal cards).
- Side deck management (separate from main, max 7).
- Persist decks to AsyncStorage.
- Game history records which deck was used per player.

### 12.6 Game History Log (Priority: Low)

Record and display completed games.

**Per game, record:**
- Date
- Winner (player name + Seeker)
- All players: name, Seeker, deck used, final Mastery, husks held at end
- Total rounds played
- Mastery goal that was set

**Implementation:**
- Append-only log persisted to AsyncStorage under a separate key.
- Triggered when the win screen is dismissed or "End Game" is tapped.
- Viewable from a History tab (new bottom tab) or from a menu on the setup screen.

### 12.7 Player Profiles (Priority: Low — depends on Game History)

Persistent profiles for recurring players, surfaced inside the setup flow.

**Data model:**
```ts
interface PlayerProfile {
  id: string;
  name: string;
  color: string;       // chosen accent color, used in place of the default panel color
  createdAt: number;   // timestamp
}
```

**Stats** (computed from Game History entries linked to this profile — not stored directly):
- Total games played
- Wins / losses
- Win rate
- Most-played Seeker
- Average final Mastery

**Setup screen integration:**
- Player slot shows a horizontally scrollable roster of saved profiles to tap-select.
- Selecting a profile pre-fills the player's name and links the game session to that profile's history.
- Two additional options alongside the roster: **"New Profile"** (opens a name + color picker, saves permanently) and **"No Profile"** (type a one-off name, not saved).
- A profile can be used by multiple players in the same game (e.g. the same person plays twice in testing) — no uniqueness enforcement.

**Persistence:**
- Profiles stored in AsyncStorage under a separate key from game state and history.
- Game History entries store `profileId?: string` on each player entry so stats can be computed on read.

---

## 13. Known Constraints & Gotchas

| Issue | Resolution |
|---|---|
| `zustand/middleware` uses `import.meta` | Metro CJS redirect in `metro.config.js` — do not use babel.config.js |
| `useNativeDriver: true` on Animated.spring causes blank white screen on web | Always use `useNativeDriver: false` |
| `babel-preset-expo` version mismatch | Must stay at `54.x` to match Expo SDK 54 — do not install `56.x` |
| GitHub push requires token auth | Use `gh auth login` via GitHub CLI; password auth is rejected |
| React Native `Image` vs expo-image | Use built-in `Image` from `react-native` — `expo-image` is not installed |
| Local image assets require type | Use `ReturnType<typeof require>` — not `ImageSourcePropType` for `require()` assets |
| Dual-faction Seeker strings | Use `parseFactions()` from `src/theme/factions.ts` to split `"A / B"` |

---

## 14. Out of Scope

- Unit / Seeker health tracking (too complex for the gain at table size)
- Ability cooldown tracking (does not exist as a mechanic in Malediction)
- Status / buff tracking (e.g. Berserk, Shielded — too granular for a companion app)
- Online multiplayer / sync between devices
- Push notifications
- Authentication / user accounts
- In-app purchases
- Android/iOS store submission (current: Expo Go + web dev build only)
