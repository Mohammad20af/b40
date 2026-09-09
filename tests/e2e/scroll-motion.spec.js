import { test, expect } from "@playwright/test";

test("cards reveal on entry, later rows wait, and completed reveals do not replay", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/shop");
  const cards = page.locator(".product-card");
  const last = cards.last();
  await expect(last).toHaveCSS("opacity", "0");
  await cards.first().scrollIntoViewIfNeeded();
  await expect(cards.first()).toHaveCSS("opacity", "1");
  await expect(cards.first().locator("img")).toHaveCSS("opacity", "1");
  await expect(last).toHaveCSS("opacity", "0");
  await last.scrollIntoViewIfNeeded();
  await expect(last).toHaveCSS("opacity", "1");
  await expect(last.locator("img")).toHaveCSS("opacity", "1");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(last).toHaveCSS("opacity", "1");
  await last.scrollIntoViewIfNeeded();
  await expect(last).toHaveCSS("opacity", "1");
});

test("collection parallax is bounded and text/image reveal respects reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const image = page.locator(".collection-clothes > img");
  const title = page.locator(".collection-clothes h2");
  await expect(image).toHaveCSS("opacity", "0");
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveCSS("opacity", "1");
  await expect(title).toHaveCSS("opacity", "1");
  await expect
    .poll(() =>
      image.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a),
    )
    .toBeCloseTo(1.025, 2);
  const before = await image.evaluate(
    (el) => new DOMMatrix(getComputedStyle(el).transform).m42,
  );
  await page.evaluate(() => scrollBy({ top: 100, behavior: "instant" }));
  await expect
    .poll(() =>
      image.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42),
    )
    .not.toBe(before);
  expect(
    await image.evaluate((el) =>
      Math.abs(new DOMMatrix(getComputedStyle(el).transform).m42),
    ),
  ).toBeLessThan(8);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".product-card").last()).toHaveCSS("opacity", "1");
  await expect(image).toHaveCSS("opacity", "1");
  await expect(image).toHaveCSS("transform", "none");
  await expect(title).toHaveCSS("opacity", "1");
  await expect(title).toHaveCSS("transform", "none");
});
