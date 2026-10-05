import assert from "node:assert/strict";
import test from "node:test";
import { api } from "../src/api.ts";

test("does not send a gift message when the feature is disabled", async () => {
  let body: unknown;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    body = JSON.parse(init?.body as string);
    return new Response(JSON.stringify({}), { status: 201, headers: { "content-type": "application/json" } });
  };

  try {
    await api.placeOrder("token", [{ productId: "sku-coffee", quantity: 1 }], "Enjoy your coffee!");
    assert.deepEqual(body, { items: [{ productId: "sku-coffee", quantity: 1 }] });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
