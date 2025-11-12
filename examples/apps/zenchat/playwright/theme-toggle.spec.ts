import { expect, test } from "@playwright/test";

test.describe("theme toggle", () => {
  test("persists preference across reloads", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });

    await page.goto("/");

    const toggle = page.getByRole("button", { name: /toggle color scheme/i });
    await expect(toggle).toBeVisible();

    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);

    await toggle.click();

    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await expect(html).toHaveClass(/dark/);

    const storedTheme = await page.evaluate(() => window.localStorage.getItem("theme"));
    expect(storedTheme).toBe("dark");
  });
});

