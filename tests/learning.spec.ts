import {
  openFreeExperiment,
  chooseLog,
  predictFirstRead,
} from "./chapterOneControls";
import { test, expect } from "@playwright/test";
test("complete both experiments and mission, restore progress, reset it", async ({
  page,
}) => {
  await page.goto("./#/chapter/1");
  await expect(
    page.getByRole("heading", { name: /Events and why/ }),
  ).toBeVisible();
  await openFreeExperiment(page);
  await page
    .locator(".free-delivery")
    .getByRole("button", { name: "Pause analytics", exact: true })
    .click();
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: /^(Send Order|Read next pending order)/ })
      .click();
  await expect(page.getByText("3 missed", { exact: false })).toBeVisible();
  await page
    .getByRole("button", { name: "Resume analytics", exact: true })
    .click();
  await chooseLog(page);
  await page
    .locator(".free-delivery")
    .getByRole("button", { name: "Pause analytics", exact: true })
    .click();
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: /^(Send Order|Read next pending order)/ })
      .click();
  await page
    .getByRole("button", { name: "Resume analytics", exact: true })
    .click();
  for (let i = 0; i < 6; i++)
    await page
      .getByRole("button", { name: /^(Send Order|Read next pending order)/ })
      .click();
  await expect(page.getByText("6 processed · 0 pending")).toBeVisible();
  await predictFirstRead(page, "004");
  await page
    .getByRole("button", { name: "Validate design", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "One requirement still needs work" }),
  ).toBeVisible();
  await chooseLog(page, "Your design");
  await predictFirstRead(page, "001");
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
  await openFreeExperiment(page);
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
  await page
    .getByRole("button", { name: /^(Send Order|Read next pending order)/ })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("1 / 6 produced")).toBeVisible();
  await predictFirstRead(page, "004");
  await page.getByRole("button", { name: "Validate design" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "One requirement still needs work" }),
  ).toBeVisible();
  await chooseLog(page, "Your design");
  await predictFirstRead(page, "001");
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
    page.getByRole("heading", { name: "Chapter outline" }),
  ).toBeVisible();
  await expect(
    page.getByText("Planned · lesson not yet available"),
  ).toHaveCount(7);
  await page.getByRole("link", { name: "Glossary", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Kafka glossary" }),
  ).toBeVisible();
});

test("trace one outage, predict a read, and rewind the evidence", async ({
  page,
}) => {
  await page.goto("./#/chapter/1");
  const guide = page.getByRole("figure", {
    name: "Follow one order through both designs",
  });
  await guide.getByRole("button", { name: "Pause analytics" }).click();
  await guide.getByRole("button", { name: "Send Order 002" }).click();
  await expect(
    guide.getByRole("img", {
      name: /Direct delivery.*Notifications received 002.*paused, 002 missed/,
    }),
  ).toBeVisible();
  await expect(
    guide.getByRole("img", {
      name: /Retained log.*2 records retained.*paused, 002 pending/,
    }),
  ).toBeVisible();
  await guide.getByRole("button", { name: "Resume analytics" }).click();
  await guide.getByRole("combobox").click();
  await page.getByRole("option", { name: "Both designs", exact: true }).click();
  await guide.getByRole("button", { name: "Try reading Order 002" }).click();
  await expect(
    guide.getByRole("status", { name: "Step explanation" }),
  ).toContainText("It has no copy of 002");
  await expect(
    guide.getByRole("img", {
      name: /Retained log.*2 records retained.*active, 002 read/,
    }),
  ).toBeVisible();
  const timeline = guide.getByRole("slider");
  await timeline.focus();
  await page.keyboard.press("Home");
  await expect(
    guide.getByRole("status", { name: "Step explanation" }),
  ).toContainText("Step 1 of 5");
  await page.keyboard.press("ArrowRight");
  await expect(
    guide.getByRole("status", { name: "Step explanation" }),
  ).toContainText("Step 2 of 5");
  await expect(
    guide.getByRole("img", {
      name: /Retained log.*1 record retained.*001 read/,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your chapter checklist" }),
  ).toBeVisible();

  await chooseLog(page, "Your design");
  await predictFirstRead(page, "004");
  await page.getByRole("button", { name: "Validate design" }).click();
  await expect(
    page.getByRole("heading", { name: "Trace the first read again" }),
  ).toBeVisible();
  await expect(page.locator("#mission .feedback")).toContainText(
    "first analytics entry after restart was Order 001",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("kafka-lab-progress")!).missionPassed,
    ),
  ).toBe(false);
});
