import assert from "node:assert/strict";
import { test } from "node:test";
import { api, BFF_URL } from "../src/api.ts";

test("placeOrder sends the delivery window when given and omits it otherwise", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, ...init });
    return new Response(JSON.stringify({ id: "order" }), { status: 201 });
  };
  try {
    const items = [{ productId: "sku-coffee", quantity: 1 }];
    for (const window of ["morning", "afternoon", "evening"]) {
      await api.placeOrder("token", items, "  Enjoy!  ", window);
      const call = calls.at(-1);
      assert.equal(call.url, `${BFF_URL}/v1/orders`);
      assert.equal(call.method, "POST");
      assert.equal(call.headers.authorization, "Bearer token");
      assert.deepEqual(JSON.parse(call.body), { items, giftMessage: "Enjoy!", deliveryWindow: window });
    }
    await api.placeOrder("token", items);
    assert.deepEqual(JSON.parse(calls.at(-1).body), { items });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
