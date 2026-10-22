import { expect, test, type Page } from "@playwright/test";

async function addShampooToCart(page: Page) {
  await page.context().addCookies([
    { name: "ajoin_consent", value: "essential", url: test.info().project.use.baseURL ?? "http://localhost:3200" },
  ]);
  await page.goto("/nl/products/onion-shampoo");
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByText("Ajuinshampoo")).toBeVisible();
}

test("cart drawer prices the cart and sends it to checkout", async ({ page }) => {
  // Intercept the checkout API so this test runs without Stripe credentials.
  let body: Record<string, unknown> | null = null;
  await page.route("**/api/checkout", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ json: { url: "/nl/checkout/success?session_id=test" } });
  });

  await addShampooToCart(page);
  await page.getByRole("dialog").getByRole("button", { name: "Aantal verhogen" }).click();
  await expect(page.getByRole("dialog").getByText("€ 49,80").first()).toBeVisible();
  await page.getByTestId("checkout-button").click();
  await page.waitForURL("**/checkout/success**");

  expect(body).toMatchObject({ locale: "nl", country: "BE", cart: { lines: [{ sku: "AJ-SH-250", qty: 2 }] } });
  // The success page empties the cart.
  await expect(page.getByTestId("cart-button")).toHaveAccessibleName(/leeg|empty/i);
});

test("reaches Stripe Checkout in test mode", async ({ page }) => {
  test.skip(!process.env.E2E_BASE_URL && !process.env.STRIPE_SECRET_KEY, "needs Stripe test keys or a deployed site");
  await addShampooToCart(page);
  await page.getByTestId("checkout-button").click();
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });
  await expect(page).toHaveURL(/checkout\.stripe\.com/);
});

test("showcase mode explains that ordering opens soon", async ({ page }) => {
  test.skip(Boolean(process.env.STRIPE_SECRET_KEY), "only applies while Stripe isn't configured");
  await addShampooToCart(page);
  await page.getByTestId("checkout-button").click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("binnenkort");
});
