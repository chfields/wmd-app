import assert from "node:assert/strict";
import { test } from "node:test";
import { stockLabel } from "../src/restock.ts";

const product = {
  id: "sku-eggs", name: "Eggs", description: "One dozen", priceCents: 549,
  stock: 0, available: false,
};

test("future and same-day restocks use calendar parts without a UTC shift", () => {
  const restocking = { ...product, restockDate: "2026-10-20" };
  assert.equal(stockLabel(restocking, "2026-10-19"), "Back on Oct 20");
  assert.equal(stockLabel(restocking, "2026-10-20"), "Back on Oct 20");
  assert.equal(stockLabel({ ...product, restockDate: "2026-11-01" }, "2026-10-20"), "Back on Nov 1");
});

test("unset and past restocks keep the out-of-stock label", () => {
  for (const restockDate of [null, undefined, "2026-10-19"]) {
    assert.equal(stockLabel({ ...product, restockDate }, "2026-10-20"), "Out of stock");
  }
});

test("available products keep their stock count even with a restock date", () => {
  assert.equal(stockLabel({ ...product, available: true, stock: 3, restockDate: "2026-10-20" }, "2026-10-20"), "3 in stock");
});

test("default today uses the local date across the UTC day boundary", (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-10-21T01:00:00Z").getTime() });
  assert.equal(new Date().getDate(), 20);
  assert.equal(stockLabel({ ...product, restockDate: "2026-10-20" }), "Back on Oct 20");
});
