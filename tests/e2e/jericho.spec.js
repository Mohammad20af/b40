import { test, expect } from "@playwright/test";

test("Jericho homepage links and category navigation work", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".hero h1")).toContainText("ستايلك يبدأ");
  await expect(page.locator(".category-card")).toHaveCount(5);
  await expect(page.locator(".arrivals .product-card")).toHaveCount(4);
  await expect(page.locator(".instagram-grid a")).toHaveCount(4);
  for (const link of await page.locator('a[href*="instagram.com"]').all())
    await expect(link).toHaveAttribute(
      "href",
      "https://www.instagram.com/b40.jericho/",
    );
  for (const link of await page.locator('a[href*="wa.me"]').all())
    await expect(link).toHaveAttribute("href", "https://wa.me/972533781655");
  await expect(page.locator("footer")).toContainText(
    "This site was created by Nexaura",
  );
  for (const category of ["تيشيرتات", "بناطيل", "هوديز", "جاكيتات", "أحذية"]) {
    await page.locator(".category-card").filter({ hasText: category }).click();
    await expect(page.locator(".product-card").first()).toBeVisible();
    expect(new URL(page.url()).searchParams.get("category")).toBe(category);
    await page.goto("/");
  }
  await page.goto("/shop");
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "فتح القائمة" }).click();
  await page
    .getByRole("link", { name: "من نحن", exact: true })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/\/#about$/);
  await expect(page.locator("#about")).toBeInViewport();
  await expect(page.locator("#mobile-nav")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "فتح القائمة" }).click();
  await page
    .getByRole("link", { name: "من نحن", exact: true })
    .filter({ visible: true })
    .click();
  await expect(page.locator("#about")).toBeInViewport();
  await page.goto("/branches");
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator('a[href="tel:+972533781655"]')).toBeVisible();
});

test("quick add requires size, preserves color and size, and restores keyboard focus", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.locator(".quick-add").first();
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "أضف إلى الحقيبة" }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("button", { name: "إغلاق", exact: true }).click();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("button", { name: "M", exact: true }).click();
  await dialog.getByRole("button", { name: "رمادي", exact: true }).click();
  await dialog.getByRole("button", { name: "أضف إلى الحقيبة" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".bag")).toContainText("1");
  await trigger.click();
  await expect(
    dialog.getByRole("button", { name: "أضف إلى الحقيبة" }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "L", exact: true }).click();
  await dialog.getByRole("button", { name: "أضف إلى الحقيبة" }).click();
  await page.locator(".bag").click();
  await page.reload();
  await expect(page.locator(".cart-item")).toHaveCount(2);
  await expect(page.locator(".cart-item").first()).toContainText("M");
  await expect(page.locator(".cart-item").first()).toContainText("رمادي");
  await expect(page.locator(".cart-item").last()).toContainText("L");
  await page.goto("/shop");
  await expect(
    page
      .locator(".product-card")
      .filter({ hasText: "جاكيت ميدنايت" })
      .locator(".quick-add"),
  ).toBeDisabled();
});

test("filled cart, checkout and quick add fit a 320px phone", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/shop");
  await page.locator(".quick-add").first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeInViewport();
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  await page.screenshot({
    path: `test-results/quick-add-320-${info.project.name}.png`,
  });
  await dialog.getByRole("button", { name: "M", exact: true }).click();
  await dialog.getByRole("button", { name: "أضف إلى الحقيبة" }).click();
  for (const route of [
    "/cart",
    "/checkout",
    "/contact",
    "/missing",
    "/product/missing",
  ]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
    await page.screenshot({
      path: `test-results/filled-${route.replaceAll("/", "-")}-320-${info.project.name}.png`,
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});
