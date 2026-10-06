import assert from "node:assert/strict";
import { test } from "node:test";
import { api, BFF_URL } from "../src/api.ts";

test("placeOrder sends the selected delivery window to the BFF with bearer auth", async (t) => {
  const items = [{ productId: "sku-coffee", quantity: 2 }];
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response("{}", { status: 201 }));

  for (const deliveryWindow of ["morning", "afternoon", "evening"]) {
    await api.placeOrder("t", items, " Enjoy! ", deliveryWindow);
    const [url, init] = fetch.mock.calls.at(-1).arguments;
    assert.equal(url, `${BFF_URL}/v1/orders`);
    assert.equal(init.method, "POST");
    assert.equal(init.headers.authorization, "Bearer t");
    assert.deepEqual(JSON.parse(init.body), { items, giftMessage: "Enjoy!", deliveryWindow });
  }
});

test("placeOrder preserves optional fields for callers omitting a delivery window", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response("{}", { status: 201 }));
  const items = [{ productId: "sku-coffee", quantity: 1 }];
  await api.placeOrder("t", items, " ");
  assert.deepEqual(JSON.parse(fetch.mock.calls[0].arguments[1].body), { items });
});
