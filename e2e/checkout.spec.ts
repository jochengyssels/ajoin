import { expect, test, type Page } from "@playwright/test";

const PRODUCT = "/nl/products/ajoin-shine-shampoo";

async function openProduct(page: Page) {
  await page.context().addCookies([
    { name: "ajoin_consent", value: "essential", url: test.info().project.use.baseURL ?? "http://localhost:3200" },
  ]);
  await page.goto(PRODUCT);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ajoin & Shine shampoo");
}

const isComingSoon = (page: Page) => page.getByTestId("coming-soon").isVisible();

test("the shop link leads to the one product", async ({ page }) => {
  await page.goto("/nl/shop");
  await expect(page).toHaveURL(/\/nl\/products\/ajoin-shine-shampoo$/);
});

test("without a confirmed price, nothing is priced and nothing can be bought", async ({ page }) => {
  await openProduct(page);
  test.skip(!(await isComingSoon(page)), "the product has a real price");
  await expect(page.getByTestId("coming-soon")).toHaveText("Binnenkort verkrijgbaar");
  await expect(page.getByTestId("add-to-cart")).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText("€");
  await expect(page.locator("main")).not.toContainText("TODO");
});

test("cart prices the product and sends it to checkout", async ({ page }) => {
  await openProduct(page);
  test.skip(await isComingSoon(page), "no price yet: the product can't be bought");

  let body: Record<string, unknown> | null = null;
  await page.route("**/api/checkout", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ json: { url: "/nl/checkout/success?session_id=test" } });
  });
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Aantal verhogen" }).click();
  await page.getByTestId("checkout-button").click();
  await page.waitForURL("**/checkout/success**");
  expect(body).toMatchObject({ locale: "nl", country: "BE", cart: { lines: [{ qty: 2 }] } });
  await expect(page.getByTestId("cart-button")).toHaveAccessibleName(/leeg/);
});

test("reaches Stripe Checkout in test mode", async ({ page }) => {
  test.skip(process.env.E2E_STRIPE !== "1", "set E2E_STRIPE=1 once the target site has Stripe test keys");
  await openProduct(page);
  await page.getByTestId("add-to-cart").click();
  await page.getByTestId("checkout-button").click();
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });
});
