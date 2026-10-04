---
type: invariant
title: "The BFF is the only API the app and the outside world reach"
description: "wmd-app calls only wmd-bff; services stay internal and trust the user id the BFF passes, never one taken from a request body."
tags: [core, api, security]
status: stable
generated:
  by: wmd-app-builder/gpt-5.6-terra
  at: 2026-10-04T15:29:46Z
sources:
  - id: bff-url
    url: https://github.com/chfields/wmd-app/blob/a6cb4a821e1e812f4d067e2cbc65f053d5acf41f/src/api.ts#L3-L3
  - id: request
    url: https://github.com/chfields/wmd-app/blob/a6cb4a821e1e812f4d067e2cbc65f053d5acf41f/src/api.ts#L56-L77
  - id: api
    url: https://github.com/chfields/wmd-app/blob/a6cb4a821e1e812f4d067e2cbc65f053d5acf41f/src/api.ts#L79-L91
  - id: canonical
    url: https://github.com/chfields/wmd-deploy/blob/main/docs/knowledge/core/bff-only-public-api.md
wardby:
  schema: 1
  roles: [builder, reviewer, planner]
  affects: [src/api.ts, src/**/*.ts, src/**/*.tsx, App.tsx, app.json]
  citations:
    - id: bff-url
      repo: github:chfields/wmd-app
      path: src/api.ts
      lines: [3, 3]
      symbol: BFF_URL
      sha: a6cb4a821e1e812f4d067e2cbc65f053d5acf41f
      spanHash: sha256:bf12a173d118959194c9451d7aba10fa1faf38ced66f5835197c25b1d0825ed1
    - id: request
      repo: github:chfields/wmd-app
      path: src/api.ts
      lines: [56, 77]
      symbol: request
      sha: a6cb4a821e1e812f4d067e2cbc65f053d5acf41f
      spanHash: sha256:acf5f3e37c7d72fff51c354de176f7accb6a1ea542bd37d71954b4250ecf4831
    - id: api
      repo: github:chfields/wmd-app
      path: src/api.ts
      lines: [79, 91]
      symbol: api
      sha: a6cb4a821e1e812f4d067e2cbc65f053d5acf41f
      spanHash: sha256:26632c1435b05048bd0515e669580ffa289caac41a8c1b162d6b3e99fdb909d7
  confidence: high
---

Every network call in the app goes through `request` in `src/api.ts` to `BFF_URL`; the app never calls catalog, order or notification services directly. The user is identified only by the bearer token from `/v1/session`; request bodies (e.g. `placeOrder`) never carry a user id.[^bff-url][^request][^api]

What to do: route all backend access through the BFF client and identify the user from its bearer token.

[^bff-url]: BFF URL configuration.
[^request]: Request construction and authentication header.
[^api]: Public API methods and order payload.
