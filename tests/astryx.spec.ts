import { test, expect } from "@playwright/test";
import { lesson } from "../src/content/course";
test("Astryx chapter keeps all lesson prose, keyboard selection, and local theme without remote fonts", async ({
  page,
}) => {
  const remote: string[] = [];
  page.on("request", (r) => {
    if (/fonts\.googleapis|fonts\.gstatic/.test(r.url())) remote.push(r.url());
  });
  await page.goto("./#/chapter/1");
  await expect(page.locator(".astryx-chapter-one")).toBeVisible();
  for (const section of lesson)
    for (const paragraph of section.paragraphs)
      await expect(page.getByText(paragraph, { exact: true })).toBeVisible();
  const combo = page.getByRole("combobox", {
    name: "Your prediction",
    exact: true,
  });
  await combo.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option").first()).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Single step", exact: true }),
  ).toBeEnabled();
  const group = page.getByRole("radiogroup", {
    name: "Delivery model (changing it resets the experiment)",
    exact: true,
  });
  await group
    .getByRole("radio", { name: "Direct delivery", exact: true })
    .focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    group.getByRole("radio", { name: "Retained log", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Dark mode", exact: true }).click();
  await expect(
    page.locator('[data-astryx-theme="kafka-reading"]'),
  ).toHaveAttribute("data-theme", "dark");
  await page.getByRole("link", { name: "Roadmap", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(remote).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
