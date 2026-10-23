import { test, expect } from "@playwright/test";

test("recall practice gives specific feedback, supports retry, persists, and resets", async ({
  page,
}) => {
  await page.goto("./#/chapter/1");
  const card = page.locator(".review-card").first();
  await expect(
    card.getByRole("button", { name: "Check reasoning" }),
  ).toBeDisabled();
  await card
    .getByRole("radio", {
      name: "Put both services in one group so each receives every event.",
    })
    .check();
  await card.getByRole("button", { name: "Check reasoning" }).click();
  await expect(
    card.getByText("Worth revisiting", { exact: true }),
  ).toBeVisible();
  await expect(card.locator(".feedback")).toContainText("share partition work");
  await card.getByRole("button", { name: "Try again" }).click();
  const radio = card.getByRole("radio", {
    name: "Give each service independent reading progress.",
  });
  await radio.focus();
  await page.keyboard.press("Space");
  await card.getByRole("button", { name: "Check reasoning" }).click();
  await expect(
    card.getByText("Concept checked", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    card.getByText("Concept checked", { exact: true }),
  ).toBeVisible();
  await expect(
    card.getByRole("radio", {
      name: "Give each service independent reading progress.",
    }),
  ).toBeChecked();
  const progress = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("kafka-lab-progress")!),
  );
  expect(progress.attempts).toBe(0);
  expect(progress.experiments).toEqual([]);
  expect(progress.missionPassed).toBe(false);
  await page.goto("./#/about");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset learning progress" }).click();
  await page.goto("./#/chapter/1");
  await expect(
    card.getByText("Think it through", { exact: true }),
  ).toBeVisible();
  await expect(
    card.getByRole("button", { name: "Check reasoning" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
