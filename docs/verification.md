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
