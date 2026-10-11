import assert from "node:assert/strict";
import { test } from "node:test";
import { itemCountLabel } from "../src/item-count.ts";

test("one item uses the singular label", () => {
  assert.equal(itemCountLabel(1), "1 item");
});

test("zero items uses the plural label", () => {
  assert.equal(itemCountLabel(0), "0 items");
});

test("multiple items use the plural label", () => {
  assert.equal(itemCountLabel(5), "5 items");
});

test("an undefined count has no label", () => {
  assert.equal(itemCountLabel(undefined), null);
});
