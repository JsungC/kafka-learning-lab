import { test, expect } from "@playwright/test";
import { openFreeExperiment } from "./chapterOneControls";
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
  const contents = page.getByRole("navigation", { name: "Chapter contents" });
  await page
    .getByRole("link", { name: "Jump to experiment", exact: true })
    .click();
  await expect(
    contents.getByRole("link", { name: "02 · Try it yourself" }),
  ).toHaveAttribute("aria-current", "location");
  await page
    .getByRole("heading", { name: lesson[0].title, exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    contents.getByRole("link", { name: "01 · The problem" }),
  ).toHaveAttribute("aria-current", "location");
  await openFreeExperiment(page);
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
