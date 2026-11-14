import { defineTheme } from "@astryxdesign/core/theme";
import { stoneTheme } from "@astryxdesign/theme-stone";
// Reading scales differ from compact application defaults. This is scoped to chapter 1.
export default defineTheme({
  name: "kafka-reading",
  extends: stoneTheme,
  components: {
    button: {
      "variant:primary": {
        backgroundColor: "var(--color-accent)",
        color: "var(--color-on-accent)",
        borderColor: "var(--color-accent)",
        ":hover:not(:disabled, [aria-disabled='true'])": {
          backgroundColor:
            "color-mix(in srgb, var(--color-accent) 88%, var(--color-text-primary))",
        },
      },
    },
    "segmented-control-item": {
      selected: {
        backgroundColor: "var(--color-accent-muted)",
        color: "var(--color-text-accent)",
        boxShadow: "inset 0 0 0 1px var(--color-accent)",
      },
    },
  },
  typography: {
    scale: { base: 16, ratio: 1.2 },
    body: { family: "system-ui" },
    heading: { family: "system-ui" },
    code: { family: "ui-monospace", fallbacks: "monospace" },
  },
  tokens: {
    // Restrained accents: teal for interaction, amber for paused/warning states.
    "--color-accent": ["#0f766e", "#72d5c1"],
    "--color-accent-muted": ["#e5f3ef", "#173a35"],
    "--color-text-accent": ["#0f655d", "#8bdfcd"],
    "--color-icon-accent": ["#0f766e", "#72d5c1"],
    "--color-on-accent": ["#ffffff", "#102824"],
    "--color-text-success": ["#0f655d", "#8bdfcd"],
    "--color-warning": ["#a16207", "#edbd68"],
    "--color-warning-muted": ["#fef3cf", "#372c1a"],
    "--color-text-warning": ["#854d0e", "#f3cf91"],
    "--color-border-warning": ["#b7791f", "#9c7338"],
    "--color-on-warning-muted": ["#854d0e", "#f3cf91"],
    "--text-heading-1-size": "3.25rem",
    "--text-heading-1-leading": "1.15",
    "--text-heading-2-size": "2rem",
    "--text-heading-3-size": "1.625rem",
    "--text-heading-4-size": "1.375rem",
    "--text-heading-5-size": "1.125rem",
    "--text-body-size": "1rem",
    "--text-body-leading": "1.8",
    "--text-large-weight": "400",
    "--text-supporting-size": "0.8125rem",
  },
});
