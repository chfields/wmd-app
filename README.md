# wmd-app

WMD Shop's mobile app (Expo, React Native, TypeScript), part of the Wardby
mobile demo. Sign in, browse the catalog, place an order, and watch it get
confirmed; confirmations land in the inbox.

```bash
npm ci
EXPO_PUBLIC_BFF_URL=http://localhost:8080 npx expo start
```

Open it in Expo Go on a phone, or press `w` for the web build. The app talks
only to [wmd-bff](../wmd-bff). See [`AGENTS.md`](AGENTS.md) for checks and
conventions.
