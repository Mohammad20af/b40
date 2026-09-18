import { test, expect } from "@playwright/test";
import { categories, products } from "../../src/data/products.js";
import { signInDemo } from "./helpers/admin";

const filters = (page) => page.getByRole("group", { name: "تصنيف المنتجات" });
const categoryButton = (page, category) =>
  filters(page).getByRole("button", { name: new RegExp(`^${category} \\(`) });

test("navbar retains existing links and cart and opens the existing login page", async ({
  page,
}, info) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  async function nav() {
    if (info.project.name === "mobile") {
      await page
        .getByRole("button", { name: "فتح القائمة", exact: true })
        .click();
      return page.getByRole("navigation", { name: "قائمة الهاتف" });
    }
    return page.getByRole("navigation", { name: "التنقل الرئيسي" });
  }
  for (const [label, route] of [
    ["المنتجات", "/shop"],
    ["تواصل معنا", "/contact"],
    ["الرئيسية", "/"],
    ["من نحن", "/#about"],
  ]) {
    await (await nav()).getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(`http://127.0.0.1:4173${route}`);
    if (info.project.name === "mobile")
      await expect(page.locator("#mobile-nav")).toHaveCount(0);
  }
  const login = (await nav()).getByRole("link", {
    name: "دخول الإدارة",
    exact: true,
  });
  await expect(login).toHaveAttribute("href", "/admin/login");
  await expect(login).toHaveCSS("border-top-color", "rgb(242, 106, 33)");
  await expect(login).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  if (info.project.name === "desktop") {
    await login.hover();
    await expect(login).toHaveCSS("background-color", "rgb(242, 106, 33)");
    await expect(login).toHaveCSS("color", "rgb(17, 17, 17)");
  }
  await page
    .locator(".header")
    .screenshot({ path: `test-results/navbar-admin-${info.project.name}.png` });
  await login.click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(
    page.getByRole("heading", { name: "تسجيل دخول الإدارة" }),
  ).toBeVisible();
  if (info.project.name === "mobile")
    await expect(page.locator("#mobile-nav")).toHaveCount(0);
  await page.locator(".header .bag").click();
  await expect(page).toHaveURL(/\/cart$/);
  expect(errors).toEqual([]);
});

test("category counts, active state and search use the existing catalog", async ({
  page,
}) => {
  await signInDemo(page);
  await page.goto("/admin/products");
  await expect(filters(page).getByRole("button")).toHaveCount(
    categories.length + 1,
  );
  await expect(categoryButton(page, "كل المنتجات")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  for (const category of categories) {
    const count = products.filter((p) => p.category === category).length;
    const button = categoryButton(page, category);
    await expect(button).toHaveText(`${category} (${count})`);
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(filters(page).locator('[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator(".admin-product-card")).toHaveCount(count);
  }
  const selected = categories.at(-1);
  const other = products.find((p) => p.category !== selected);
  const search = page.getByRole("textbox", { name: "ابحث عن منتج" });
  await search.fill(other.name);
  await expect(page.locator(".admin-product-card")).toHaveCount(0);
  await expect(categoryButton(page, selected)).toHaveText(
    `${selected} (${products.filter((p) => p.category === selected).length})`,
  );
  await categoryButton(page, "كل المنتجات").click();
  await expect(page.locator(".admin-product-card")).toHaveCount(1);
  await search.fill("");
  await expect(page.locator(".admin-product-card")).toHaveCount(
    products.length,
  );
  await page.getByRole("button", { name: "إضافة منتج", exact: true }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("combobox", { name: "التصنيف", exact: true }),
  ).toHaveValue(categories[0]);
});

test("empty category can add with a preselected category, edit and delete using the existing dialog", async ({
  page,
}) => {
  await signInDemo(page);
  const category = categories.at(-1);
  await page.evaluate(async (category) => {
    const { catalogService } = await import("/src/services/store.js");
    catalogService
      .list()
      .filter((p) => p.category === category)
      .forEach((p) => catalogService.remove(p.id));
  }, category);
  await page.goto("/admin/products");
  await categoryButton(page, category).click();
  await expect(categoryButton(page, category)).toHaveText(`${category} (0)`);
  await expect(
    page.getByRole("heading", { name: "لا توجد منتجات في هذا التصنيف" }),
  ).toBeVisible();
  await page
    .locator(".admin-empty")
    .getByRole("button", { name: "إضافة منتج", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("combobox", { name: "التصنيف", exact: true }),
  ).toHaveValue(category);
  await dialog
    .getByLabel("اسم المنتج", { exact: true })
    .fill("منتج اختبار التصنيف");
  await dialog.getByLabel("السعر", { exact: true }).fill("180");
  await dialog.getByLabel("المقاسات", { exact: true }).fill("40, 41");
  await dialog
    .getByLabel("اختيار صورة", { exact: true })
    .setInputFiles("public/images/shoe.jpg");
  await expect(dialog.getByAltText("معاينة صورة المنتج")).toBeVisible();
  await dialog.getByRole("button", { name: "حفظ المنتج" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(categoryButton(page, category)).toHaveText(`${category} (1)`);
  await expect(page.locator(".admin-product-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "تعديل منتج اختبار التصنيف", exact: true })
    .click();
  await expect(
    dialog.getByRole("combobox", { name: "التصنيف", exact: true }),
  ).toHaveValue(category);
  await dialog.getByLabel("السعر", { exact: true }).fill("195");
  await dialog
    .getByRole("combobox", { name: "التصنيف", exact: true })
    .selectOption(categories[0]);
  await dialog.getByRole("button", { name: "حفظ المنتج" }).click();
  await expect(
    page.getByRole("heading", { name: "لا توجد منتجات في هذا التصنيف" }),
  ).toBeVisible();
  await categoryButton(page, categories[0]).click();
  const card = page
    .locator(".admin-product-card")
    .filter({ hasText: "منتج اختبار التصنيف" });
  await expect(card).toContainText("١٩٥");
  await page.reload();
  await categoryButton(page, categories[0]).click();
  await expect(card).toBeVisible();
  await page.goto("/admin/inventory");
  const stockCard = page.getByRole("article", {
    name: "منتج اختبار التصنيف",
    exact: true,
  });
  await stockCard
    .getByRole("button", { name: "زيادة مخزون 40", exact: true })
    .click();
  await expect(
    stockCard.getByRole("spinbutton", { name: "مخزون 40", exact: true }),
  ).toHaveValue("6");
  await page.goto("/admin/products");
  await categoryButton(page, categories[0]).click();
  await card
    .getByRole("button", { name: "حذف منتج اختبار التصنيف", exact: true })
    .click();
  await dialog.getByRole("button", { name: "تأكيد الحذف" }).click();
  await expect(card).toHaveCount(0);
  await expect(categoryButton(page, categories[0])).toHaveText(
    `${categories[0]} (${products.filter((p) => p.category === categories[0]).length})`,
  );
});

test("navbar and product category controls fit mobile and desktop breakpoints", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signInDemo(page);
  for (const width of info.project.name === "mobile"
    ? [320, 390, 768]
    : [851, 900, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/admin/products");
    if (width <= 850) {
      await page
        .getByRole("button", { name: "فتح القائمة", exact: true })
        .click();
      await expect(page.locator("#mobile-nav .nav-admin")).toBeVisible();
    } else await expect(page.locator(".desktop-nav .nav-admin")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `width ${width}`,
    ).toBe(true);
    for (const button of await filters(page).getByRole("button").all()) {
      const box = await button.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
  }
  await page.locator(".admin-content").screenshot({
    path: `test-results/admin-categories-${info.project.name}.png`,
  });
});
