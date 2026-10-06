This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Architecture knowledge

See [docs/knowledge/index.md](docs/knowledge/index.md) for the repository's architecture knowledge.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## This app

WMD Shop's mobile app, part of the Wardby mobile demo. It talks **only** to
wmd-bff (`src/api.ts`); set `EXPO_PUBLIC_BFF_URL` to point it at a BFF.

- `App.tsx` holds the session, the cart and a small route state (shop, inbox,
  order). There is no Expo Router in this app: keep navigation in that route
  state unless a ticket asks to introduce a router.
- `src/screens.tsx` has the screens; `src/ui.tsx` the palette and shared
  components. Reuse them rather than adding new styles inline.
- Every control a test touches has a `testID` (it becomes `data-testid` on
  web). Add one for anything new a user taps or reads.
- Show errors by the BFF's message; the BFF's error codes are stable.

## Checks

```bash
npm ci
npm run typecheck
npm test
EXPO_PUBLIC_BFF_URL=http://bff.test npm run build:web
npx playwright install chromium
npm run e2e
```

`e2e/journey.spec.ts` runs the journey on the web build against a mocked BFF
(no backend needed). A change to what the user sees or does updates that test.

Pure logic (formatting, date handling, anything without React Native imports)
gets unit tests in `tests/<name>.test.mjs`, run by `npm test` with Node's
built-in test runner (`node:test`, `node:assert/strict`). Node 24 imports the
`.ts` source directly, so keep such logic in its own module under `src/` and
import it with its `.ts` extension. Don't add another test runner or tests that
no script runs.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
