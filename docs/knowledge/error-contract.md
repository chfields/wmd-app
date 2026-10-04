---
type: convention
title: "Errors are {\"error\": {\"code\", \"message\"}} with stable codes"
description: "Every API error uses this shape, and codes are stable identifiers clients branch on, so they are never renamed."
tags: [core, api, errors]
status: stable
generated:
  by: wmd-app-builder/gpt-5.6-terra
  at: 2026-10-04T15:29:46Z
sources:
  - id: api-error
    url: https://github.com/chfields/wmd-app/blob/a6cb4a821e1e812f4d067e2cbc65f053d5acf41f/src/api.ts#L46-L54
  - id: request-errors
    url: https://github.com/chfields/wmd-app/blob/a6cb4a821e1e812f4d067e2cbc65f053d5acf41f/src/api.ts#L71-L75
  - id: message-of
    url: https://github.com/chfields/wmd-app/blob/a6cb4a821e1e812f4d067e2cbc65f053d5acf41f/src/screens.tsx#L7-L8
  - id: mock-bff
    url: https://github.com/chfields/wmd-app/blob/a6cb4a821e1e812f4d067e2cbc65f053d5acf41f/e2e/journey.spec.ts#L4-L55
  - id: canonical
    url: https://github.com/chfields/wmd-deploy/blob/main/docs/knowledge/core/error-contract.md
wardby:
  schema: 1
  roles: [builder, reviewer, planner]
  affects: [src/api.ts, src/screens.tsx, e2e/journey.spec.ts]
  citations:
    - id: api-error
      repo: github:chfields/wmd-app
      path: src/api.ts
      lines: [46, 54]
      symbol: ApiError
      sha: a6cb4a821e1e812f4d067e2cbc65f053d5acf41f
      spanHash: sha256:8b9d4709c092afdc6d7e7816f4ef20065d6082fdcb4a57cdb20c8a89921c2c53
    - id: request-errors
      repo: github:chfields/wmd-app
      path: src/api.ts
      lines: [71, 75]
      symbol: request
      sha: a6cb4a821e1e812f4d067e2cbc65f053d5acf41f
      spanHash: sha256:3feb141eeb99e35566f5bd759acf690c02ae6647de50e37f0fccbb33321ff7c0
    - id: message-of
      repo: github:chfields/wmd-app
      path: src/screens.tsx
      lines: [7, 8]
      symbol: messageOf
      sha: a6cb4a821e1e812f4d067e2cbc65f053d5acf41f
      spanHash: sha256:784808c867f8cfa4ea3bcc77960a56a176f318f97ed3ba2738b860158539cd30
    - id: mock-bff
      repo: github:chfields/wmd-app
      path: e2e/journey.spec.ts
      lines: [4, 55]
      symbol: mockBff
      sha: a6cb4a821e1e812f4d067e2cbc65f053d5acf41f
      spanHash: sha256:6e3e1483cc3fd2381764234563ae0277e310ab7b61af3ba4e64673fd67a0f7f6
  confidence: high
---

The client parses BFF errors as `{"error": {"code", "message"}}` into `ApiError(status, code, message)`, shows the BFF's message to the user via `messageOf`, and may branch on `code` because codes are stable; the e2e mock must return the same shape.[^api-error][^request-errors][^message-of][^mock-bff]

What to do: preserve error-code names and use the BFF error shape in client and mock responses.

[^api-error]: Client error type.
[^request-errors]: Non-success response parsing.
[^message-of]: User-facing error message selection.
[^mock-bff]: Mock BFF error responses.
