import assert from "node:assert/strict";
import { test } from "node:test";
import { stockLabel } from "../src/restock.ts";

const today = new Date(2026, 9, 6, 15);
const product = { available: false, stock: 0 };

test("out-of-stock products show future and today's restock dates", () => {
  assert.equal(stockLabel({ ...product, restockDate: "2026-10-20" }, today), "Back on Oct 20");
  assert.equal(stockLabel({ ...product, restockDate: "2026-10-06" }, today), "Back on Oct 6");
});

test("past, null and missing restock dates keep the out-of-stock label", () => {
  assert.equal(stockLabel({ ...product, restockDate: "2026-10-05" }, today), "Out of stock");
  assert.equal(stockLabel({ ...product, restockDate: null }, today), "Out of stock");
  assert.equal(stockLabel(product, today), "Out of stock");
});

test("available products keep their stock count even with a restock date", () => {
  assert.equal(stockLabel({ available: true, stock: 7, restockDate: "2026-10-20" }, today), "7 in stock");
});

test("restock dates stay on their local calendar day in Los Angeles", () => {
  const previousTimezone = process.env.TZ;
  process.env.TZ = "America/Los_Angeles";
  try {
    assert.equal(stockLabel({ ...product, restockDate: "2026-10-20" }, new Date(2026, 9, 20, 23)), "Back on Oct 20");
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
  }
});
