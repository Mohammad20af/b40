import { test, expect } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../../src/services/demoAuth.js";
import { signInDemo } from "./helpers/admin";

const authKey = "b40-demo-admin-auth";

test("direct admin access redirects; demo login persists after refresh", async ({
  page,
}, info) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(
    page.getByRole("heading", { name: "تسجيل دخول الإدارة" }),
  ).toBeVisible();
  await expect(page.getByRole("tablist")).toHaveCount(0);
  await expect(page.locator(".admin-login")).toHaveAttribute("dir", "rtl");
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/admin-login-${info.project.name}.png`,
    fullPage: true,
  });
  if (info.project.name === "mobile") {
    await page.setViewportSize({ width: 320, height: 740 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  await signInDemo(page);
  const saved = await page.evaluate(
    (key) => localStorage.getItem(key),
    authKey,
  );
  expect(saved).toBe("b40-presentation-v1");
  expect(saved).not.toContain(DEMO_PASSWORD);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "لوحة التحكم", exact: true }),
  ).toBeVisible();
  await page.goto("/admin/login");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator("tbody tr")).toHaveCount(12);
  expect(errors).toEqual([]);
});

test("invalid credentials show an error and password visibility toggles", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(
    page.getByLabel("البريد الإلكتروني", { exact: true }),
  ).toBeFocused();
  await page.getByLabel("البريد الإلكتروني", { exact: true }).fill(DEMO_EMAIL);
  const password = page.getByLabel("كلمة المرور", { exact: true });
  await password.fill("incorrect-demo-password");
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "إظهار كلمة المرور" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "إخفاء كلمة المرور" }).click();
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), authKey),
  ).toBeNull();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await password.fill(DEMO_PASSWORD);
  await expect(page.getByRole("alert")).toBeEmpty();
  await page
    .getByLabel("البريد الإلكتروني", { exact: true })
    .fill("wrong@b40.example");
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("غير صحيحة");
});

test("logout removes only demo auth and prevents dashboard access through history", async ({
  page,
}) => {
  await signInDemo(page);
  await page.evaluate(() => {
    localStorage.setItem(
      "b40-cart-v1",
      JSON.stringify([{ id: "01", size: "M", color: "أسود", quantity: 1 }]),
    );
    localStorage.setItem("presentation-preference", "keep");
  });
  await page.reload();
  await page.getByRole("button", { name: "تسجيل الخروج", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), authKey),
  ).toBeNull();
  expect(
    await page.evaluate(() => localStorage.getItem("presentation-preference")),
  ).toBe("keep");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goBack();
  await expect(page.getByRole("tablist")).toHaveCount(0);
  await page.goto("/cart");
  await expect(page.locator(".cart-item")).toHaveCount(1);
});

test("malformed state and unavailable localStorage never grant demo access", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("b40-demo-admin-auth", "{malformed");
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "b40-demo-admin-auth")
        throw new DOMException("Storage blocked", "SecurityError");
      return original.call(this, key, value);
    };
  });
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel("البريد الإلكتروني", { exact: true }).fill(DEMO_EMAIL);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("تعذّر حفظ تسجيل الدخول");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("logging out in another tab updates the existing protected dashboard", async ({
  page,
  context,
}) => {
  await signInDemo(page);
  const second = await context.newPage();
  await second.goto("/admin");
  await expect(
    second.getByRole("heading", { name: "لوحة التحكم", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "تسجيل الخروج", exact: true }).click();
  await expect(second).toHaveURL(/\/admin\/login$/);
  await second.close();
});
