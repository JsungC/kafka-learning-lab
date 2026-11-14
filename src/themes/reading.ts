import { defineTheme } from "@astryxdesign/core/theme";
import { stoneTheme } from "@astryxdesign/theme-stone";
// Reading scales differ from compact application defaults. This is scoped to chapter 1.
export default defineTheme({
  name: "kafka-reading",
  extends: stoneTheme,
  typography: {
    body: { family: "system-ui" },
    heading: { family: "system-ui" },
    code: { family: "ui-monospace" },
  },
  tokens: {
    "--text-heading-1-size": "3rem",
    "--text-heading-1-leading": "1.15",
    "--text-heading-2-size": "2rem",
    "--text-heading-3-size": "1.625rem",
    "--text-heading-4-size": "1.375rem",
    "--text-heading-5-size": "1.125rem",
    "--text-body-size": "1rem",
    "--text-body-leading": "1.85",
  },
});
