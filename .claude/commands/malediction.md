You are working on the **Malediction Companion** — a React Native + Expo SDK 54 companion app for the miniatures card game Malediction. The full product spec lives in `SPEC.md` at the project root.

Do the following immediately, before responding to the user:

1. Read `SPEC.md` in full.
2. Read `src/data/types.ts`
3. Read `src/store/gameStore.ts`
4. Run `git log --oneline -15` to see what's changed recently.

---

## If $ARGUMENTS is empty — Session Onboarding

Produce a session brief in this format:

**Current State**
- List every feature from SPEC.md section 12 and mark each as: ✅ Implemented, 🚧 Partially done, or ⬜ Not started. Determine status by reading the source files, not by guessing.

**Next Up**
- Identify the single highest-priority unimplemented feature from the list above.
- Summarize what needs to be built in 3–5 bullet points.
- Call out any dependencies or blockers (e.g. "Card Database is blocked until card data is sourced").

**Open Questions**
- List anything that is ambiguous in the spec or that the user should decide before implementation begins.

Then stop and wait for the user to confirm what they want to work on.

---

## If $ARGUMENTS is provided — Feature Builder

The user wants to implement: **$ARGUMENTS**

1. Find the relevant section in SPEC.md for this feature.
2. Read every source file that will need to change. Identify all files that touch the feature area — don't just read the obvious ones.
3. Present a concise implementation plan:
   - What files change and why
   - New types or store actions needed
   - Any UI components to create or modify
   - Order of operations (what to build first)
4. Call out any decision the user needs to make before you can proceed (e.g. exact UI layout, edge case behavior, missing spec detail).
5. Wait for the user to confirm the plan before writing any code.

Once confirmed, implement the feature. After each logical chunk of work, run:
```
PATH=~/.nvm/versions/node/v24.16.0/bin:$PATH npx tsc --noEmit
```
Fix all type errors before continuing. Do not report a feature as done until TypeScript is clean.

---

## Standing Rules (never violate these)

- Never create `babel.config.js` — the `metro.config.js` CJS redirect handles zustand on web. Creating a babel config breaks native builds.
- Always `useNativeDriver: false` on every `Animated.spring` call — `true` causes a blank white screen on web.
- Keep `babel-preset-expo` at `54.x` — upgrading to 56.x breaks native.
- Use React Native's built-in `Image` from `react-native`, not `expo-image` (not installed).
- Use `ReturnType<typeof require>` as the TypeScript type for local image assets.
- Node must be on nvm v24: `PATH=~/.nvm/versions/node/v24.16.0/bin:$PATH`
- Do not implement anything not in SPEC.md section 12 without asking first.
- Do not interpret game rules that aren't in the spec — ask the user.
