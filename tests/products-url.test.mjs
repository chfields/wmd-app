import assert from "node:assert/strict";
import { test } from "node:test";
import { productsUrl } from "../src/products-url.ts";

test("products URLs preserve the default route and encode query and sort", () => {
  assert.equal(productsUrl(), "/v1/catalog/products");
  assert.equal(productsUrl("coffee & tea"), "/v1/catalog/products?q=coffee%20%26%20tea");
  for (const sort of ["price_asc", "price_desc", "name_asc"]) {
    assert.equal(productsUrl(undefined, sort), `/v1/catalog/products?sort=${sort}`);
    assert.equal(productsUrl("coffee & tea", sort), `/v1/catalog/products?q=coffee%20%26%20tea&sort=${sort}`);
  }
  assert.equal(productsUrl(undefined, "featured"), "/v1/catalog/products");
  assert.equal(productsUrl("coffee", "featured"), "/v1/catalog/products?q=coffee");
  assert.equal(productsUrl(""), "/v1/catalog/products");
});
