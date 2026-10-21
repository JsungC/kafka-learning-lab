import { test, expect } from "@playwright/test";
test("complete both experiments and mission, restore progress, reset it", async ({
  page,
}) => {
  await page.goto("./#/chapter/1");
  await expect(
    page.getByRole("heading", { name: /Events and why/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Single step", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Your prediction").selectOption("log");
  await page
    .getByRole("button", { name: "Pause analytics", exact: true })
    .click();
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: "Single step", exact: true })
      .click();
  await expect(page.getByText("3 missed", { exact: false })).toBeVisible();
  await page
    .getByRole("button", { name: "Resume analytics", exact: true })
    .click();
  await page.getByLabel("Delivery model").selectOption("log");
  await page
    .getByRole("button", { name: "Pause analytics", exact: true })
    .click();
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: "Single step", exact: true })
      .click();
  await page
    .getByRole("button", { name: "Resume analytics", exact: true })
    .click();
  for (let i = 0; i < 6; i++)
    await page
      .getByRole("button", { name: "Single step", exact: true })
      .click();
  await expect(page.getByText("6 processed · 0 pending")).toBeVisible();
  await page
    .getByRole("button", { name: "Validate design", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "One requirement still needs work" }),
  ).toBeVisible();
  await page.getByLabel("Your design", { exact: true }).selectOption("log");
  await page
    .getByRole("button", { name: "Validate design", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Requirements met" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Chapter 1 complete", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Chapter 1 complete", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("./#/about");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset learning progress" }).click();
  await page.goto("./#/chapter/1");
  await expect(
    page.getByRole("heading", { name: "Your chapter checklist" }),
  ).toBeVisible();
});
test("playback pause and reset; keyboard steps; corrupt storage and subpath refresh", async ({
  page,
}) => {
  await page.goto("./");
  await page.evaluate(() =>
    localStorage.setItem("kafka-lab-progress", "broken json"),
  );
  await page.goto("./#/chapter/1");
  await page.reload();
  await page.getByLabel("Your prediction").selectOption("log");
  await page.getByRole("button", { name: "Start playback" }).click();
  await expect(page.getByText("1 / 6 produced")).toBeVisible();
  await page.getByRole("button", { name: "Pause playback" }).click();
  const before = await page
    .getByLabel("Order event delivery state")
    .innerText();
  await page.waitForTimeout(1100);
  expect(await page.getByLabel("Order event delivery state").innerText()).toBe(
    before,
  );
  await page
    .getByRole("button", { name: "Reset experiment", exact: true })
    .click();
  await expect(page.getByText("0 / 6 produced")).toBeVisible();
  await page.getByRole("button", { name: "Single step", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("1 / 6 produced")).toBeVisible();
  await page.getByRole("button", { name: "Validate design" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "One requirement still needs work" }),
  ).toBeVisible();
  await page.getByLabel("Your design", { exact: true }).selectOption("log");
  await page.getByRole("button", { name: "Validate design" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Requirements met" }),
  ).toBeVisible();
});
test("home, roadmap and glossary links are functional", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("link", { name: "Explore the roadmap" }).click();
  await expect(
    page.getByRole("heading", { name: "Build understanding in layers." }),
  ).toBeVisible();
  await expect(
    page.getByText("Planned · lesson not yet available"),
  ).toHaveCount(9);
  await page.getByRole("link", { name: "Glossary", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A small Kafka glossary." }),
  ).toBeVisible();
});
