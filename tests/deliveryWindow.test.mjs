import assert from "node:assert/strict";
import { test } from "node:test";
import { deliveryWindowLabel } from "../src/deliveryWindow.ts";

test("delivery windows have their shopper-facing labels", () => {
  assert.equal(deliveryWindowLabel("morning"), "Morning (8am–12pm)");
  assert.equal(deliveryWindowLabel("afternoon"), "Afternoon (12–5pm)");
  assert.equal(deliveryWindowLabel("evening"), "Evening (5–9pm)");
});

test("missing and null delivery windows default to Morning", () => {
  assert.equal(deliveryWindowLabel(), "Morning (8am–12pm)");
  assert.equal(deliveryWindowLabel(null), "Morning (8am–12pm)");
});
