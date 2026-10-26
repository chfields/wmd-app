import test from "node:test";
import assert from "node:assert/strict";
import { resolveScheme, lightColors, darkColors, colorsFor, THEME_OPTIONS } from "../src/theme.ts";

for (const preference of ["system", "light", "dark"]) {
  for (const system of ["light", "dark", null, undefined]) {
    test(`resolveScheme(${preference}, ${system})`, () => {
      assert.equal(resolveScheme(preference, system), preference === "system" ? system ?? "light" : preference);
    });
  }
}

test("dark palette has the same keys as light", () => {
  assert.deepEqual(Object.keys(darkColors).sort(), Object.keys(lightColors).sort());
});

test("palettes use light-blue accents", () => {
  assert.equal(lightColors.accent, "#5aaee6");
  assert.equal(darkColors.accent, "#8fd0f5");
});

test("every palette value is a 7-character hex string", () => {
  for (const palette of [lightColors, darkColors]) {
    for (const value of Object.values(palette)) {
      assert.match(value, /^#[0-9a-fA-F]{6}$/);
    }
  }
});

test("colorsFor selects the requested palette", () => {
  assert.equal(colorsFor("light"), lightColors);
  assert.equal(colorsFor("dark"), darkColors);
});

test("theme options have the contracted values and labels", () => {
  assert.deepEqual(THEME_OPTIONS, [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ]);
});
