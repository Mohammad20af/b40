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
    if (route === "/")
      await page.screenshot({
        path: `test-results/home-${info.project.name}.png`,
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
test("checkout validates fields and prepares correct Jericho WhatsApp message", async ({
  page,
}) => {
  await addItem(page);
  await page.goto("/checkout");
  await page.getByRole("button", { name: "تأكيد الطلب التجريبي" }).click();
  await expect(page.locator("input[name=name]")).toBeFocused();
  await page.getByRole("textbox", { name: "الاسم الكامل" }).fill("عميل تجريبي");
  await page.getByRole("textbox", { name: "رقم الهاتف" }).fill("0500000000");
  await page
    .getByRole("combobox", { name: "المحافظة", exact: true })
    .selectOption("jericho");
  await page
    .getByRole("textbox", { name: "المنطقة", exact: true })
    .fill("وسط المدينة");
  await page
    .getByRole("textbox", { name: "العنوان الكامل" })
    .fill("عنوان تجريبي للعرض");
  await page
    .getByRole("combobox", { name: "اختيار الفرع", exact: true })
    .selectOption("jericho");
  await expect(page.locator(".total")).toContainText("٢٧٣");
  await page.getByRole("button", { name: "تأكيد الطلب التجريبي" }).click();
  const link = page.getByRole("link", { name: "فتح الرسالة في واتساب" });
  await expect(link).toBeVisible();
  const url = new URL(await link.getAttribute("href"));
  expect(url.pathname).toBe("/972533781655");
  const message = url.searchParams.get("text");
  for (const value of [
    "أريحا",
    "عميل تجريبي",
    "المقاس: M",
    "رمادي",
    "الكمية: 2",
    "٢٧٣",
  ])
    expect(message).toContain(value);
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: "حقيبتك تنتظر أول قطعة" }),
  ).toBeVisible();
});
test("branch contact selection, admin preview and mobile keyboard dismissal", async ({
  page,
}, info) => {
  await page.goto("/contact");
  await page
    .getByRole("combobox", { name: "اختر الفرع", exact: true })
    .selectOption("jericho");
  await expect(page.locator('main a[href^="https://wa.me/"]')).toHaveAttribute(
    "href",
    "https://wa.me/972533781655",
  );
  await signInDemo(page);
  await page.getByRole("button", { name: "إضافة منتج", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  for (const name of ["الطلبات", "التصنيفات", "مناطق التوصيل"]) {
    await page.getByRole("tab", { name, exact: true }).click();
    await expect(page.getByRole("tabpanel")).toContainText(
      name === "الطلبات"
        ? "معاينة الطلبات"
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
