import type { Page } from "@playwright/test";

export async function openFreeExperiment(page: Page) {
  await page
    .getByText("Run your own six-order experiment", { exact: true })
    .click();
}

export async function predictFirstRead(
  page: Page,
  order: "001" | "003" | "004",
) {
  await page
    .getByRole("combobox", { name: /When analytics resumes and 004 arrives/ })
    .click();
  await page
    .getByRole("option", { name: `Order ${order}`, exact: true })
    .click();
}

export async function chooseLog(
  page: Page,
  group = "Delivery model (changing it resets the experiment)",
) {
  await page
    .getByRole("radiogroup", { name: group, exact: true })
    .getByRole("radio", { name: "Retained log", exact: true })
    .click();
}
