import { expect, test, type Page } from "@playwright/test";

/** A stand-in BFF at http://bff.test with the same routes and error shape as wmd-bff. */
async function mockBff(page: Page) {
  const products = [
    { id: "sku-coffee", name: "Cold Brew Coffee", description: "Smooth cold brew, 1 L bottle", priceCents: 899, stock: 40, available: true, lowStock: false, restockDate: "2099-10-20" },
    { id: "sku-eggs", name: "Free-Range Eggs", description: "One dozen large eggs", priceCents: 549, stock: 0, available: false, lowStock: false, restockDate: null },
    { id: "sku-berries", name: "Mixed Berries", description: "Strawberries, blueberries and raspberries, 500 g", priceCents: 799, stock: 3, available: true, lowStock: true, restockDate: null },
    { id: "sku-bagels", name: "Bagels", description: "Fresh bagels", priceCents: 499, stock: 0, available: false, lowStock: false, restockDate: "2099-10-20" },
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
      const sort = url.searchParams.get("sort") || "featured";
      if (!["featured", "price_asc", "price_desc", "name_asc"].includes(sort)) {
        return json(400, { error: { code: "invalid_request", message: "Invalid sort." } });
      }
      const list = products.filter((p) => !q || p.name.toLowerCase().includes(q));
      list.sort((a, b) => {
        const price = sort === "price_asc" ? a.priceCents - b.priceCents
          : sort === "price_desc" ? b.priceCents - a.priceCents : 0;
        return price || a.name.localeCompare(b.name) || (sort === "featured" ? 0 : a.id.localeCompare(b.id));
      });
      return json(200, list);
    }
    if (url.pathname === "/v1/orders" && request.method() === "POST") {
      const { items, giftMessage, deliveryWindow = "morning" } = request.postDataJSON();
      if (!["morning", "afternoon", "evening"].includes(deliveryWindow)) {
        return json(400, { error: { code: "invalid_request", message: "Invalid delivery window." } });
      }
      const lines = items.map((i: { productId: string; quantity: number }) => {
        const p = products.find((x) => x.id === i.productId)!;
        return { productId: p.id, name: p.name, quantity: i.quantity, priceCents: p.priceCents };
      });
      const order = { id: "3f2a9c1e-1111-2222-3333-444455556666", userId: "user-demo", status: "pending", lines,
        totalCents: lines.reduce((s: number, l: { quantity: number; priceCents: number }) => s + l.quantity * l.priceCents, 0),
        giftMessage: giftMessage ?? null, deliveryWindow,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      polls = 0;
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
        id: `n-${o.id}`, orderId: o.id, title: "Order confirmed", body: `Your order ${String(o.id).slice(0, 8)} for $${(Number(o.totalCents) / 100).toFixed(2)} is confirmed for delivery in the ${o.deliveryWindow === "evening" ? "evening (5–9pm)" : o.deliveryWindow === "afternoon" ? "afternoon (12–5pm)" : "morning (8am–12pm)"}.${o.giftMessage ? ` Gift message: ${o.giftMessage}` : ""}`,
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
  if (!REAL) {
    await expect(page.getByTestId("stock-sku-coffee")).toHaveText("40 in stock");
    await expect(page.getByTestId("stock-sku-eggs")).toHaveText("Out of stock");
    await expect(page.getByTestId("stock-sku-bagels")).toHaveText("Back on Oct 20");
    await expect(page.getByTestId("stock-sku-bagels")).toHaveCSS("color", "rgb(179, 64, 42)");
    await expect(page.getByTestId("stock-sku-eggs")).toHaveCSS("color", "rgb(179, 64, 42)");
    await expect(page.getByTestId("add-sku-bagels")).toHaveCount(0);
    await expect(page.getByTestId("low-stock-sku-berries")).toBeVisible();
    await expect(page.getByTestId("low-stock-sku-berries")).toHaveText("Only 3 left");
    await expect(page.getByTestId("low-stock-sku-coffee")).toHaveCount(0);
    await expect(page.getByTestId("low-stock-sku-eggs")).toHaveCount(0);

    const list = page.locator('[data-testid^="product-sku-"]');
    const order = async (ids: string[]) => {
      await expect(list).toHaveCount(ids.length);
      for (const [index, id] of ids.entries()) {
        await expect(list.nth(index)).toHaveAttribute("data-testid", `product-sku-${id}`);
      }
    };
    const sortButton = page.getByTestId("sort-button");
    const openSortMenu = async () => {
      await sortButton.click();
      await expect(sortButton).toHaveAttribute("aria-expanded", "true");
      await expect(page.getByTestId("sort-menu")).toBeVisible();
    };
    const expectSortClosed = async (label: string) => {
      await expect(sortButton).toHaveText(`Sort: ${label}`);
      await expect(sortButton).toHaveAttribute("aria-expanded", "false");
      await expect(page.getByTestId("sort-menu")).toHaveCount(0);
    };
    const chooseSort = async (value: string, label: string) => {
      await openSortMenu();
      await page.getByTestId(`sort-${value}`).click();
      await expectSortClosed(label);
      await openSortMenu();
      await expect(page.getByTestId(`sort-${value}`)).toBeChecked();
      if (value !== "featured") {
        await expect(page.getByTestId("sort-featured")).not.toBeChecked();
      }
      await page.getByTestId("sort-menu-backdrop").click({ position: { x: 5, y: 5 } });
      await expectSortClosed(label);
    };
    await expectSortClosed("Featured");
    await openSortMenu();
    await expect(page.getByTestId("sort-featured")).toBeChecked();
    await page.getByTestId("sort-menu-backdrop").click({ position: { x: 5, y: 5 } });
    await expectSortClosed("Featured");
    await order(["bagels", "coffee", "eggs", "berries"]);
    await chooseSort("price_asc", "Price: low to high");
    await order(["bagels", "eggs", "berries", "coffee"]);
    await chooseSort("price_desc", "Price: high to low");
    await order(["coffee", "berries", "eggs", "bagels"]);
    await page.getByTestId("search").fill("b");
    await order(["coffee", "berries", "bagels"]);
    await chooseSort("price_asc", "Price: low to high");
    await order(["bagels", "berries", "coffee"]);
    await page.getByTestId("search").fill("");
    await order(["bagels", "eggs", "berries", "coffee"]);
    await chooseSort("name_asc", "Name (A–Z)");
    await order(["bagels", "coffee", "eggs", "berries"]);
    const featuredResponse = page.waitForResponse((response) =>
      response.url() === "http://bff.test/v1/catalog/products" && response.status() === 200);
    await chooseSort("featured", "Featured");
    await featuredResponse;
    await order(["bagels", "coffee", "eggs", "berries"]);
  }

  await page.getByTestId("search").fill("cold");
  await expect(page.getByTestId("product-sku-eggs")).toHaveCount(0);
  if (!REAL) await expect(page.getByTestId("product-sku-berries")).toHaveCount(0);
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
  await expect(page.getByTestId("delivery-window-morning")).toBeChecked();
  await expect(page.getByTestId("delivery-window-afternoon")).toHaveText("Afternoon (12–5pm)");
  await expect(page.getByTestId("delivery-window-evening")).toHaveText("Evening (5–9pm)");
  await page.getByTestId("gift-message").fill("Enjoy your coffee!");
  await page.getByTestId("place-order").click();

  await expect(page.getByTestId("order-screen")).toBeVisible();
  await expect(page.getByTestId("order-total")).toHaveText("$17.98");
  await expect(page.getByTestId("order-delivery-window")).toHaveText("Morning (8am–12pm)");
  await expect(page.getByTestId("order-gift-message")).toHaveText("Enjoy your coffee!");
  await expect(page.getByTestId("order-status")).toContainText("confirmed", { timeout: 10_000 });

  await page.getByTestId("tab-inbox").click();
  await expect(page.getByText("Order confirmed").first()).toBeVisible();
  await expect(page.locator('[data-testid^="inbox-delivery-window-"]').last()).toHaveText("Morning (8am–12pm)");

  await page.getByTestId("tab-shop").click();
  await expect(page.getByTestId("sort-button")).toHaveText("Sort: Featured");
  await page.getByTestId("add-sku-coffee").click();
  await page.getByTestId("cart-button").click();
  await expect(page.getByTestId("delivery-window-morning")).toBeChecked();
  await page.getByTestId("delivery-window-evening").click();
  await expect(page.getByTestId("delivery-window-evening")).toBeChecked();
  await expect(page.getByTestId("delivery-window-morning")).not.toBeChecked();
  await page.getByTestId("place-order").click();

  await expect(page.getByTestId("order-screen")).toBeVisible();
  await expect(page.getByTestId("order-total")).toBeVisible();
  await expect(page.getByTestId("order-gift-message")).toHaveCount(0);
  await expect(page.getByTestId("order-delivery-window")).toHaveText("Evening (5–9pm)");
  await expect(page.getByTestId("order-status")).toContainText("confirmed", { timeout: 10_000 });
  await page.getByTestId("tab-inbox").click();
  await expect(page.locator('[data-testid^="inbox-delivery-window-"]').last()).toHaveText("Evening (5–9pm)");
  await expect(page.locator('[data-testid^="notification-"]').last()).toContainText("confirmed for delivery in the evening (5–9pm).");
});
