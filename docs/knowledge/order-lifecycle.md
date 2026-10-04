---
type: invariant
title: "Orders reserve stock first and are confirmed only after notification"
description: "An order exists only after catalog-service reserves all its stock in one transaction, and moves from pending to confirmed only when notification-service accepts the confirmation, which is idempotent per order and kind."
tags: [core, orders]
status: stable
generated:
  by: wmd-app-builder/gpt-5.6-terra
  at: 2026-10-04T15:29:46Z
sources:
  - id: order-status
    url: https://github.com/chfields/wmd-app/blob/a6cb4a821e1e812f4d067e2cbc65f053d5acf41f/src/api.ts#L27-L35
  - id: order-poll
    url: https://github.com/chfields/wmd-app/blob/a6cb4a821e1e812f4d067e2cbc65f053d5acf41f/src/screens.tsx#L181-L197
  - id: order-mock
    url: https://github.com/chfields/wmd-app/blob/a6cb4a821e1e812f4d067e2cbc65f053d5acf41f/e2e/journey.spec.ts#L41-L45
  - id: canonical
    url: https://github.com/chfields/wmd-deploy/blob/main/docs/knowledge/core/order-lifecycle.md
wardby:
  schema: 1
  roles: [builder, reviewer, planner]
  affects: [src/screens.tsx, src/api.ts, e2e/journey.spec.ts]
  citations:
    - id: order-status
      repo: github:chfields/wmd-app
      path: src/api.ts
      lines: [27, 35]
      symbol: Order
      sha: a6cb4a821e1e812f4d067e2cbc65f053d5acf41f
      spanHash: sha256:1da3273b177ce2ee0b05fe9730296b42b34ef8c23634a85e2c3a6589e6ad59f6
    - id: order-poll
      repo: github:chfields/wmd-app
      path: src/screens.tsx
      lines: [181, 197]
      symbol: OrderScreen poll effect
      sha: a6cb4a821e1e812f4d067e2cbc65f053d5acf41f
      spanHash: sha256:cd4eaa01817800e02eb8cd005169a9d4a4e00ccb10eda5141b8f2156fbff48be
    - id: order-mock
      repo: github:chfields/wmd-app
      path: e2e/journey.spec.ts
      lines: [41, 45]
      symbol: mockBff order route
      sha: a6cb4a821e1e812f4d067e2cbc65f053d5acf41f
      spanHash: sha256:059eb2206902f5949e4a1807843e4ebef2e2faa276293177e9256cb8f52a6bc8
  confidence: high
---

A placed order comes back `pending`; the app does not treat it as confirmed until the BFF reports `confirmed`, so the order screen polls until then and stops. The app never sets status itself, and the cart's stock clamp is only a hint — the server-side reservation decides.[^order-status][^order-poll][^order-mock]

What to do: keep the order status server-owned and wait for `confirmed` before presenting confirmation.

[^order-status]: The app's order-status union.
[^order-poll]: Confirmation polling behavior.
[^order-mock]: Second-poll confirmation in the mock.
