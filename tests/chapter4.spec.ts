import { test, expect } from "@playwright/test";
test("group timeline compares subscriptions and mission completion restores independently", async ({
  page,
}) => {
  await page.goto("./#/chapter/4");
  await expect(
    page.getByRole("heading", {
      name: "Consumer groups and scaling.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Single group step" }),
  ).toBeDisabled();
  await page
    .getByLabel("Predict the subscription behavior")
    .selectOption("independent");
  await page.getByRole("button", { name: "Finished", exact: true }).click();
  await expect(page.locator("#group-lab .feedback")).toContainText(
    "did not each receive all 12",
  );
  await page
    .getByLabel("Analytics subscription", { exact: true })
    .selectOption("true");
  await page
    .getByRole("button", { name: "Membership change", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Group timeline explanation" }),
  ).toContainText("positions were preserved");
  const slider = page.getByRole("slider", { name: /Group timeline/ });
  await slider.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(slider).toHaveValue("3");
  await page.getByRole("button", { name: "Finished", exact: true }).click();
  await expect(page.locator("#group-lab .bookmark-summary")).toContainText(
    "Inventory: 12/12",
  );
  await expect(page.locator("#group-lab .bookmark-summary")).toContainText(
    "Analytics: 12/12",
  );
  await page
    .getByRole("button", { name: "Validate group design", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Group requirements need work" }),
  ).toBeVisible();
  await page.getByLabel("Mission analytics subscription").selectOption("true");
  await page.getByLabel("Mission inventory consumers").selectOption("2");
  await page
    .getByRole("button", { name: "Validate group design", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Group requirements met" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Chapter 4 complete", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Chapter 4 complete", exact: true }),
  ).toBeVisible();
  const progress = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("kafka-lab-progress")!),
  );
  expect(progress.chapter4.missionPassed).toBe(true);
  expect(progress.missionPassed).toBe(false);
  expect(progress.chapter3).toBeUndefined();
  await page.goto("./#/roadmap");
  await page
    .getByRole("link", { name: "Consumer groups and scaling →", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Chapter 4 complete", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.goto("./#/about");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset learning progress" }).click();
  await page.goto("./#/chapter/4");
  await expect(
    page.getByRole("heading", { name: "Your chapter 4 checklist" }),
  ).toBeVisible();
});
test("group playback pauses on seek and excess inventory members are visibly idle", async ({
  page,
}) => {
  await page.goto("./#/chapter/4");
  await page
    .getByLabel("Predict the subscription behavior")
    .selectOption("independent");
  await page
    .getByLabel("Analytics subscription", { exact: true })
    .selectOption("true");
  await page.getByLabel("Initial inventory consumers").selectOption("5");
  await expect(
    page
      .locator("#group-lab")
      .getByText("Idle · no partition assigned", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start group playback" }).click();
  await page.getByRole("slider", { name: /Group timeline/ }).fill("2");
  await expect(
    page.getByRole("button", { name: "Start group playback" }),
  ).toBeVisible();
  const before = await page.locator("#group-lab .group-view").innerText();
  await page.waitForTimeout(1000);
  expect(await page.locator("#group-lab .group-view").innerText()).toBe(before);
  await page.getByRole("button", { name: "Reset group experiment" }).click();
  await expect(
    page.getByRole("slider", { name: /Group timeline/ }),
  ).toHaveValue("0");
});
