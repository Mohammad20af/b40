import { expect } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../../../src/services/demoAuth.js";

export async function signInDemo(page) {
  await page.goto("/admin/login");
  await page.getByLabel("البريد الإلكتروني", { exact: true }).fill(DEMO_EMAIL);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { name: "لوحة التحكم", exact: true }),
  ).toBeVisible();
}
