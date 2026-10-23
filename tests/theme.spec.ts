import { test, expect } from "@playwright/test";

test("theme follows the system, toggles by keyboard and persists across routes and refresh", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("./");
  const toggle = page.getByRole("button", { name: "Dark mode", exact: true });
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("link", { name: "Glossary", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "light" });
  await toggle.click();
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.goto("./#/chapter/1");
  await page.getByLabel("Your design", { exact: true }).selectOption("log");
  await page.getByRole("button", { name: "Validate design" }).click();
  await expect(
    page.getByRole("heading", { name: "Requirements met" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("theme and learning remain usable when browser storage is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage blocked", "SecurityError");
      },
    });
  });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("./#/chapter/1");
  await page.getByRole("button", { name: "Dark mode", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByText("Theme will not persist after refresh."),
  ).toBeVisible();
  await page.getByLabel("Your design", { exact: true }).selectOption("log");
  await page.getByRole("button", { name: "Validate design" }).click();
  await expect(
    page.getByRole("heading", { name: "Requirements met" }),
  ).toBeVisible();
});
