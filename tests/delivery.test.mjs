import assert from "node:assert/strict";
import { test } from "node:test";
import { deliveryWindowLabel } from "../src/delivery.ts";

test("delivery windows use the contract labels and default to Morning", () => {
  assert.equal(deliveryWindowLabel("morning"), "Morning (8am–12pm)");
  assert.equal(deliveryWindowLabel("afternoon"), "Afternoon (12–5pm)");
  assert.equal(deliveryWindowLabel("evening"), "Evening (5–9pm)");
  assert.equal(deliveryWindowLabel(), "Morning (8am–12pm)");
});
