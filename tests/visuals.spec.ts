import { test, expect } from "@playwright/test";
test("lesson visuals explain independent reading, recovery, and design choices", async ({
  page,
}) => {
  await page.goto("./#/chapter/1");
  const readers = page.getByRole("figure", {
    name: "Shared records. Separate reading progress.",
  });
  await expect(
    readers.getByRole("cell", {
      name: "Analytics, order 1: pending",
      exact: true,
    }),
  ).toBeVisible();
  await readers
    .getByRole("button", { name: "Read next analytics event" })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    readers.getByRole("cell", {
      name: "Analytics, order 1: processed",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    readers.getByRole("cell", {
      name: "Analytics, order 2: pending",
      exact: true,
    }),
  ).toBeVisible();
  for (let i = 0; i < 5; i++)
    await readers
      .getByRole("button", { name: "Read next analytics event" })
      .click();
  await expect(
    readers.getByRole("button", { name: "Read next analytics event" }),
  ).toBeDisabled();
  await expect(readers.getByRole("status")).toContainText(
    "All 6 records remain",
  );
  await readers.getByRole("button", { name: "Reset bookmarks" }).click();
  await expect(
    readers.getByRole("cell", {
      name: "Analytics, order 1: pending",
      exact: true,
    }),
  ).toBeVisible();
  const outage = page.getByRole("figure", {
    name: "An outage changes the reader, not the record.",
  });
  await outage.getByRole("button", { name: "02 Analytics paused" }).click();
  await expect(outage.getByRole("status")).toContainText("two pending events");
  await outage.getByRole("button", { name: "04 Caught up" }).click();
  await expect(outage.getByRole("status")).toContainText(
    "Both consumers processed all six",
  );
  const choices = page.getByRole("figure", {
    name: "Choose for the job, not the technology.",
  });
  await choices
    .getByRole("button", { name: "Independent readers & recovery" })
    .click();
  await expect(
    choices.getByText("A retained event stream", { exact: true }),
  ).toBeVisible();
  await choices.getByRole("button", { name: "One background task" }).click();
  await expect(
    choices.getByText("A job queue may be enough", { exact: true }),
  ).toBeVisible();
  // Explanatory interactions do not award chapter completion or mission attempts.
  const progress = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("kafka-lab-progress")!),
  );
  expect(progress.attempts).toBe(0);
  expect(progress.experiments).toEqual([]);
  expect(progress.missionPassed).toBe(false);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
