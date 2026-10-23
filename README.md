# Kafka Learning Lab

A browser-only introduction to Apache Kafka for people with no Kafka background. It documents personal learning, demonstrates domain modeling and accessible interaction, and offers free educational material. It is an independent project, not an official or endorsed Apache Kafka service. UI, content, and documentation use English.

## Run locally

Use Node.js 24 and npm. Learners need only a browser; no Kafka, Java, Docker, account, or API key is required.

```sh
npm ci
npm run dev
```

Open the development server at the `/kafka-learning-lab/` path. `npm run build` checks strict TypeScript and produces `dist/`. `npm run preview` serves that build. Use hash routes such as `/kafka-learning-lab/#/chapter/1`: refreshing a lesson requests the static index rather than a server-side route.

## Initial scope: M0 and M1

- Home, complete ten-chapter roadmap, glossary, project introduction, references, and limitations.
- Chapter 1 has beginner explanations, a prediction, direct-versus-retained delivery experiments, independent consumer controls, observable event logs, and an outcome-graded order-service mission.
- Notifications must continue during a scheduled analytics outage; analytics must subsequently read every order. Incorrect configurations get partial-success feedback, progressive hints, and retries.
- Schema-versioned local progress separates chapter opening, experiment attempts, mission attempts, and mission success. Both experiments and mission success are required for completion. Reflection is explicitly self-assessed.
- Chapters 2–10 are roadmap entries, not implemented lessons. Next milestone: M2 (topics, keys, consumer groups, and offsets).

## Architecture and decisions

React 19, TypeScript strict mode, and Vite 7 build a static site. `package-lock.json` pins resolved dependencies. Hash routing supports GitHub Pages without a fallback server. The Vite base is `/kafka-learning-lab/`; adjust it if repository or hosting path changes.

- `src/content/`: English educational content, curriculum, glossary, and hints, independent of the engine. Reusable component labels live with their components; localization is future work.
- `src/simulation/core.ts`: deterministic, immutable state transitions; no randomness or wall-clock domain rules.
- `src/assessment/mission.ts`: a fresh scenario and outcome checks.
- `src/components/Simulation.tsx`: diagrams, counts, event outcomes, and logs derived from engine state.
- `src/persistence/`: schema validation and recovery from malformed/old data.

The six fixed events use one educational log, separate service positions, one event processed per step, no expiry, and successful publication. Direct delivery has no retries or durable storage. A real direct system can add these; this model is not a universal argument against direct calls. Independent subscriptions correspond to separate Kafka consumer groups. Real Kafka ordering is per partition. Consumption does not remove records; retention limits recovery. There is no model of brokers, replication, commits, transactions, databases, or durable duplicate prevention yet. Timing and throughput are educational model values, never Kafka benchmarks.

Playback is an optional timer dispatching the same pure step action used by manual stepping. Reduced motion disables CSS animation; this implementation uses static state diagrams. Pausing playback does not pause a consumer, and pausing analytics does not pause production. These are separate controls.

## Visual learning aids

Chapter 1 retains its full explanations and adds four adjacent concept figures: annotated event fields and service reactions; an interactive independent-reader matrix; engine-derived outage snapshots with a conceptual retention boundary; and a requirement-driven design comparison. The reader matrix and outage snapshots reuse the chapter's pure simulation transitions. Their controls support keyboard use and do not award experiment or mission progress. They explain the model before learners enter the graded mission. Retention expiration and queue semantics are conceptual comparisons, not additional simulated Kafka features.

## Appearance and reading experience

The header theme button switches between light and dark modes. The first visit follows the operating system; an explicit choice is stored separately from learning progress and applied before the initial paint. The site remains usable if browser storage is blocked. Resetting learning progress preserves the theme preference. Theme changes do not change simulation rules or assessment outcomes.

The interface uses event-flow diagrams, a contextual learning continuation link, a current-section chapter outline, and distinct experiment and mission panels. Native controls remain keyboard accessible, and motion follows the reduced-motion preference. No external fonts or image assets are required.

## Verify

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Unit tests check immutable/reproducible transitions, recovery, retention, grading, schema recovery, and completion rules. Playwright runs Chromium at desktop and mobile widths with reduced motion: both experiment models, partial and successful missions, refresh persistence, reset, corrupt storage, playback pause, keyboard activation, navigation, and subpath refresh. No zero-test run is treated as verification. See `docs/verification.md` for actual execution evidence and limits.

Accessibility includes semantic headings, labels, visible focus, a skip link, native keyboard controls, textual event states, optional playback, and concise live announcements. Manual screen-reader testing and cross-browser validation remain outstanding. No claims of full accessibility certification are made.

## Deployment

Build output is suitable for GitHub Pages. In repository settings select **GitHub Actions** as the Pages source, then run **Deploy GitHub Pages** or push to `main`. Subsequent pushes to `main` automatically build and deploy the site. The project URL is `https://jsungc.github.io/kafka-learning-lab/`; the repository does not need to be renamed. This project has not been published by the development task. CI checks tests, build, and browser flows on pushes and pull requests. No AWS infrastructure is needed.

## References, provenance, and contributions

Concepts were checked against Apache Kafka **4.2.0** tagged sources on **2026-10-21** (not a claim about the latest version):

- [Design](https://github.com/apache/kafka/blob/4.2.0/docs/design/design.md): consumer position, independent subscriptions, retention versus compaction.
- [Introduction](https://github.com/apache/kafka/blob/4.2.0/docs/getting-started/introduction.md): event streaming, producers, consumers, and topics.

The specification's `kafka-learning-lab-demo.html` was not available and was not inspected. No copied assets, external fonts, fabricated usage metrics, or real-cluster performance claims are included. Illustrations are original CSS and text. Dependencies retain their own licenses.

Before contributing, discuss curriculum or scope changes, keep content separate from domain transitions, and add meaningful tests for changed behavior. Do not introduce real clusters, paid services, authentication, or remote execution into the required learning path.

**Licensing pending:** the owner must select licenses for code and educational content before open-source distribution. No license is chosen by this task. Domain, final branding, and optional Korean localization remain nonblocking decisions.
