import { test, expect } from "@playwright/test";
import { signInDemo } from "./helpers/admin";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("product upload, replacement, removal, persistence, storefront purchase and deletion", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await signInDemo(page);
  await page.goto("/admin/products");
  await expect(page.locator(".admin-product-card")).toHaveCount(12);
  await page.getByRole("button", { name: "إضافة منتج", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("اسم المنتج", { exact: true })
    .fill("تيشيرت اختبار الإدارة");
  await dialog.getByLabel("السعر", { exact: true }).fill("175");
  await dialog.getByLabel("الوصف", { exact: true }).fill("وصف المنتج الجديد");
  await dialog
    .getByLabel("اختيار صورة", { exact: true })
    .setInputFiles("public/images/tee.jpg");
  const preview = dialog.getByAltText("معاينة صورة المنتج");
  await expect(preview).toHaveAttribute("src", /^data:image\/webp/);
  const original = await preview.getAttribute("src");
  await dialog
    .getByLabel("اختيار صورة", { exact: true })
    .setInputFiles("public/images/hoodie.jpg");
  await expect(preview).not.toHaveAttribute("src", original);
  await dialog
    .getByRole("button", { name: "إزالة الصورة", exact: true })
    .click();
  await expect(preview).toHaveCount(0);
  await dialog.getByRole("button", { name: "حفظ المنتج" }).click();
  await expect(dialog.getByRole("alert")).toContainText("اختر صورة");
  await dialog
    .getByLabel("اختيار صورة", { exact: true })
    .setInputFiles("public/images/tee.jpg");
  await expect(preview).toBeVisible();
  await dialog.getByRole("button", { name: "حفظ المنتج" }).click();
  await expect(dialog).toHaveCount(0);
  await page.reload();
  const card = page
    .locator(".admin-product-card")
    .filter({ hasText: "تيشيرت اختبار الإدارة" });
  await expect(card).toBeVisible();
  await page.goto("/shop?q=تيشيرت اختبار الإدارة");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.locator(".product-photo").click();
  await expect(page.locator(".product-description")).toHaveText(
    "وصف المنتج الجديد",
  );
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.getByRole("button", { name: "أضف إلى الحقيبة" }).click();
  await page.goto("/cart");
  await page.reload();
  await expect(page.locator(".cart-item")).toContainText(
    "تيشيرت اختبار الإدارة",
  );
  await page.goto("/admin/products");
  await card
    .getByRole("button", { name: "تعديل تيشيرت اختبار الإدارة" })
    .click();
  await dialog.getByLabel("السعر", { exact: true }).fill("190");
  await dialog
    .getByRole("combobox", { name: "حالة المنتج", exact: true })
    .selectOption("no");
  await dialog.getByRole("button", { name: "حفظ المنتج" }).click();
  await expect(card).toContainText("غير متوفر");
  await page.goto("/cart");
  await expect(page.locator(".cart-item")).toHaveCount(0);
  await page.goto("/admin/products");
  await card.getByRole("button", { name: "حذف تيشيرت اختبار الإدارة" }).click();
  await dialog.getByRole("button", { name: "تأكيد الحذف" }).click();
  await page.reload();
  await expect(page.locator(".admin-product-card")).toHaveCount(12);
  await expect(card).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("order transitions, cancellation, counters, filters and searches persist", async ({
  page,
}) => {
  await signInDemo(page);
  await page.goto("/admin/orders");
  const order = page.getByRole("article", {
    name: "الطلب B40-DEMO-01",
    exact: true,
  });
  await order.getByRole("button", { name: "بدء التجهيز" }).click();
  await expect(order.locator(".status-badge")).toHaveText("قيد التحضير");
  await expect(page.locator(".stat-preparing strong")).toHaveText("2");
  await page.reload();
  await order.getByRole("button", { name: "الطلب جاهز" }).click();
  await expect(order.locator(".status-badge")).toHaveText("جاهز");
  await order.getByRole("button", { name: "تم التسليم" }).click();
  await expect(order.locator(".status-badge")).toHaveText("تم التسليم");
  await expect(order.getByRole("button")).toHaveCount(0);
  const second = page.getByRole("article", {
    name: "الطلب B40-DEMO-02",
    exact: true,
  });
  await second.getByRole("button", { name: "إلغاء الطلب" }).click();
  await page.getByRole("button", { name: "تأكيد إلغاء الطلب" }).click();
  await expect(second.locator(".status-badge")).toHaveText("ملغي");
  await page.reload();
  await page
    .getByRole("group", { name: "تصفية الطلبات" })
    .getByRole("button", { name: /ملغي/ })
    .click();
  await expect(page.locator(".admin-order-card")).toHaveCount(2);
  await page
    .getByRole("group", { name: "تصفية الطلبات" })
    .getByRole("button", { name: /الكل/ })
    .click();
  const search = page.getByRole("textbox", { name: "البحث في الطلبات" });
  await search.fill("b40-demo-01");
  await expect(page.locator(".admin-order-card")).toHaveCount(1);
  await search.fill("عميل تجريبي 2");
  await expect(second).toBeVisible();
  await expect(page.locator(".admin-order-card")).toHaveCount(1);
  await search.fill("٠٥٠٠٠٠٠٠٠٠");
  await expect(page.locator(".admin-order-card")).toHaveCount(5);
  await search.fill("missing-order");
  await expect(
    page.getByRole("heading", { name: "لا توجد طلبات" }),
  ).toBeVisible();
  await page.goto("/admin");
  await expect(page.locator(".stat-new strong")).toHaveText("0");
  await expect(page.locator(".stat-delivered strong")).toHaveText("2");
});

test("PNG drag-and-drop, WEBP upload, gallery preservation and live catalog updates", async ({
  page,
  context,
}) => {
  await signInDemo(page);
  const storefront = await context.newPage();
  await storefront.goto("/product/01");
  await page.bringToFront();
  await page.goto("/admin/products");
  await page
    .getByRole("button", { name: "تعديل تيشيرت أساسي أوفرسايز" })
    .click();
  const dialog = page.getByRole("dialog");
  const transfer = await page.evaluateHandle(async () => {
    const blob = await (await fetch("/images/b40-logo.png")).blob();
    const data = new DataTransfer();
    data.items.add(new File([blob], "logo.png", { type: "image/png" }));
    return data;
  });
  await dialog
    .locator(".admin-upload")
    .dispatchEvent("drop", { dataTransfer: transfer });
  const preview = dialog.getByAltText("معاينة صورة المنتج");
  await expect(preview).toHaveAttribute("src", /^data:image\/webp/);
  const webp = await preview.getAttribute("src");
  await dialog.getByLabel("اختيار صورة", { exact: true }).setInputFiles({
    name: "product.webp",
    mimeType: "image/webp",
    buffer: Buffer.from(webp.split(",")[1], "base64"),
  });
  await dialog.getByLabel("السعر", { exact: true }).fill("139");
  await dialog.getByRole("button", { name: "حفظ المنتج" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(storefront.locator(".product-info > .price")).toContainText(
    "١٣٩",
  );
  await expect(storefront.locator(".gallery-main img")).toHaveAttribute(
    "src",
    /^data:image\/webp/,
  );
  await expect(storefront.locator(".thumbnails button")).toHaveCount(2);
  await storefront.bringToFront();
  await storefront
    .getByRole("button", { name: "صورة المنتج 2", exact: true })
    .click();
  await expect(storefront.locator(".gallery-main img")).toHaveAttribute(
    "src",
    "/images/editorial.jpg",
  );
  await page.bringToFront();
  await page
    .getByRole("button", { name: "تعديل تيشيرت أساسي أوفرسايز" })
    .click();
  await dialog
    .getByRole("button", { name: "إزالة الصورة", exact: true })
    .click();
  await expect(dialog.getByAltText("معاينة صورة المنتج")).toHaveAttribute(
    "src",
    "/images/editorial.jpg",
  );
  await dialog.getByRole("button", { name: "إلغاء", exact: true }).click();
  await expect(storefront.locator(".thumbnails button")).toHaveCount(2);
  await storefront.close();
});

test("upload validation and failed storage do not lose the form or change saved data", async ({
  page,
}) => {
  await signInDemo(page);
  await page.goto("/admin/products");
  await page
    .getByRole("button", { name: "تعديل تيشيرت أساسي أوفرسايز" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("اختيار صورة", { exact: true }).setInputFiles({
    name: "invalid.gif",
    mimeType: "image/gif",
    buffer: Buffer.from("invalid"),
  });
  await expect(dialog.getByRole("alert")).toContainText("JPG");
  await expect(dialog.getByAltText("معاينة صورة المنتج")).toHaveAttribute(
    "src",
    "/images/tee.jpg",
  );
  await page.evaluate(() => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "b40-products-v1")
        throw new DOMException("Full", "QuotaExceededError");
      return set.call(this, key, value);
    };
  });
  await dialog.getByLabel("اسم المنتج", { exact: true }).fill("اسم غير محفوظ");
  await dialog.getByRole("button", { name: "حفظ المنتج" }).click();
  await expect(dialog.getByRole("alert")).toContainText("تعذّر حفظ المنتج");
  await expect(dialog.getByLabel("اسم المنتج", { exact: true })).toHaveValue(
    "اسم غير محفوظ",
  );
  await page.reload();
  await expect(page.locator(".admin-product-card")).toHaveCount(12);
  await expect(
    page.getByRole("heading", { name: "تيشيرت أساسي أوفرسايز" }),
  ).toBeVisible();
});

test("admin routes and social controls fit small screens without console errors", async ({
  page,
}, info) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await signInDemo(page);
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 740 });
  for (const route of [
    "/admin",
    "/admin/products",
    "/admin/orders",
    "/admin/categories",
    "/admin/delivery",
  ]) {
    await page.goto(route);
    await expect(page.locator(".admin-sidebar")).toBeVisible();
    await expect(page.locator(".floating-social")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/${route.replaceAll("/", "-")}-${info.project.name}.png`,
      fullPage: true,
    });
  }
  for (const route of [
    "/",
    "/shop",
    "/product/01",
    "/cart",
    "/checkout",
    "/contact",
    "/missing",
  ]) {
    await page.goto(route);
    const social = page.getByRole("navigation", { name: "التواصل الاجتماعي" });
    await expect(social).toBeVisible();
    await expect(
      social.getByRole("link", { name: "تواصل معنا عبر واتساب" }),
    ).toHaveAttribute("href", "https://wa.me/972533781655");
    await expect(
      social.getByRole("link", { name: "تابعنا على إنستغرام" }),
    ).toHaveAttribute("href", "https://www.instagram.com/b40.jericho/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  const instagram = page.locator(".floating-social a").last();
  await instagram.focus();
  await expect(instagram.locator(".social-tooltip")).toHaveCSS("opacity", "1");
  await expect(instagram).toHaveCSS("background-color", "rgb(184, 75, 27)");
  expect(errors).toEqual([]);
});
