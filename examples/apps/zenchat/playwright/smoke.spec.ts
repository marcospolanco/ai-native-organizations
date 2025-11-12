import { test, expect } from "@playwright/test";

test("app renders zen chat header", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /zen chat/i })).toBeVisible();
});
