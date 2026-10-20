import { test, expect } from "@playwright/test";
import { signInDemo } from "./helpers/admin";
import { money } from "../../src/utils/shop.js";
import { deliveryZones } from "../../src/data/branches.js";
import { orderStatuses } from "../../src/data/orders.js";

test("existing SKUs persist, can be searched and edited, and duplicates are rejected", async ({
  page,
}) => {
  await signInDemo(page);
  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("b40-products-v1")),
  );
  expect(new Set(before.map((p) => p.sku)).size).toBe(before.length);
  await page.reload();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("b40-products-v1")).map((p) => p.sku),
    ),
  ).toEqual(before.map((p) => p.sku));
  await page.goto("/admin/products");
  const search = page.getByRole("textbox", { name: "ابحث عن منتج" });
  await search.fill(before[0].sku.toLowerCase());
  await expect(page.locator(".admin-product-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: `تعديل ${before[0].name}`, exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  const sku = dialog.getByRole("textbox", {
    name: "رمز المنتج / SKU",
    exact: true,
  });
  await sku.fill(` ${before[1].sku.toLowerCase()} `);
  await dialog.getByRole("button", { name: "حفظ المنتج", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "رمز المنتج مستخدم بالفعل",
  );
  await sku.fill("b40-test-unique");
  await dialog.getByRole("button", { name: "حفظ المنتج", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await search.fill("B40-TEST-UNIQUE");
  await expect(page.locator(".admin-product-card")).toHaveCount(1);
  await expect(page.locator(".admin-product-card")).toContainText(
    "B40-TEST-UNIQUE",
  );
});

test("multiple images, primary image, reordering, deletion and customer thumbnails persist", async ({
  page,
}, info) => {
  await signInDemo(page);
  await page.goto("/admin/products");
  await page.getByRole("button", { name: "إضافة منتج", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "اسم المنتج", exact: true })
    .fill("منتج صور متعددة");
  await dialog
    .getByRole("textbox", { name: "رمز المنتج / SKU", exact: true })
    .fill("B40-GALLERY-001");
  await dialog
    .getByRole("spinbutton", { name: "السعر", exact: true })
    .fill("180");
  await dialog
    .getByLabel("إضافة صور", { exact: true })
    .setInputFiles([
      "public/images/tee.jpg",
      "public/images/shoe.jpg",
      "public/images/hoodie.jpg",
    ]);
  await expect(dialog.locator(".admin-gallery-image")).toHaveCount(3);
  const lastImage = await dialog
    .locator(".admin-gallery-image img")
    .last()
    .getAttribute("src");
  await dialog
    .getByRole("button", { name: "تعيين الصورة 3 كرئيسية", exact: true })
    .click();
  await expect(dialog.getByAltText("معاينة صورة المنتج")).toHaveAttribute(
    "src",
    lastImage,
  );
  await dialog
    .getByRole("button", { name: "تقديم الصورة 3", exact: true })
    .click();
  const expectedImages = await dialog
    .locator(".admin-gallery-image img")
    .evaluateAll((images) => images.map((img) => img.src));
  await dialog.getByRole("button", { name: "حفظ المنتج", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("b40-products-v1")).find(
      (p) => p.sku === "B40-GALLERY-001",
    ),
  );
  expect(saved.images).toEqual(expectedImages);
  await page.reload();
  await expect(
    page.locator(".admin-product-card").first().locator("img"),
  ).toHaveAttribute("src", lastImage);
  await page.goto(`/product/${saved.id}`);
  await page.setViewportSize({
    width: info.project.name === "mobile" ? 320 : 768,
    height: 900,
  });
  for (let index = 0; index < expectedImages.length; index++) {
    await page.locator(".thumbnails button").nth(index).click();
    await expect(page.locator(".gallery-main img")).toHaveAttribute(
      "src",
      expectedImages[index],
    );
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.goto("/admin/products");
  await page
    .getByRole("button", { name: "تعديل منتج صور متعددة", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "إزالة الصورة 2", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "إزالة الصورة 2", exact: true })
    .click();
  await dialog.getByRole("button", { name: "حفظ المنتج", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page.goto(`/product/${saved.id}`);
  await expect(page.locator(".thumbnails button")).toHaveCount(1);
  await expect(page.locator(".gallery-main img")).toHaveAttribute(
    "src",
    lastImage,
  );
});

test("cart badge, restored cart, delivery prices and full order confirmation survive reopening", async ({
  page,
  context,
}, info) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const badge = page.locator(".header .bag span");
  await page.goto("/product/01");
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.getByRole("button", { name: "زيادة الكمية", exact: true }).click();
  await page
    .getByRole("button", { name: "أضف إلى الحقيبة", exact: true })
    .click();
  await expect(badge).toHaveText("2");
  await page.goto("/product/02");
  await page.getByRole("button", { name: "40", exact: true }).click();
  await page.getByRole("button", { name: "زيادة الكمية", exact: true }).click();
  await page.getByRole("button", { name: "زيادة الكمية", exact: true }).click();
  await page
    .getByRole("button", { name: "أضف إلى الحقيبة", exact: true })
    .click();
  await expect(badge).toHaveText("5");
  await page.goto("/cart");
  await page
    .getByRole("button", { name: "تقليل الكمية", exact: true })
    .first()
    .click();
  await expect(badge).toHaveText("4");
  await page
    .getByRole("button", { name: "زيادة الكمية", exact: true })
    .first()
    .click();
  await expect(badge).toHaveText("5");
  await page
    .locator(".cart-item")
    .first()
    .getByRole("button", { name: /^حذف/ })
    .click();
  await expect(badge).toHaveText("3");
  await page.reload();
  await expect(badge).toHaveText("3");
  const reopened = await context.newPage();
  await reopened.goto("/cart");
  await expect(reopened.locator(".header .bag span")).toHaveText("3");
  await reopened.close();
  await page.goto("/checkout");
  await page
    .getByRole("textbox", { name: "الاسم الكامل", exact: true })
    .fill("عميل الطلب");
  await page
    .getByRole("textbox", { name: "رقم الهاتف", exact: true })
    .fill("0500000000");
  await page
    .getByRole("textbox", { name: "العنوان بالتفصيل", exact: true })
    .fill("الشارع الرئيسي قرب المدرسة");
  const note = "يرجى الاتصال قبل التوصيل\nالتسليم مساءً";
  await page
    .getByRole("textbox", { name: "ملاحظات على الطلب", exact: true })
    .fill(note);
  for (const zone of deliveryZones) {
    await page
      .getByRole("combobox", { name: "منطقة التوصيل", exact: true })
      .selectOption(zone.id);
    await expect(
      page.locator("aside .summary-line").filter({ hasText: "التوصيل" }),
    ).toContainText(money(zone.price));
    await expect(page.locator("aside .total")).toContainText(
      money(349 * 3 + zone.price),
    );
  }
  await page.getByRole("button", { name: "تأكيد الطلب", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "تم استلام طلبك", exact: true }),
  ).toBeVisible();
  await expect(badge).toHaveText("0");
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("b40-orders-v1"))[0],
  );
  const confirmationUrl = page.url();
  expect(saved.customer.notes).toBe(note);
  expect(saved.zone.id).toBe(deliveryZones.at(-1).id);
  expect(saved.delivery).toBe(deliveryZones.at(-1).price);
  await expect(page.locator(".order-success")).toContainText(
    "اللون: أسود · الكمية: 3",
  );
  await expect(page.locator(".order-success")).toContainText("سعر القطعة");
  await expect(page.locator(".order-success")).toContainText("عميل الطلب");
  await expect(page.locator(".order-success")).toContainText(saved.id);
  await expect(page.locator(".order-notes")).toContainText(note);
  await expect(page.locator(".order-success .total")).toContainText(
    money(saved.subtotal + saved.delivery),
  );
  await page.reload();
  await expect(page).toHaveURL(confirmationUrl);
  await expect(page.locator(".order-success")).toContainText(saved.id);
  for (const width of info.project.name === "mobile"
    ? [320, 390]
    : [768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  await page.screenshot({
    path: `test-results/order-confirmation-${info.project.name}.png`,
    fullPage: true,
  });
  await signInDemo(page);
  await page.goto("/admin/orders");
  const orderCard = page.getByRole("article", {
    name: `الطلب ${saved.id}`,
    exact: true,
  });
  await expect(orderCard.locator(".order-notes")).toContainText(note);
  expect(errors).toEqual([]);
});

test("dashboard counters update live and status filters keep all existing transitions", async ({
  page,
  context,
}) => {
  await signInDemo(page);
  const stat = (label) =>
    page
      .locator(".dashboard-stats .admin-stat")
      .filter({ hasText: label })
      .locator("strong");
  await expect(stat("إجمالي المنتجات")).toHaveText("12");
  await expect(stat("إجمالي الطلبات")).toHaveText("5");
  await expect(stat("المنتجات النافدة")).toHaveText("1");
  await expect(stat("المخزون المنخفض")).toHaveText("0");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  const editor = await context.newPage();
  await editor.goto("/admin/inventory");
  const id = await editor.evaluate(async () => {
    const { catalogService, orderService, deliveryService } =
      await import("/src/services/store.js");
    const { storeInfo } = await import("/src/data/branches.js");
    const product = catalogService.list()[0];
    product.sizes.forEach((size) =>
      catalogService.setStock(product.id, size, size === "M" ? 2 : 0),
    );
    catalogService.save({
      ...product,
      id: undefined,
      sku: "NEW-COUNTER",
      name: "منتج جديد",
    });
    const order = await orderService.create({
      customer: { name: "Counter", phone: "0500000000", notes: "   " },
      items: [
        {
          id: product.id,
          size: "M",
          color: product.colors[0].name,
          quantity: 1,
        },
      ],
      zone: deliveryService.zones()[0],
      branch: storeInfo,
    });
    return order.id;
  });
  await expect(stat("إجمالي المنتجات")).toHaveText("13");
  await expect(stat("إجمالي الطلبات")).toHaveText("6");
  await expect(stat("المخزون المنخفض")).toHaveText("1");
  await editor.close();
  await page.bringToFront();
  await page.goto(`/checkout?order=${id}`);
  await expect(page.locator(".order-success")).toBeVisible();
  await expect(page.locator(".order-notes")).toHaveCount(0);
  await page.goto("/admin/orders");
  const group = page.getByRole("group", { name: "تصفية الطلبات" });
  for (const status of orderStatuses) {
    await group
      .getByRole("button", { name: new RegExp(`^${status.label}`) })
      .click();
    const expected = status.id === "new" ? 2 : 1;
    await expect(page.locator(".admin-order-card")).toHaveCount(expected);
    for (const badge of await page
      .locator(".admin-order-card .status-badge")
      .all())
      await expect(badge).toHaveText(status.label);
  }
  await group.getByRole("button", { name: /^الكل/ }).click();
  await expect(page.locator(".admin-order-card")).toHaveCount(6);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  const card = page.getByRole("article", { name: `الطلب ${id}`, exact: true });
  await card.getByRole("button", { name: "بدء التجهيز", exact: true }).click();
  await expect(card.locator(".status-badge")).toHaveText("قيد التحضير");
  await page.reload();
  await expect(card.locator(".status-badge")).toHaveText("قيد التحضير");
});
