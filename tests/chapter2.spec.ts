import { test, expect } from "@playwright/test";
test("chapter 2 supports replay, expiry, partition offsets, report mission and persistent progress", async ({
  page,
}) => {
  await page.goto("./#/chapter/2");
  await expect(
    page.getByRole("heading", { name: "Topics and event logs.", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Read next record", exact: true }),
  ).toBeDisabled();
  await page
    .getByLabel("After reading three retained records")
    .selectOption("three");
  await page
    .getByRole("button", { name: "Append one order", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Read next record", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Seek earliest retained", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Read next record", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#log-lab .log-record").first()).toContainText(
    "2 read observation(s)",
  );
  await page.getByLabel("Partition count").selectOption("2");
  await page
    .getByRole("button", { name: "Append one order", exact: true })
    .click();
  await page.getByLabel("Selected partition").selectOption("1");
  await page
    .getByRole("button", { name: "Append one order", exact: true })
    .click();
  await expect(page.locator("#log-lab .log-record .concept-kicker")).toHaveText(
    ["P0 · OFFSET 0", "P1 · OFFSET 0"],
  );
  await page.getByLabel("Retention window", { exact: true }).selectOption("3");
  await page
    .getByRole("button", { name: "Append one order", exact: true })
    .click();
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: "Advance time one step", exact: true })
      .click();
  await page
    .getByRole("button", { name: "Read next record", exact: true })
    .click();
  await expect(page.locator("#log-lab [role=status]")).toContainText(
    "no longer retained",
  );
  await page
    .getByRole("button", { name: "Validate report design", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Report requirements need work" }),
  ).toBeVisible();
  await page.getByLabel("Report retention").selectOption("12");
  await page.getByLabel("Initial report position").selectOption("earliest");
  await page
    .getByRole("button", { name: "Validate report design", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Report requirements met" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Chapter 2 complete", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Chapter 2 complete", exact: true }),
  ).toBeVisible();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("kafka-lab-progress")!),
  );
  expect(stored.missionPassed).toBe(false);
  expect(stored.chapter2.missionPassed).toBe(true);
  await page.goto("./#/roadmap");
  await page
    .getByRole("link", { name: "Topics and event logs →", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Topics and event logs.", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.goto("./#/about");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset learning progress" }).click();
  await page.goto("./#/chapter/2");
  await expect(
    page.getByRole("heading", {
      name: "Your chapter 2 checklist",
      exact: true,
    }),
  ).toBeVisible();
});
test("changed-condition prediction reveals evidence without completing the chapter", async ({
  page,
}) => {
  await page.goto("./#/chapter/1");
  await expect(
    page.getByRole("figure", { name: "What actually runs in a Kafka system" }),
  ).toBeVisible();
  const transfer = page.getByRole("region", {
    name: "Apply the idea when assumptions change",
  });
  await transfer
    .getByRole("radio", {
      name: "No, the needed history is no longer retained.",
    })
    .check();
  await transfer.getByRole("button", { name: "Reveal model evidence" }).click();
  await expect(transfer.locator(".feedback")).toContainText(
    "All three records expired",
  );
  await transfer
    .getByRole("button", {
      name: "Direct delivery gains durable retries",
      exact: true,
    })
    .click();
  await transfer
    .getByRole("radio", {
      name: "No, durable recording and successful retries can recover them.",
    })
    .check();
  await transfer.getByRole("button", { name: "Reveal model evidence" }).click();
  await expect(transfer.locator(".feedback")).toContainText(
    "Direct delivery can now recover",
  );
  await page.reload();
  await transfer
    .getByRole("button", {
      name: "Direct delivery gains durable retries",
      exact: true,
    })
    .click();
  await expect(transfer.locator(".feedback")).toContainText(
    "Direct delivery can now recover",
  );
});

test("chapter 2 playback pauses consistently and the optional guide has no completion side effects", async ({
  page,
}) => {
  await page.goto("./#/chapter/2");
  await page
    .getByLabel("After reading three retained records")
    .selectOption("three");
  await page
    .getByRole("button", { name: "Start demonstration", exact: true })
    .click();
  await expect(page.locator("#log-lab .log-record")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Pause demonstration", exact: true })
    .click();
  const before = await page.locator("#log-lab .log-view").innerText();
  await page.waitForTimeout(1000);
  expect(await page.locator("#log-lab .log-view").innerText()).toBe(before);
  await page
    .getByRole("button", { name: "Reset log experiment", exact: true })
    .click();
  await expect(page.locator("#log-lab .log-record")).toHaveCount(0);
  await page.locator(".practice-guide summary").click();
  await expect(
    page.getByRole("heading", {
      name: "5. Read the same facts with a new independent subscription",
    }),
  ).toBeVisible();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("kafka-lab-progress")!),
  );
  expect(stored.chapter2.missionPassed).toBe(false);
  expect(stored.chapter2.experiments).toEqual([]);
});
