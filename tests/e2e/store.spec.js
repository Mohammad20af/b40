import { test, expect } from "@playwright/test";
import { signInDemo } from "./helpers/admin";

test("navigation, gallery, narrow screens and reduced-motion hero", async ({
  page,
}, info) => {
  await page.goto("/");
  await page.getByRole("link", { name: "تسوق الآن", exact: true }).click();
  await expect(page).toHaveURL(/\/shop$/);
  await page.locator(".product-photo").first().click();
  await expect(page).toHaveURL(/\/product\/01$/);
  await page
    .getByRole("button", { name: "صورة إلهام للإطلالة", exact: true })
    .click();
  await expect(page.locator(".gallery-main img")).toHaveAttribute(
    "src",
    "/images/editorial.jpg",
  );
  await page.getByRole("button", { name: "صورة المنتج", exact: true }).click();
  await expect(page.locator(".gallery-main img")).toHaveAttribute(
    "src",
    "/images/tee.jpg",
  );
  await signInDemo(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of info.project.name === "mobile"
    ? [320, 375]
    : [768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/shop", "/product/01", "/admin"]) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${route} at ${width}`,
      ).toBe(true);
    }
  }
  await page.goto("/");
  await expect(page.locator(".hero-art img")).toHaveCSS("transform", "none");
});

async function addItem(page) {
  await page.goto("/product/01");
  await page.getByRole("button", { name: "أضف إلى الحقيبة" }).click();
  await expect(page.getByRole("alert")).toHaveText("اختر المقاس أولاً");
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.getByRole("button", { name: "رمادي", exact: true }).click();
  await page.getByRole("button", { name: "زيادة الكمية" }).click();
  await page.getByRole("button", { name: "أضف إلى الحقيبة" }).click();
  await expect(page.locator(".toast")).toContainText("تمت إضافة");
}
test("all pages render with RTL, loaded images, no overflow or runtime errors", async ({
  page,
}, info) => {
  const errors = [];
  await page.emulateMedia({ reducedMotion: "reduce" });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await signInDemo(page);
  for (const route of [
    "/",
    "/shop",
    "/product/01",
    "/cart",
    "/checkout",
    "/branches",
    "/contact",
    "/#about",
    "/admin/login",
    "/admin",
    "/missing",
    "/product/missing",
  ]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll("img").forEach((i) => (i.loading = "eager"));
    });
    await expect
      .poll(() =>
        page
          .locator("img")
          .evaluateAll((images) =>
            images.every((i) => i.complete && i.naturalWidth > 0),
          ),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      route,
    ).toBe(true);
    await page.screenshot({
      path: `test-results/${route === "/" ? "home" : route.replace(/[^a-z0-9]+/gi, "-")}-${info.project.name}.png`,
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});
test("search, category, price, size, availability and reset filters work", async ({
  page,
}, info) => {
  await page.goto("/shop");
  await expect(page.locator(".product-card")).toHaveCount(12);
  await page.getByRole("textbox", { name: "ابحث عن منتج" }).fill("هودي");
  await expect(page.locator(".product-card")).toHaveCount(2);
  await page.getByRole("textbox", { name: "ابحث عن منتج" }).fill("");
  await expect(page.locator(".product-card")).toHaveCount(12);
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "تصفية", exact: true }).click();
  await page.getByRole("radio", { name: "أحذية", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "أحذية", exact: true }),
  ).toBeChecked();
  await expect(page.locator(".product-card")).toHaveCount(3);
  await page.getByRole("button", { name: "M", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(0);
  await page.getByRole("button", { name: "مسح الكل", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(12);
  await page.getByRole("checkbox", { name: "المتوفر فقط" }).click();
  await expect(
    page.getByRole("checkbox", { name: "المتوفر فقط" }),
  ).toBeChecked();
  await expect(page.locator(".product-card")).toHaveCount(11);
  await page.getByRole("slider").fill("200");
  await expect(page.locator(".product-card")).toHaveCount(5);
  await page
    .getByRole("combobox", { name: "ترتيب المنتجات" })
    .selectOption("low");
  await expect(page.locator(".product-card").first()).toContainText(
    "تيشيرت دايلي",
  );
});
test("cart survives refresh, updates quantities, preserves variants, and removes items", async ({
  page,
}) => {
  await addItem(page);
  await page.goto("/cart");
  await page.reload();
  await expect(page.locator(".cart-item")).toHaveCount(1);
  await expect(page.locator(".cart-item")).toContainText("رمادي");
  await expect(page.getByRole("status", { name: "الكمية" })).toHaveText("2");
  await page.getByRole("button", { name: "زيادة الكمية" }).click();
  await expect(page.locator(".cart-item-total")).toContainText("٣٨٧");
  await page.getByRole("button", { name: "تقليل الكمية" }).click();
  await page.getByRole("button", { name: "حذف تيشيرت أساسي أوفرسايز" }).click();
  await expect(
    page.getByRole("heading", { name: "حقيبتك تنتظر أول قطعة" }),
  ).toBeVisible();
});
async function fillCheckout(page) {
  await page.getByRole("textbox", { name: "الاسم الكامل" }).fill("عميل تجريبي");
  await page.getByRole("textbox", { name: "رقم الهاتف" }).fill("0500000000");
  await page
    .getByRole("combobox", { name: "المنطقة", exact: true })
    .selectOption("jericho");
  await page
    .getByRole("textbox", { name: "العنوان بالتفصيل" })
    .fill("عنوان تجريبي للعرض");
}

test("checkout saves numbered orders on-site without WhatsApp or external navigation", async ({
  page,
  context,
}) => {
  const externalRequests = [],
    popups = [],
    errors = [];
  page.on("request", (request) => {
    if (
      /^https?:/.test(request.url()) &&
      new URL(request.url()).origin !== "http://127.0.0.1:4173"
    )
      externalRequests.push(request.url());
  });
  page.on("popup", (popup) => popups.push(popup.url()));
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await addItem(page);
  await page.goto("/cart");
  await expect(page.locator(".cart-item")).toHaveCount(1);
  await page.goto("/checkout");
  await page.getByRole("button", { name: "تأكيد الطلب", exact: true }).click();
  await expect(page.locator("input[name=name]")).toBeFocused();
  await fillCheckout(page);
  await page
    .getByRole("textbox", { name: "ملاحظات (اختياري)" })
    .fill("الاتصال قبل التوصيل");
  await expect(
    page.getByRole("combobox", { name: "اختيار الفرع", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".total")).toContainText("٢٧٣");
  await page.getByRole("button", { name: "تأكيد الطلب", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "تم استلام طلبك بنجاح" }),
  ).toBeVisible();
  await expect(page.locator(".order-success")).toContainText(
    "رقم طلبك: B40-1001",
  );
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(
    page.locator('.order-success a[href^="http"], .whatsapp-preview'),
  ).toHaveCount(0);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("b40-orders-v1")),
  );
  expect(saved).toHaveLength(6);
  expect(saved[0]).toMatchObject({
    id: "B40-1001",
    status: "new",
    simulated: false,
    subtotal: 258,
    delivery: 15,
    customer: {
      name: "عميل تجريبي",
      phone: "0500000000",
      area: "أريحا",
      address: "عنوان تجريبي للعرض",
      notes: "الاتصال قبل التوصيل",
    },
  });
  expect(saved[0].items[0]).toMatchObject({
    quantity: 2,
    size: "M",
    color: "رمادي",
  });
  expect(saved[0]).not.toHaveProperty("message");
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem("b40-cart-v1"))),
    )
    .toEqual([]);
  await page.reload();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("b40-orders-v1"))[0].id,
    ),
  ).toBe("B40-1001");
  await signInDemo(page);
  await page.goto("/admin/orders");
  await page
    .getByRole("textbox", { name: "البحث في الطلبات" })
    .fill("B40-1001");
  await expect(page.locator(".admin-order-card")).toHaveCount(1);
  await expect(page.locator(".admin-order-card")).toContainText("عميل تجريبي");
  await expect(page.locator(".admin-order-card .status-badge")).toHaveText(
    "جديد",
  );
  await expect(page.locator(".admin-order-card")).toContainText("٢٧٣");
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: "حقيبتك تنتظر أول قطعة" }),
  ).toBeVisible();
  await addItem(page);
  await page.goto("/checkout");
  await fillCheckout(page);
  await page.getByRole("button", { name: "تأكيد الطلب", exact: true }).click();
  await expect(page.locator(".order-success")).toContainText(
    "رقم طلبك: B40-1002",
  );
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("b40-orders-v1")).length,
    ),
  ).toBe(7);
  expect(context.pages()).toHaveLength(1);
  expect(popups).toEqual([]);
  expect(externalRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test("checkout keeps the cart and customer details when order storage fails", async ({
  page,
}) => {
  await addItem(page);
  await page.goto("/checkout");
  await fillCheckout(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "b40-orders-v1")
        throw new DOMException("Storage full", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page.getByRole("button", { name: "تأكيد الطلب", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("تعذّر حفظ الطلب");
  await expect(page.locator(".order-success")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "الاسم الكامل" })).toHaveValue(
    "عميل تجريبي",
  );
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("b40-cart-v1"))),
  ).toHaveLength(1);
  expect(
    await page.evaluate(() => localStorage.getItem("b40-orders-v1")),
  ).toBeNull();
});
test("Jericho contact links, admin navigation and mobile keyboard dismissal", async ({
  page,
}, info) => {
  await page.goto("/contact");
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await expect(page.locator('main a[href^="https://wa.me/"]')).toHaveAttribute(
    "href",
    "https://wa.me/972533781655",
  );
  await signInDemo(page);
  await page.goto("/admin/products");
  await page.getByRole("button", { name: "إضافة منتج", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  for (const name of ["الطلبات", "التصنيفات", "مناطق التوصيل"]) {
    await page
      .getByRole("navigation", { name: "أقسام الإدارة" })
      .getByRole("link", { name, exact: true })
      .click();
    await expect(page.locator(".admin-content")).toContainText(
      name === "الطلبات"
        ? "إدارة الطلبات"
        : name === "التصنيفات"
          ? "تيشيرتات"
          : "القدس",
    );
  }
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "فتح القائمة" }).click();
    await expect(page.locator("#mobile-nav")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#mobile-nav")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "فتح القائمة" }),
    ).toBeFocused();
  }
});
test("corrupt storage recovers and unavailable product cannot be purchased", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("b40-cart-v1", "{broken json"),
  );
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: "حقيبتك تنتظر أول قطعة" }),
  ).toBeVisible();
  await page.goto("/product/10");
  await expect(
    page.getByRole("button", { name: "أضف إلى الحقيبة" }),
  ).toBeDisabled();
});
