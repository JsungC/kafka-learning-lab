import type { Page } from "@playwright/test";
export async function predictLog(page: Page) {
  await page
    .getByRole("combobox", { name: "Your prediction", exact: true })
    .click();
  await page
    .getByRole("option", {
      name: "Only the retained log recovers missed events in this model",
      exact: true,
    })
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
