import assert from "node:assert/strict";
import { test } from "node:test";
import { INBOX_EMPTY_TEXT } from "../src/inbox-empty.ts";

test("the empty inbox explains where order updates appear", () => {
  assert.equal(INBOX_EMPTY_TEXT, "No notifications yet. Place an order and its updates will appear here.");
});
