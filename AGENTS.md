# AGENTS

Project-specific guidance for AI coding agents.

<!-- ASTRYX:START -->
Astryx v0.7.15 · 174 components
CLI: run every command as `npx astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — start every page from a template, never from scratch:
1. `astryx build "<idea>"` — names the template to scaffold from and the parts it lacks.
2. `astryx template <name> <path>` — scaffold it; keep its frame, gap and padding; replace the content.
3. `astryx template <Block>` for parts it lacks; `astryx component <Name>` to read props before using one.
Changing an existing page? Keep it: skip step 2 and add blocks/components inside its sections.
Before you deliver a build, run `astryx doctor --built <dir>`; don't deliver it if it fails.

RULES:
- No <div> — components handle all layout and spacing.
- Read `astryx docs layout` before changing a template's frame.
- Dense data = rows (Table, List/Item), not Card-wrapped lists. Badge = counts only.
- Style with component props first, then tokens (var(--color-*|--spacing-*|--radius-*)). No raw hex/px. No StyleX/Tailwind compiler here — don't use xstyle/utility classes directly. Some templates use StyleX and need a compiler plugin; see `astryx docs styling-overview`.
- Palettes and custom colors go through the theme, never :root overrides. Run `astryx theme add <slug>` to import; `theme eject <slug>` only forks source. See `astryx docs theme`.
- SELF-CHECK: re-read the file; replace any raw <div>/<span>, imported .css/@apply, or hardcoded #hex/px with the component or a token.

`astryx help` lists every command. Key ones beyond the workflow:
  search "<query>"   find any component / hook / doc / template
  discover <words>   integrations you could add
  docs <topic>       getting-started, principles, tokens, theme … (`astryx docs` lists all)
  docs cli           commands and API reference
  docs authoring     build an integration package, and every field it holds
  upgrade --from <old version> --apply   run after a dependency bump
<!-- ASTRYX:END -->

## Kafka Learning Lab guidance by scope

UI implementation follows Astryx APIs, layout primitives, semantic typography, and theme tokens. Content and learning-flow requirements apply to their respective scopes:
- Migrate Chapter 1 first. Preserve all lesson explanations, simulation rules, assessments, saved progress, and English content. Do not turn lesson pages into dashboards or promotional landing pages.
- Keep stage explanations together in a stable reading region; avoid floating annotations and excessive animation. Emphasize only selected principles.
- Maintain the small icon-only theme toggle, system preference on first visit, saved overrides, reduced motion, mobile layouts, and keyboard alternatives.
- Use Astryx Text and Heading for Chapter 1 text and Stack primitives for UI layout. Keep semantic HTML for explanatory diagrams and unchanged chapters; do not mass-rewrite the other chapters to satisfy generic markup rules.
- The existing stylesheet is a compatibility layer below Astryx; Chapter 1 uses scoped token-based refinements. Do not import optional remote font CSS. Use the neutral foundation for existing routes and Chapter 1’s Stone-based kafka-reading derivative. The Vite font aliases intentionally avoid optional remote font imports.
- Read actual installed component APIs with `npm run astryx -- component NAME`. Do not guess props. Run `npm run astryx -- doctor --built dist`, the production build, and relevant learning-flow tests.
- The site remains a static Vite app on the `/kafka-learning-lab/` subpath. No server, account, tracking, or runtime secrets are needed.

Rebuild reading theme source with `npm run astryx:theme`; `npm run build` also regenerates it before type checking. Preserve the generated theme headers and do not edit generated theme files by hand.
