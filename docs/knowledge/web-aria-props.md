---
type: pitfall
title: "On web, selected and checked states need aria-* props, not accessibilityState"
description: "react-native-web turns aria-checked, aria-selected and role into DOM attributes but ignores accessibilityState, so a state set only there is invisible to the browser and to Playwright."
tags: [ui, accessibility, web, testing]
status: stable
generated:
  by: human
  at: 2026-10-06T11:44:14Z
sources:
  - id: tab-aria
    url: https://github.com/chfields/wmd-app/blob/7ce9f681f59d3b0967d036393e2af8254ad96799/App.tsx#L60-L62
wardby:
  schema: 1
  roles: [builder, reviewer]
  affects: [App.tsx, src/screens.tsx, src/ui.tsx, e2e/**]
  citations:
    - id: tab-aria
      repo: github:chfields/wmd-app
      path: App.tsx
      lines: [60, 62]
      symbol: Tab selected state
      sha: 7ce9f681f59d3b0967d036393e2af8254ad96799
      spanHash: sha256:873d4909b7585f2652b5e2788730dd4840a29002ab86c9a30f13d6bb17e093e4
  confidence: high
---

A control's selected or checked state must be set with `role` plus `aria-selected` / `aria-checked` (for example `role="radio" aria-checked={isSelected}`). react-native-web, which renders the web build CI tests, maps those to DOM attributes but ignores `accessibilityState`, so a state set only there never reaches the browser and Playwright checks such as `toBeChecked()` fail.[^tab-aria]

What to do: use `role` and `aria-*` props for any state a user or test reads; don't use `accessibilityState` or `accessibilityRole` for new code.

[^tab-aria]: The tab bar's selected state.
