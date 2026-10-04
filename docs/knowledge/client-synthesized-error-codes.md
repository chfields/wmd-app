---
type: convention
title: "The app adds its own \"offline\" and \"unknown\" error codes"
description: "ApiError also carries two codes the BFF never sends: offline (status 0, fetch failed) and unknown (error body missing a code)."
tags: [api, errors]
status: stable
generated:
  by: wmd-app-builder/gpt-5.6-terra
  at: 2026-10-04T15:29:46Z
sources:
  - id: offline-fallback
    url: https://github.com/chfields/wmd-app/blob/a6cb4a821e1e812f4d067e2cbc65f053d5acf41f/src/api.ts#L68-L70
  - id: unknown-fallback
    url: https://github.com/chfields/wmd-app/blob/a6cb4a821e1e812f4d067e2cbc65f053d5acf41f/src/api.ts#L71-L75
wardby:
  schema: 1
  roles: [builder, reviewer]
  affects: [src/api.ts, src/screens.tsx]
  citations:
    - id: offline-fallback
      repo: github:chfields/wmd-app
      path: src/api.ts
      lines: [68, 70]
      symbol: request catch
      sha: a6cb4a821e1e812f4d067e2cbc65f053d5acf41f
      spanHash: sha256:fe419367ef8868a82792375ff76a0295b9cc68e12df385006abaa9f6ddfb33a7
    - id: unknown-fallback
      repo: github:chfields/wmd-app
      path: src/api.ts
      lines: [71, 75]
      symbol: request non-ok branch
      sha: a6cb4a821e1e812f4d067e2cbc65f053d5acf41f
      spanHash: sha256:3feb141eeb99e35566f5bd759acf690c02ae6647de50e37f0fccbb33321ff7c0
  confidence: high
---

Code that branches on `ApiError.code` must handle `offline` (status 0, no response) and `unknown` besides the BFF's codes; do not add BFF error codes with these names, and do not treat status 0 as an HTTP status.[^offline-fallback][^unknown-fallback]

What to do: handle these client-synthesized codes separately from BFF error codes.

[^offline-fallback]: Fetch-failure fallback.
[^unknown-fallback]: Missing-code fallback.
