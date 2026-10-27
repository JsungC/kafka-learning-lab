import { test, expect } from "@playwright/test";
async function drain(page: import("@playwright/test").Page) {
  for (let i = 0; i < 40; i++) {
    const button = page.getByRole("button", {
      name: "Single key step",
      exact: true,
    });
    if (await button.isDisabled()) break;
    await button.click();
  }
  await expect(page.locator("#key-lab .bookmark-summary")).toContainText("9/9");
}
test("chapter 3 compares split and stable runs, validates alternatives and restores independent progress", async ({
  page,
}) => {
  await page.goto("./#/chapter/3");
  await expect(
    page.getByRole("heading", { name: "Keys and ordering.", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Single key step", exact: true }),
  ).toBeDisabled();
  await page
    .getByLabel("Predict the ordering boundary")
    .selectOption("customer");
  await drain(page);
  await expect(
    page.locator("#key-lab .ordering-view .visual-takeaway"),
  ).toContainText("A customer crossed partition boundaries");
  await page.getByLabel("Record key", { exact: true }).selectOption("customer");
  await drain(page);
  await expect(
    page.locator("#key-lab .ordering-view .visual-takeaway"),
  ).toContainText("One lane per customer");
  await page
    .getByRole("button", { name: "Validate customer design", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Customer requirements need work",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Mission key strategy").selectOption("customer");
  await page.getByLabel("Mission partition count").selectOption("2");
  await page
    .getByRole("button", { name: "Validate customer design", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", {
      name: "Customer requirements met",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Chapter 3 complete", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Chapter 3 complete", exact: true }),
  ).toBeVisible();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("kafka-lab-progress")!),
  );
  expect(stored.chapter3.missionPassed).toBe(true);
  expect(stored.missionPassed).toBe(false);
  expect(stored.chapter2).toBeUndefined();
  await page.goto("./#/roadmap");
  await page
    .getByRole("link", { name: "Keys and ordering →", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Chapter 3 complete", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.goto("./#/about");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset learning progress" }).click();
  await page.goto("./#/chapter/3");
  await expect(
    page.getByRole("heading", {
      name: "Your chapter 3 checklist",
      exact: true,
    }),
  ).toBeVisible();
});
test("key playback pauses and resets; hypothetical mapping comparison preserves the current experiment", async ({
  page,
}) => {
  await page.goto("./#/chapter/3");
  await page
    .getByLabel("Predict the ordering boundary")
    .selectOption("customer");
  await page
    .getByRole("button", { name: "Start key playback", exact: true })
    .click();
  await expect(page.locator("#key-lab .bookmark-summary")).toContainText("1/9");
  await page
    .getByRole("button", { name: "Pause key playback", exact: true })
    .click();
  const before = await page.locator("#key-lab .ordering-view").innerText();
  await page.waitForTimeout(700);
  expect(await page.locator("#key-lab .ordering-view").innerText()).toBe(
    before,
  );
  await page.getByLabel("Compare current").selectOption("2");
  expect(await page.locator("#key-lab .ordering-view").innerText()).toBe(
    before,
  );
  await page
    .getByRole("button", { name: "Reset key experiment", exact: true })
    .click();
  await expect(page.locator("#key-lab .key-record")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Single key step", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#key-lab .key-record")).toHaveCount(1);
});
