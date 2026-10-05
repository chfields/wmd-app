import { expect, test, type Page } from "@playwright/test";

/** A stand-in BFF at http://bff.test with the same routes and error shape as wmd-bff. */
async function mockBff(page: Page) {
  const products = [
    { id: "sku-coffee", name: "Cold Brew Coffee", description: "Smooth cold brew, 1 L bottle", priceCents: 899, stock: 40, available: true },
    { id: "sku-eggs", name: "Free-Range Eggs", description: "One dozen large eggs", priceCents: 549, stock: 0, available: false },
  ];
  const orders = new Map<string, Record<string, unknown>>();
  let polls = 0;
  await page.route("http://bff.test/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const json = (status: number, body: unknown) =>
      route.fulfill({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
    if (request.method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    }
    if (url.pathname === "/v1/session") {
      const { password } = request.postDataJSON();
      return password === "letmein"
        ? json(200, { token: "t", user: { id: "user-demo", email: "demo@wmd.shop", name: "Demo" } })
        : json(401, { error: { code: "invalid_credentials", message: "That email and password don't match." } });
    }
    if (url.pathname === "/v1/catalog/products") {
      const q = (url.searchParams.get("q") ?? "").toLowerCase();
      return json(200, products.filter((p) => !q || p.name.toLowerCase().includes(q)));
    }
    if (url.pathname === "/v1/orders" && request.method() === "POST") {
      const { items, giftMessage } = request.postDataJSON();
      const lines = items.map((i: { productId: string; quantity: number }) => {
        const p = products.find((x) => x.id === i.productId)!;
        return { productId: p.id, name: p.name, quantity: i.quantity, priceCents: p.priceCents };
      });
      const order = { id: "3f2a9c1e-1111-2222-3333-444455556666", userId: "user-demo", status: "pending", lines,
        totalCents: lines.reduce((s: number, l: { quantity: number; priceCents: number }) => s + l.quantity * l.priceCents, 0),
        giftMessage: giftMessage ?? null,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      orders.set(order.id, order);
      return json(201, order);
    }
    if (url.pathname.startsWith("/v1/orders/")) {
      const order = orders.get(url.pathname.split("/").pop()!)!;
      // Confirmed on the second poll, as when notification-service answers a moment later.
      if (++polls >= 2) order.status = "confirmed";
      return json(200, order);
    }
    if (url.pathname === "/v1/orders") return json(200, [...orders.values()]);
    if (url.pathname === "/v1/notifications") {
      return json(200, [...orders.values()].filter((o) => o.status === "confirmed").map((o) => ({
        id: `n-${o.id}`, orderId: o.id, title: "Order confirmed", body: "Your order 3f2a9c1e for $17.98 is confirmed.",
        status: "delivered", createdAt: new Date().toISOString() })));
    }
    return json(404, { error: { code: "not_found", message: url.pathname } });
  });
}

// E2E_REAL=1 runs against the BFF the web build was exported with (local stack or staging),
// signing in with E2E_PASSWORD. Otherwise a mocked BFF answers at http://bff.test.
const REAL = process.env.E2E_REAL === "1";
const PASSWORD = REAL ? (process.env.E2E_PASSWORD ?? "demo") : "letmein";

test("sign in, browse, order, see it confirmed and in the inbox", async ({ page }) => {
  if (!REAL) await mockBff(page);
  await page.goto("/");

  await page.getByTestId("password").fill("wrong");
  await page.getByTestId("sign-in").click();
  await expect(page.getByTestId("sign-in-error")).toHaveText("That email and password don't match.");

  await page.getByTestId("password").fill(PASSWORD);
  await page.getByTestId("sign-in").click();
  await expect(page.getByTestId("product-sku-coffee")).toBeVisible();
  await expect(page.getByTestId("product-sku-eggs")).toContainText("Out of stock");

  await page.getByTestId("search").fill("cold");
  await expect(page.getByTestId("product-sku-eggs")).toHaveCount(0);
  await expect(page.getByTestId("cart-badge")).toHaveCount(0);

  await page.getByTestId("add-sku-coffee").click();
  await page.getByTestId("add-sku-coffee").click();
  await expect(page.getByTestId("qty-sku-coffee")).toHaveText("2");
  await expect(page.getByTestId("cart-badge")).toHaveText("2");
  await expect(page.getByTestId("cart-button")).toHaveAccessibleName("Cart, 2 items");
  await page.getByTestId("cart-button").click();
  await expect(page.getByTestId("cart-screen")).toBeVisible();
  await expect(page.getByTestId("cart-item-sku-coffee")).toContainText("Cold Brew Coffee");
  await expect(page.getByTestId("cart-item-sku-coffee")).toContainText("2");
  await expect(page.getByTestId("cart-item-sku-coffee")).toContainText("$17.98");
  await expect(page.getByTestId("cart-total")).toHaveText("$17.98");
  await page.getByTestId("gift-message").fill("Enjoy your coffee!");
  await page.getByTestId("place-order").click();

  await expect(page.getByTestId("order-screen")).toBeVisible();
  await expect(page.getByTestId("order-total")).toHaveText("$17.98");
  await expect(page.getByTestId("order-gift-message")).toHaveText("Enjoy your coffee!");
  await expect(page.getByTestId("order-status")).toContainText("confirmed", { timeout: 10_000 });

  await page.getByTestId("tab-inbox").click();
  await expect(page.getByText("Order confirmed").first()).toBeVisible();
});
