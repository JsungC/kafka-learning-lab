# Verification record

Executed on 2026-10-21 in the cloud development workspace.

- Node.js 24.19.0, npm 11.9.0.
- `npm test`: 10 unit tests passed (one suite).
- `npm run build`: strict TypeScript and Vite production build passed.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e`: six browser tests passed, three at 1440×1000 and three at 390×844. Both use reduced motion.
- Browser flows exercised direct delivery misses, retained delivery catch-up, independent notifications, experiment completion, partial-success feedback, passing mission, refresh persistence, progress reset, playback pause, single-step keyboard activation, corrupted storage recovery, home/roadmap/glossary navigation, and refresh under `/kafka-learning-lab/`.
- Core rules were checked against Apache Kafka 4.2.0 tagged design and introduction sources. Official website access was restricted; tagged official GitHub source was available. See README links.

## Local environment adjustments

The default npm cache path was not writable. Use `npm ci --cache /workspace/.npm` in this cloud workspace. The Playwright browser download domain was blocked; an existing system Chromium was used via the optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE` configuration override. The temporary network draft additions were removed; no new network domain is required for the current workflow. CI uses the standard Playwright Chromium installation.

## Limits

No live Kafka cluster is used or validated. Chapters 2–10 and their associated domain tests are not implemented. No Firefox, WebKit, real mobile device, screen reader, or deployed GitHub Pages instance has been inspected. Static-host subpath and refresh were tested against the built local preview. Deployment workflow execution remains unverified until the owner enables Pages and runs it. Licensing remains undecided.

## UI and theme revision — 2026-10-23

The revised interface was reviewed using actual Chromium screenshots at desktop (1440px) and mobile (390px) widths in both themes. Home, chapter, roadmap, glossary, and about routes showed no horizontal overflow at 390px and no browser runtime errors during inspection.

- `npm test`: 10 domain and persistence tests passed.
- `npm run build`: strict TypeScript and production build passed, including the static subpath theme initializer.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e`: 10 tests passed (five flows at each desktop/mobile size). New flows cover system dark preference, keyboard theme toggling, persistence across refresh and navigation, successful missions in dark mode, and blocked storage.
- Light/dark colors and current-section navigation were visually inspected. Reduced-motion behavior remains enabled in the browser test configuration. Screen-reader and non-Chromium verification remain outstanding.

These results concern the local revised build, not a deployment of this revision. No commit or push was performed for the design review.


## Explanatory visuals and compact theme control — 2026-10-23

- Original lesson explanations in `src/content/course.ts` remain unchanged.
- `npm test`: 12 tests passed, including independent bookmark advancement, retained records, and reproducible outage snapshot counts.
- `npm run build`: strict TypeScript and production build passed.
- Chromium browser suite: 12 tests passed across desktop and mobile sizes. New flows cover keyboard reading, reset, caught-up disabling, snapshot interpretation, design selection, and separation from assessed progress.
- Four figures were visually inspected in light mode at 1440px and dark mode at 390px. Screenshot inspection reported no runtime errors or mobile horizontal overflow. These checks were performed on the local build before committing; they do not establish deployment success.

The theme switch is now a 36px icon-only control with an accessible toggle name, pressed state, and destination-theme tooltip. The existing theme browser flows passed after this change.
