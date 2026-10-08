import assert from "node:assert/strict";
import { test } from "node:test";
import { money } from "../src/api.ts";

test("money formats cents as dollars with two decimals", () => {
  assert.equal(money(0), "$0.00");
  assert.equal(money(549), "$5.49");
  assert.equal(money(1200), "$12.00");
});

test("money formats prices under one dollar", () => {
  assert.equal(money(5), "$0.05");
  assert.equal(money(99), "$0.99");
});
