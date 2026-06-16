# Malediction Companion

A mobile companion app for the miniatures card game **Malediction**. Tracks Mastery, Echo, Husks, and round progression for 2–6 players — so you can keep your eyes on the battlefield instead of the tokens.

> Built with React Native + Expo. Runs on iOS, Android, and web.

---

## Features

### Currently Implemented
- **2–6 player support** with Lifetap-style table layouts (top row rotated 180° so every player faces their own panel)
- **Seeker selection** — all 10 launch Seekers with card art, faction symbols, Legacy details, and starting Echo
- **Mastery tracking** — tap the top or bottom of your panel to increment or decrement; large animated display
- **Echo tracking** — compact +/− widget per player, auto-funded each round
- **Round tracker** — advancing the round auto-distributes Echo income (`min(round, 5) × 2`)
- **Persistence** — full game state survives app close and reopen via AsyncStorage
- **Dark gothic theme** — Cinzel typeface, gold/purple palette, seeker portrait backgrounds

### Coming Soon
- Husk tracker (per-player objective control, ±10 Mastery per husk)
- Win condition with configurable Mastery goal (25 / 45 / 50 / 55 / 60)
- Initiative tracker
- Card database & deck builder
- Player profiles with cross-game stats
- Game history log

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (project uses nvm v24)
- [Expo Go](https://expo.dev/go) on your iOS or Android device
- A physical device or simulator for native testing

### Install

```bash
git clone https://github.com/mmahr22/malediction-companion.git
cd malediction-companion
npm install
```

### Run

```bash
# Mobile (scan QR code with Expo Go)
npx expo start

# Web browser
npx expo start --web
```

> **Note:** If using nvm, prefix commands with `PATH=~/.nvm/versions/node/<version>/bin:$PATH`

---

## Tech Stack

| | |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript (strict) |
| State | Zustand v5 with AsyncStorage persistence |
| Fonts | Cinzel / CinzelDecorative via `@expo-google-fonts` |
| Icons | `@expo/vector-icons` MaterialCommunityIcons |
| Navigation | React Navigation v7 (bottom tabs + native stack) |

---

## Project Structure

```
src/
├── data/           # Types, Seeker roster
├── store/          # Zustand game store
├── theme/          # Colors, fonts, faction assets
├── navigation/     # Tab and stack navigators
├── screens/        # PlayerSetup, GameTracker, Cards (scaffold), Decks (scaffold)
└── components/     # PlayerPanel, EchoWidget, RoundBar, SeekerPickerModal, FactionDots
assets/
├── seekers/        # Seeker portrait JPGs
└── factions/       # Faction symbol PNGs
```

---

## Factions

| Faction | Color |
|---|---|
| Order of the Shattered Throne | Silver |
| Legion of the Fallen | Green |
| Primal Blood | Red |
| Conclave of the Spheres | Blue |

Dual-faction Seekers bear both sigils and unlock cards from both factions in the deck builder.

---

## Contributing

This project is currently in private development for a playgroup. Community release is planned once the core feature set is complete. Watch the repo for updates.

---

## License

MIT
