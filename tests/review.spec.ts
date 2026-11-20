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
      name: "No. Notifications used up the ticket for 002.",
    })
    .check();
  await card.getByRole("button", { name: "Check reasoning" }).click();
  await expect(
    card.getByText("Worth revisiting", { exact: true }),
  ).toBeVisible();
  await expect(card.locator(".feedback")).toContainText(
    "ticket stayed on file",
  );
  await card.getByRole("link", { name: /Compare a retained ticket/ }).click();
  await expect(page.locator("#retention-boundary")).toBeFocused();
  await page.getByRole("link", { name: /Return to your question/ }).click();
  await expect(card).toBeFocused();
  await card.getByRole("button", { name: "Try again" }).click();
  const radio = card.getByRole("radio", {
    name: "Yes. Its next ticket is 002, and the shop still has it.",
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
      name: "Yes. Its next ticket is 002, and the shop still has it.",
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
