import { test, expect } from "@playwright/test";
import { signInDemo } from "./helpers/admin";

async function inventory(page) {
  await signInDemo(page);
  await page.getByRole("link", { name: "المخزون", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "المخزون", exact: true }),
  ).toBeVisible();
}
const firstCard = (page) => page.locator(".inventory-card").first();
async function setQuantity(card, size, quantity) {
  const input = card.getByRole("spinbutton", {
    name: `مخزون ${size}`,
    exact: true,
  });
  await input.fill(String(quantity));
  await input.press("Enter");
  await expect(input).toHaveValue(String(quantity));
}
async function setStock(page, size, quantity) {
  await page.evaluate(
    async ({ size, quantity }) => {
      const { catalogService } = await import("/src/services/store.js");
      catalogService.setStock(catalogService.list()[0].id, size, quantity);
    },
    { size, quantity },
  );
}

test("inventory edits, summaries, category search and persistence", async ({
  page,
  context,
}) => {
  await inventory(page);
  await expect(page.locator(".inventory-card")).toHaveCount(12);
  const card = firstCard(page);
  const input = card.getByRole("spinbutton", { name: "مخزون S", exact: true });
  await expect(input).toHaveValue("5");
  await card
    .getByRole("button", { name: "زيادة مخزون S", exact: true })
    .click();
  await expect(input).toHaveValue("6");
  await card
    .getByRole("button", { name: "تقليل مخزون S", exact: true })
    .click();
  await expect(input).toHaveValue("5");
  for (const size of ["S", "M", "L", "XL"]) await setQuantity(card, size, 0);
  await expect(card.locator("footer")).toContainText("إجمالي المخزون: 0");
  await expect(card.locator("footer .status-badge")).toHaveText("نفد");
  await expect(
    card.getByRole("button", { name: "تقليل مخزون S", exact: true }),
  ).toBeDisabled();
  await expect(
    page
      .locator(".admin-stat")
      .filter({ hasText: "منتجات نفدت من المخزون" })
      .locator("strong"),
  ).toHaveText("2");
  await setQuantity(card, "S", 2);
  await expect(card.locator("footer .status-badge")).toHaveText("مخزون منخفض");
  await expect(
    page
      .locator(".admin-stat")
      .filter({ hasText: "منتجات مخزونها منخفض" })
      .locator("strong"),
  ).toHaveText("1");
  await expect(
    page
      .locator(".admin-stat")
      .filter({ hasText: "إجمالي القطع في المخزون" })
      .locator("strong"),
  ).toHaveText("217");
  await input.fill("-3");
  await input.press("Enter");
  await expect(input).toHaveValue("2");
  await input.fill("1.5");
  await input.press("Enter");
  await expect(input).toHaveValue("2");
  await page.reload();
  await expect(input).toHaveValue("2");
  const reopened = await context.newPage();
  await reopened.goto("/admin/inventory");
  await expect(
    firstCard(reopened).getByRole("spinbutton", {
      name: "مخزون S",
      exact: true,
    }),
  ).toHaveValue("2");
  await reopened.close();
  const search = page.getByRole("textbox", { name: "بحث في المخزون" });
  await search.fill("أحذية");
  await expect(page.locator(".inventory-card")).toHaveCount(3);
  await setQuantity(firstCard(page), "40", 7);
  await search.fill("تيشيرت أساسي");
  await expect(page.locator(".inventory-card")).toHaveCount(1);
  await search.fill("missing");
  await expect(
    page.getByRole("heading", { name: "لا توجد منتجات بهذا البحث" }),
  ).toBeVisible();
});

test("unavailable sizes, quantity limits, colors, quick add and sold-out products", async ({
  page,
}) => {
  await inventory(page);
  await setQuantity(firstCard(page), "S", 0);
  await setQuantity(firstCard(page), "M", 3);
  await page.goto("/product/01");
  await expect(
    page.getByRole("button", { name: "S - نفد", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.getByRole("button", { name: "زيادة الكمية", exact: true }).click();
  await page.getByRole("button", { name: "زيادة الكمية", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "زيادة الكمية", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "تقليل الكمية", exact: true }).click();
  await page
    .getByRole("button", { name: "أضف إلى الحقيبة", exact: true })
    .click();
  await page.getByRole("button", { name: "رمادي", exact: true }).click();
  await expect(page.getByRole("status", { name: "الكمية" })).toHaveText("1");
  await page
    .getByRole("button", { name: "أضف إلى الحقيبة", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "أضف إلى الحقيبة", exact: true }),
  ).toBeDisabled();
  await page.goto("/cart");
  await expect(page.locator(".cart-item")).toHaveCount(2);
  for (const button of await page
    .getByRole("button", { name: "زيادة الكمية", exact: true })
    .all())
    await expect(button).toBeDisabled();
  await page.goto("/shop");
  await page.locator(".quick-add").first().click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("button", { name: "S - نفد", exact: true }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "M", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "أضف إلى الحقيبة" }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "إغلاق", exact: true }).click();
  for (const size of ["S", "M", "L", "XL"]) await setStock(page, size, 0);
  await expect(page.locator(".product-card").first()).toContainText(
    "نفد من المخزون",
  );
  await expect(page.locator(".quick-add").first()).toBeDisabled();
  await page.goto("/product/01");
  await expect(page.locator(".product-info")).toContainText("نفد من المخزون");
  await expect(
    page.getByRole("button", { name: "أضف إلى الحقيبة", exact: true }),
  ).toBeDisabled();
});

test("stock reductions in another tab reconcile and persist the cart without restoring removed quantities", async ({
  page,
  context,
}) => {
  await page.goto("/product/01");
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.getByRole("button", { name: "زيادة الكمية", exact: true }).click();
  await page
    .getByRole("button", { name: "أضف إلى الحقيبة", exact: true })
    .click();
  await page.goto("/cart");
  const admin = await context.newPage();
  await inventory(admin);
  await setQuantity(firstCard(admin), "M", 1);
  await expect(page.getByRole("status", { name: "الكمية" })).toHaveText("1");
  await expect(page.locator(".toast")).toContainText("تم تعديل الحقيبة");
  await setQuantity(firstCard(admin), "M", 5);
  await expect(page.getByRole("status", { name: "الكمية" })).toHaveText("1");
  await page.reload();
  await expect(page.getByRole("status", { name: "الكمية" })).toHaveText("1");
  await setQuantity(firstCard(admin), "M", 0);
  await expect(
    page.getByRole("heading", { name: "حقيبتك تنتظر أول قطعة" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem("b40-cart-v1"))),
    )
    .toEqual([]);
});

test("inventory storage failures never report success or change stock", async ({
  page,
}) => {
  await inventory(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "b40-products-v1")
        throw new DOMException("full", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await firstCard(page)
    .getByRole("button", { name: "زيادة مخزون S", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("تعذّر حفظ المخزون");
  await expect(
    firstCard(page).getByRole("spinbutton", { name: "مخزون S", exact: true }),
  ).toHaveValue("5");
  await expect(page.locator(".admin-notice")).toBeEmpty();
});

test("catalog edits preserve latest stock and migrate added and removed sizes", async ({
  page,
}) => {
  await page.goto("/shop");
  const result = await page.evaluate(async () => {
    const { catalogService } = await import("/src/services/store.js");
    const stale = catalogService.list()[0];
    catalogService.setStock(stale.id, "M", 1);
    catalogService.save({ ...stale, sizes: ["M", "custom"] });
    const updated = catalogService.get(stale.id);
    const created = catalogService.save({
      ...stale,
      id: undefined,
      sku: undefined,
      sizes: ["36", "38"],
    });
    catalogService.remove(created.id);
    return {
      stock: updated.stockBySize,
      created: created.stockBySize,
      removed: !catalogService.get(created.id),
    };
  });
  expect(result).toEqual({
    stock: { M: 1, custom: 5 },
    created: { 36: 5, 38: 5 },
    removed: true,
  });
});

test("add-to-cart checks current storage even before the UI receives an inventory update", async ({
  page,
}) => {
  await page.goto("/product/01");
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.evaluate(async () => {
    const { catalogService, storageKeys } =
      await import("/src/services/store.js");
    const catalog = catalogService.list();
    catalog[0].stockBySize.M = 0;
    localStorage.setItem(storageKeys.products, JSON.stringify(catalog));
  });
  await page
    .getByRole("button", { name: "أضف إلى الحقيبة", exact: true })
    .click();
  await expect(page.locator(".toast")).toContainText(
    "الكمية المطلوبة غير متوفرة",
  );
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("b40-cart-v1"))),
  ).toEqual([]);
});

test("checkout rejects stock changed while waiting to save the order", async ({
  page,
}) => {
  await page.goto("/product/01");
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.getByRole("button", { name: "زيادة الكمية", exact: true }).click();
  await page
    .getByRole("button", { name: "أضف إلى الحقيبة", exact: true })
    .click();
  await page.goto("/checkout");
  await page
    .getByRole("textbox", { name: "الاسم الكامل" })
    .fill("عميل المخزون");
  await page.getByRole("textbox", { name: "رقم الهاتف" }).fill("0500000000");
  await page
    .getByRole("textbox", { name: "العنوان بالتفصيل" })
    .fill("عنوان تجريبي للمخزون");
  await page.evaluate(async () => {
    const { catalogService } = await import("/src/services/store.js");
    const request = navigator.locks.request.bind(navigator.locks);
    navigator.locks.request = (name, callback) =>
      request(name, (lock) => {
        catalogService.setStock(catalogService.list()[0].id, "M", 1);
        return callback(lock);
      });
  });
  await page.getByRole("button", { name: "تأكيد الطلب", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("تغيّر المخزون");
  await expect(page.locator(".order-success")).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("b40-orders-v1")),
  ).toBeNull();
  await expect(page.getByRole("textbox", { name: "الاسم الكامل" })).toHaveValue(
    "عميل المخزون",
  );
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("b40-cart-v1"))[0]?.quantity,
      ),
    )
    .toBe(1);
});

test("inventory layout fits phone, tablet and desktop without errors", async ({
  page,
}, info) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await inventory(page);
  for (const width of info.project.name === "mobile"
    ? [320, 390]
    : [768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      firstCard(page).getByRole("spinbutton", { name: "مخزون S", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  await page.screenshot({
    path: `test-results/inventory-${info.project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
