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

No live Kafka cluster is used or validated. Chapters 2–10 and their associated domain tests are not implemented. No Firefox, WebKit, real mobile device, screen reader, or deployed GitHub Pages instance has been inspected. Static-host subpath and refresh were tested against the built local preview. Deployment workflow execution remains unverified until the owner enables Pages and runs it. Licensing was undecided during this initial verification; the project has since adopted MIT for original code and educational content.

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

## Chapters 1–2 and recall practice — 2026-10-23

- `npm test`: 21 tests passed. Added partition-local offsets, immutable append state, replay without read-deletion, expiration and unavailable history, non-reused offsets, end-position skipping, alternative valid mission configurations, changed-assumption evidence, and chapter-specific progress recovery.
- `npm run build`: strict TypeScript and production build passed.
- Chromium desktop/mobile browser suite: 20 tests passed. Covered saved recall feedback and reset, the runtime map, changed-condition predictions, Chapter 2 partition selection, replay, expiration, invalid and valid report designs, chapter-specific completion and restoration, playback pause/reset, optional guide disclosure, and static-subpath navigation.
- Inspected Chapter 2 desktop light and desktop/mobile dark screenshots. Browser inspection reported no runtime errors or horizontal overflow at 390px. Controls stack vertically on mobile so selected settings remain readable.
- Executed the optional guide against the official Docker image `apache/kafka:4.2.0` (image digest `sha256:9516fb7634bad307d17c33b589fde9023003b0cb761374f500002b980a3149b9`). Created a one-partition topic, produced three synthetic values, and read identical partition-0 records at offsets 0, 1, and 2 with two fresh consumer groups. The originally tested `--property` flag emitted a deprecation notice; the guide was corrected to `--formatter-property` and rerun from a fresh broker with no such warnings. Stopped only the temporary practice container after verification.
- Browser-model verification and real-broker observations are separate. No production cluster, cross-browser coverage, committed-position restart exercise, or deployment of this local revision is claimed. Existing Chapter 1 progress remains readable.


## Chapter 3: keys and ordering — 2026-10-27

- `npm test`: 28 tests passed, including keyed placement with collisions, per-partition serial completion, cross-partition reordering, single-lane parallelism failure, alternative valid mission configurations, teaching-key mapping, immutability/reproducibility, and independent Chapter 3 progress recovery.
- `npm run build`: strict TypeScript and Vite production build passed.
- Chromium browser suite: 24 tests passed at desktop and mobile sizes, with reduced motion. New flows complete both routing experiments, validate failure and success, activate controls by keyboard, restore/reset chapter-specific progress, pause/reset playback, and compare hypothetical counts without mutating experiment state. Roadmap navigation exposes three available chapters without completion gates.
- Inspected desktop light introduction, desktop dark split-key lab, and 390px mobile dark mission screenshots. Browser inspection reported no runtime errors or horizontal overflow. No real Kafka performance or client partition-number equivalence is claimed; this chapter uses the documented teaching partitioner.
- Reference content checked against Apache Kafka 4.2.0 tagged design and producer configuration. The README retains its concise project overview; no milestone log was added.

## Guided timeline and reading emphasis — 2026-10-27

- Added immutable, deterministic Chapter 3 timeline snapshots with range/keyboard seeking, previous/next navigation, landmarks, and playback that pauses on manual seeking. Explanations share one fixed-location panel with consistent Changed / Look here / Why it matters fields. No floating annotations or modal overlays were added.
- `npm test`: 29 tests passed. `npm run build`: passed. Chromium desktop/mobile suite: 26 tests passed, including backwards/forwards state equivalence, keyboard seeking, manual playback interruption, and one explanation region.
- Inspected desktop dark and 390px mobile dark timeline captures. Sampled publication and processing states retained panel heights of 235px desktop and 330px mobile; no horizontal overflow was observed.
- Chapters 1–3 retain their original paragraph text with selectively curated semantic emphasis, without highlighting whole paragraphs. No README progress log was added.


## Chapter 4: consumer groups and scaling — 2026-11-10

- `npm test`: 36 tests passed. Added partition ownership/idle-member checks, independent full subscriptions, shared-work semantics, processing-pause membership retention, immutable reassignment with preserved positions, deterministic timelines, per-member capacity, 2–5 valid mission designs, and isolated fourth-chapter progress restoration.
- `npm run build`: strict TypeScript and static production build passed.
- Chromium desktop/mobile suite: 30 tests passed. New flows compare both subscription topologies, inspect membership changes, seek by keyboard, validate failure and success, restore/reset progress without completing prior chapters, navigate the static subpath, pause playback on seeking, and show idle consumers.
- Inspected desktop light introduction and mobile dark timeline/mission captures. No runtime errors or horizontal overflow were reported. Sampled explanation frames retained a panel height of 270px desktop and 365px at 390px width. No real Kafka throughput, coordinator protocol execution, or committed restart behavior is claimed.
- README remains a concise project overview without milestone updates. This is local validation; no deployment of this revision was performed.

## Astryx Chapter 1 implementation — 2026-11-13

- Pinned Astryx core/theme/CLI 0.7.15 and its StyleX 0.19.0 peer. Built a Neutral-derived reading theme and migrated Chapter 1 controls using documented component APIs.
- `npm test`: 36 passed. Production build passed, with generated theme assets and lazy-loaded Chapter 1/selector chunks; no oversized-chunk warning remains.
- Chromium suite: 32 passed at desktop and mobile widths. New checks preserve every lesson paragraph, exercise keyboard interaction with the new selector/segmented control, confirm theme continuity after navigation/reload, and prohibit remote Google Font requests. Existing experiment, assessment, persistence, and Chapters 2–4 flows remain covered.
- Astryx built-output doctor: 20 passes, zero failures, two related optional-font warnings. System fonts are intentional; see `docs/astryx-design.md`.
- Before/after light/dark captures were generated from the prior Git HEAD and local migrated build with the same experiment inputs. Review reported no browser errors or horizontal overflow. No commit, push, or deployment was performed for this review.

### Chapter 1 Stone review

- Added the official Stone package at the matching 0.7.15 version through the Astryx theme CLI; only Chapter 1 uses the Stone-based reading derivative. Existing routes retain Neutral initialization.
- Followed installed CLI guidance for layout, theme nesting, typography, and RadioList. Chapter 1 uses Stack layout/spacing, semantic Text/Heading, flat section groupings, and library recall/transfer controls. Content, simulation rules, mission assessment, and persistence remain unchanged.
- Production build and 36 simulation tests pass; Chromium desktop/mobile suite passes all 32 tests, including Chapters 2–4 regression flows. Doctor reports 20 passes, zero failures, and two expected external-font warnings; Vite intentionally replaces optional font CSS with local system-font fallbacks.
- Browser screenshots in `/workspace/artifacts/stone-chapter1` cover light/dark introduction and experiment, plus mobile experiment. No runtime errors or horizontal overflow observed.

### Chapter 1 reading and experiment redesign

- Redesigned the opening, learning goals, conceptual overview, chapter navigation, reading surface, and experiment workspace. Chapter 1 chrome follows Stone; leaving the chapter restores the existing route theme.
- Body text measures 16px at desktop and mobile viewports. The live state uses six reserved event positions; actual simulation history appears in a stable observation panel. The domain simulation and assessment functions are unchanged.
- Production build, 36 domain tests, and all 32 Chromium desktop/mobile tests passed. Relevant learning, recall, appearance and keyboard tests were rechecked after workspace layout changes. Additional browser review covers 320, 390, 768, 1024 and 1440px widths, keyboard jump navigation, text clipping and observation-panel stability during playback.
- Final screenshots and review gallery are under `/workspace/artifacts/chapter1-final`. The branch preview workflow publishes this iteration on push.

### Stone accent palette

- Added teal interaction/selection accents and amber paused/warning states in the reading theme, with separate light/dark values. Kept primary surfaces and long-form text neutral.
- Checked actual primary-action foreground/background contrast in light and dark mode, including hover, and corrected legacy CSS overrides affecting solid action colors. Rechecked production build, all 36 domain tests, and all 32 Chromium desktop/mobile tests. Theme doctor retains zero failures and the documented optional-font warnings.
