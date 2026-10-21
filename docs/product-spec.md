# Kafka Learning Lab — Codex Development Guidelines and Product Specification

Date: 2026-10-21 · Version: 1.1 · English

Language decision: English is the confirmed default language for the project, including its website UI, educational content, exercises, feedback, and project documentation. Korean localization is optional future work.

## 0. Purpose and Decision Status

This document guides Codex in developing the Kafka learning website. It defines the project's purpose, educational standards, implementation scope, development sequence, and acceptance criteria. Build an educational product that connects explanations with hands-on practice.

Distinguish requirements established in previous conversations from implementation defaults proposed in this document.

| Status | Details |
| --- | --- |
| Confirmed purpose | Document personal Kafka learning, serve as a developer portfolio, and provide free educational material to others. |
| Confirmed audience | People with no prior knowledge of Kafka. |
| Confirmed educational requirements | A structured learning sequence, detailed explanations, interactive animations, and chapter-end simulations based on practical scenarios. |
| Confirmed practice experience | Learners interact directly in the browser and observe results without installation or environment setup. |
| Preferred hosting direction from previous discussions | Start with a static site suitable for GitHub Pages. Consider AWS when actual server-side features justify it. |
| Confirmed project language | English for the website UI, learning content, simulations, feedback, documentation, and code comments. |
| Proposed implementation defaults | The technology stack, chapter structure, simulator architecture, and milestones described below. |
| Unresolved decisions | Repository and domain, final visual design, whether and when to add optional Korean localization, and licenses for code and educational content. |

These defaults provide an actionable starting point. They do not imply that the user previously approved every detail. Reuse a reasonable existing repository structure and document any differences. Record unresolved, nonblocking decisions as TODOs and continue.

## 1. Product Goals

Learners should be able to:

1. Explain which problems Kafka solves and when Kafka may be unnecessary.
2. Understand how events move from producers through topics and partitions to consumers.
3. Explain the relationships between ordering, parallel processing, replay, replication, and failure recovery.
4. Choose topics, keys, partitions, consumer groups, and processing policies based on requirements.
5. Reproduce failures and use observed evidence to identify causes and evaluate solutions.
6. Distinguish the educational model from the guarantees of real Kafka systems.

The portfolio should demonstrate domain modeling, state transitions, testing, technical accuracy, accessibility, and design reasoning alongside visual quality. Do not present the site as proof of production Kafka operations experience or measured Kafka performance.

## 2. Scope

### 2.1 Initial Development Scope

- Home page and complete learning roadmap.
- A fully implemented first chapter for beginners.
- Reusable explanation, experiment, and assessment components.
- A state-based simulation engine running in the browser.
- Local learning-progress storage and reset functionality.
- Glossary, references, project introduction, and simulation-limitations guidance.
- Configuration for static builds and GitHub Pages deployment.

### 2.2 Excluded from the Initial Scope

- Connections to real Kafka clusters, servers, or databases.
- Registration, login, and server-based learning-progress synchronization.
- Payments, subscriptions, advertising, social features, and leaderboards.
- Remote code execution or required exercises involving Docker or Java installation.
- External LLM APIs required for learning.
- Cluster editors with the complexity of production administration consoles.

Optional exercises using real Kafka may be added as a separate track later. The required learning path must remain completable without installation.

## 3. Instructional Design

### 3.1 Common Chapter Flow

Preserve the user's proposed introduction, detailed exploration, and wrap-up structure. Incorporate prediction, experimentation, and application within that structure.

| Stage | Required elements | Learner activity |
| --- | --- | --- |
| 1. Introduction | A realistic problem, chapter overview, prerequisites, and learning objectives. | Understand why the concept matters. |
| 2. Concept explanation | Definitions, accessible examples, components, internal behavior, scope, and limitations. | Connect terminology to behavior. |
| 3. Prediction and experimentation | Outcome prediction, adjustable variables, step-by-step execution, and explanations. | Form a hypothesis and observe the result. |
| 4. Interpretation | What changed, why it changed, and common misconceptions. | Explain observations using the underlying principles. |
| 5. Chapter-end exercise | New requirements, configuration choices, failure or load conditions, and validation. | Apply the concepts to another situation. |
| 6. Wrap-up | Core principles, self-explanation questions, exercise debrief, and a connection to the next chapter. | Check understanding. |

Interactions must not replace substantial explanations. Avoid animations that add no educational value. Every interaction must address an identifiable learning question.

### 3.2 Content Writing Rules

- Define new terms in plain English. Expand acronyms at first use.
- Assume no Kafka knowledge. Briefly explain or link to necessary background such as HTTP, databases, and asynchronous processing.
- Organize explanations as problem → concept → execution process → example → limitations and misconceptions.
- When using an analogy, explain both where it matches the actual system and where it does not.
- Keep essential explanations visible. Reserve collapsible sections for optional advanced material.
- Do not shorten explanations merely to fit a five-minute lesson or fixed word count. Split long chapters into smaller lessons.
- Explain each code example's purpose, inputs, important lines, and results. Clearly label pseudocode.
- Feedback for incorrect answers must explain why the choice fails and, where relevant, when it could be appropriate.
- Do not explain beginner answers using unexplained advanced terminology.
- Write all website UI, lesson explanations, glossary entries, simulation instructions, hints, feedback, assessments, summaries, and project documentation in English. Use English for code comments as well.
- Separate UI strings and educational content from rendering logic so optional Korean localization can be added later. English must be complete and usable on its own. Do not expose an incomplete language switcher in the first release.

### 3.3 Completion Criteria

Track viewing, activity attempts, and successful exercises as separate states. Opening a page or clicking a button once must not complete an entire chapter.

Chapter completion requires performing the required experiments and meeting the chapter-end simulation objectives. Self-explanation questions may use model explanations and self-assessment. Do not pretend to automatically evaluate the meaning of free-form answers. Allow learners to explore other chapters regardless of completion status.

## 4. Proposed Curriculum

The following curriculum is an implementation default. A chapter may contain multiple lessons. Do not require later concepts before teaching their prerequisites.

| Chapter | Main concepts | Chapter-end simulation and acceptance criteria |
| --- | --- | --- |
| 1. Events and Why Kafka Exists | Events, direct connections, asynchronous processing, producers, topics, and consumers. | Deliver order events to notification and analytics services. Verify that notifications continue while analytics is paused, and that analytics processes retained events after resuming. Explain the consumer-group mechanics behind independent subscriptions later. |
| 2. Topics and Event Logs | Records, keys and values, append-only logs, partitions, offsets, and retention. | Create and inspect an order log in one partition. Verify that consumption does not immediately delete records and that retained events can be read again. |
| 3. Keys and Ordering | Partition selection, identical keys, partition-local ordering, and parallelism. | Configure an order flow that preserves per-customer ordering. Verify per-customer ordering and parallel processing across customers under explicitly fixed partition-count and partitioner assumptions. |
| 4. Consumer Groups and Scaling | Groups, partition assignment, independent subscriptions, and changing consumer counts. | Increase inventory-service throughput while delivering the full event stream to analytics. Distinguish shared work within one group from independent consumption across groups. |
| 5. Offsets and Replay | Read position, completed processing, committed position, and restart behavior. | Predict which event will be processed after a failure. Verify that the current position can differ from the stored committed position. |
| 6. Brokers and Replication | Brokers, leaders and followers, replication factor, in-sync replicas (ISR), and acknowledgments (acks). | Trigger a broker failure under predefined replication and acknowledgment conditions. Explain read/write availability and the conditions for successful responses. |
| 7. Delivery Guarantees and Idempotency | Duplicates, committing before or after processing, idempotency, and external database boundaries. | Reproduce a failure after a database update but before an offset commit. Configure processing so that repeated attempts produce only one inventory effect. |
| 8. Lag and Failure Handling | Consumer lag, production and consumption rates, retries, poison events, and dead-letter queue (DLQ) patterns. | Distinguish event-processing failures from backlog causes and select a handling strategy. Observe how retries and routing to another topic affect ordering. |
| 9. Event Contracts and Integration | Schema changes, compatibility, an introduction to Kafka Connect and Kafka Streams, and the purpose of the Outbox pattern. | Choose an event change based on fields used by consumers. Identify failure windows between database persistence and event publication. |
| 10. Capstone System Design | Requirements analysis, design choices, failure validation, and trade-offs. | Configure an e-commerce order system and meet objectives for ordering, independent subscriptions, duplicate-effect prevention, and recovery. |

When discussing Schema Registry, DLQ, and Outbox, distinguish products, patterns, and configuration responsibilities. Do not present them as one automatic built-in Kafka guarantee.

## 5. Experiment and Simulation Requirements

### 5.1 Common Controls

- Start, pause, single-step execution, and reset.
- Only the variables needed for the current lesson.
- Logs showing input events, the current configuration, resulting state, and event sequence.
- Explanations and key metrics for before-and-after comparisons.
- Immediate feedback explaining what changed and why.
- Seeds and reproducible execution when randomness is used.
- Disabled invalid actions with explanations.

The first chapter should use simple connections and start/stop controls. Introduce replication, commits, and failure policies according to the learning sequence.

### 5.2 Chapter-End Exercises

An exercise must require more than following a predetermined button sequence. Learners must read requirements and make at least one meaningful configuration choice.

Each exercise definition must include:

- Scenario and learning objectives.
- Previously taught prerequisite concepts.
- Initial state and learner-adjustable settings.
- Event inputs and failure schedules used for validation.
- Passing conditions, partial-success conditions, and failure explanations.
- Progressive hints and retry behavior.
- A reference configuration and trade-offs of other valid configurations.
- A list of simplifications relative to real Kafka.

Evaluate whether execution outcomes satisfy the requirements. Do not grade a specific visual arrangement or click sequence. Accept all valid designs when multiple solutions exist.

### 5.3 Consistency Between the UI and Model

Animations, numbers, logs, and assessment results must derive from the same simulation state. Do not implement moving events that exist only in the visual layer. Disabling animation must not change the result.

Label simulated timing and throughput as educational model values. Do not describe them as real Kafka benchmarks. Reproducing the entire network, disk, and broker protocol stack is outside the simulator's purpose.

## 6. Technical Accuracy and Treatment of the Existing Demo

### 6.1 Existing Reference Material

Use `kafka-learning-lab-demo.html` as an interaction reference for duplicate consumption and idempotency. Do not use it unchanged as the first page of the beginner course. Its single-screen structure and hardcoded progress values are not product requirements.

Elements worth retaining:

- Visualization of producer, consumer, and database relationships.
- Step-by-step processing → failure → restart controls.
- Comparison with duplicate protection enabled and disabled.
- Separate counts for processing attempts and actual business effects.

Required changes:

- Add explanations and prerequisite links for learners encountering the concepts for the first time.
- Replace or remove illustrative values such as `9/25 lessons`, `4-day streak`, and scheduled reviews.
- Review offset labels. Do not confuse the last processed record's offset with the committed restart position.
- Replace completion triggered solely by button execution with chapter-objective validation.
- If the reference file is unavailable in the development environment, do not claim to have inspected it. Proceed using this specification.

### 6.2 Accuracy Rules

- Distinguish current read position, processing completion, and committed position. In an educational example with consecutive offsets, processing offset 42 and committing the next position produces a committed value of 43. If the committed position before failure was 42, restart from 42. Do not generalize that real logs always have gapless offsets.
- Distinguish Kafka transactions from atomic updates to an external database. Do not claim that Kafka configuration alone makes arbitrary external effects execute exactly once.
- Distinguish partition-local ordering from topic-wide ordering. State the partition-count and partitioner assumptions when explaining identical-key placement.
- In the basic consumer-group model, assign each partition to one consumer within a group. Do not mix different consumption models.
- Separate consumption from retention. Also distinguish retention from compaction.
- State the assumptions and settings used to model replication and acknowledgments.
- Model the atomic relationship between storing a deduplication key and applying a business change in an external database. Do not imply that an in-memory Set alone guarantees durable duplicate protection.

Verify core concepts against official documentation. When explaining version-dependent behavior or defaults, record the Kafka reference version selected at implementation time and use documentation for that version. Do not label a version as “latest” without checking.

Starting references:

- [KafkaConsumer API — offsets and commits](https://downloads.apache.org/kafka/4.2.1/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html)
- [Apache Kafka official design documentation source](https://github.com/apache/kafka/blob/trunk/docs/design/design.md)

These links do not establish the project's reference version. Since trunk documentation can change, record the applicable version or commit and verification date with content references.

## 7. UX and Visual Design

- Give readable explanations and educational visualizations the most space.
- On desktop, provide a learning roadmap, main content, and an optional chapter table of contents. Do not require a three-column layout.
- On mobile, collapse the roadmap and arrange content and exercises vertically.
- Reveal concepts and controls progressively.
- Use natural page scrolling for explanations. Minimize nested scrolling inside small cards.
- Make the current chapter, lesson, prerequisites, and next learning destination clear.
- The existing demo's dark theme is a reference, not a requirement. Prioritize readability and consistency.
- Distinguish event states using text or icons as well as color.
- Support completion of core exercises using a keyboard. Provide buttons or selection menus as alternatives to dragging.
- Support `prefers-reduced-motion` and provide animation-pause controls.
- Announce important state changes to screen readers without continuously reading the entire rapidly updating log.
- The first release must not contain empty links, nonfunctional primary buttons, or fabricated user information.

## 8. Implementation Architecture — Proposed Defaults

### 8.1 Technology Stack

For a new repository, use TypeScript, React, and Vite as the default. Do not automatically rewrite an existing project if its static frontend architecture already meets the requirements.

- TypeScript strict mode.
- Content separated from UI using typed data, validated MDX, or an equivalent approach.
- SVG/CSS visualizations first; Canvas only when needed.
- A simulation core based on pure functions.
- Unit tests such as Vitest for core rules and browser tests such as Playwright for essential user flows.
- Learning progress stored in localStorage as a small, schema-versioned JSON payload.
- A static build with no runtime secrets or always-on server.

Check package compatibility in the implementation environment and pin versions through a lockfile. Do not grow the project into one enormous HTML file.

### 8.2 Separation of Responsibilities

| Area | Responsibility |
| --- | --- |
| curriculum | Chapter and lesson order, prerequisites, and learning objectives. |
| content | Explanations, examples, misconceptions, summaries, and references. |
| simulation/core | State, events, time, and state transitions. |
| simulation/scenarios | Initial conditions, permitted actions, and failure schedules. |
| assessment | Objective validation, failure reasons, and hints. |
| components | Explanation, log, control, and visualization UI. |
| persistence | Progress storage, schema versions, recovery, and reset. |

Prefer an explicit transition interface such as `step(state, action)` that produces the next state and emitted events. Keep domain rules out of scattered UI handlers and rendering timers. Playback speed may change presentation and progression speed, but must not change outcome rules.

Include a schema version in persisted data. The site must still open when stored data is corrupted or outdated. If storage is unavailable, continue learning with in-memory state and explain that progress may not persist. Do not describe local progress as synchronized across accounts or devices.

## 9. Development Milestones and Acceptance Criteria

### M0. Repository Review and Foundation

- Review existing code, development instructions, runtime environment, and reference material.
- Determine whether this is a new project or an extension of an existing one.
- Document the selected stack, routing strategy, content structure, and simulation assumptions.
- Add goals, local execution, build instructions, and milestones to the README.

Acceptance criteria: A minimal runnable application and supporting documentation exist, and the structure needed for the first chapter is defined.

### M1. Complete the First Chapter End to End

- Implement the home page, curriculum view, and detailed first-chapter explanations.
- Implement an independent-consumption experiment using order events and a chapter-end mission.
- Connect feedback, hints, wrap-up content, actual progress tracking, and restoration after refresh.
- Verify mobile and keyboard interaction.

Acceptance criteria: A learner with no Kafka knowledge can read the explanations, make meaningful configuration choices, understand the exercise results, and complete the chapter without installation. A screen listing all chapter titles does not satisfy M1.

### M2. Expand Core Behavior

- Implement Chapters 2–5.
- Add partitions, keys, groups, read positions, and committed positions to the model.
- Generate visuals and assessment results from the same engine state.

Acceptance criteria: Verify per-key ordering, independent processing across groups, partition assignment, and restart positions through scenarios and tests.

### M3. Reliability and Failure Handling

- Implement Chapters 6–8.
- Add replication, failure, duplicate-processing, retry, and backlog models only to the extent required by the learning objectives.
- Rebuild the existing duplicate-processing demo with accurate offset and database-atomicity models.

Acceptance criteria: Failure timing and policy changes produce different outcomes, and the application explains causes and guarantee boundaries.

### M4. Capstone and Public Release Preparation

- Implement Chapters 9–10 and the capstone simulation.
- Complete references, glossary, project introduction, and model-limitations documentation.
- Complete build/test automation and static-deployment configuration.
- Document code and asset provenance and licensing. Apply the project license after the owner selects it.

Acceptance criteria: The full learning path can be completed in order, core scenarios are reproducible, and navigation and exercises work on static hosting.

## 10. Verification Criteria

Test domain rules and user-important flows. Avoid accumulating tests that merely duplicate style values or internal implementation details.

Required verification cases:

1. Pause, single-step, and reset behave consistently.
2. Identical initial state, inputs, and seed produce identical results.
3. Partition-local ordering and group assignment rules hold.
4. Restart behavior correctly reflects differences between read and committed positions.
5. A failure after database persistence but before offset commit causes repeated processing attempts.
6. Atomic duplicate protection keeps the business effect at one despite retries.
7. Invalid configurations explain their failures, while alternative valid configurations pass.
8. Progress survives refresh, and corrupted storage does not prevent the app from opening.
9. Core learning activities can be completed with reduced motion and keyboard controls.
10. Assets, chapter navigation, direct links, and refresh work under a static deployment's subpath.

Report executed tests separately from tests that could not be run. Do not claim to have verified browsers or deployment environments that were not actually inspected.

## 11. Deployment and Public Documentation

The initial deliverable is a set of static files suitable for GitHub Pages. Verify repository-name subpaths, routing, and refresh behavior. Choose an appropriate method, such as hash routing or statically generated routes, and document the reason.

Developers may need Node.js, but learners must not need Node.js, Kafka, or Docker. Do not add AWS infrastructure before there is a concrete server-side requirement and a cost justification.

Include the following in the README and project introduction:

- Intended audience and the learning problem the project addresses.
- Main educational features and instructions for running the demo.
- Simulator design and differences from actual Kafka.
- Testing and accessibility-verification methods.
- Technical decisions documented during development and remaining limitations.
- References, contribution instructions, and licensing status.

The goal is public open-source distribution, but do not select a license arbitrarily. Avoid wording that implies this is an official Apache Kafka service or an endorsed project.

## 12. Codex Working Instructions

1. Read the repository's existing instructions and code, then summarize its current state.
2. Implement the assigned milestone according to this document's confirmed requirements.
3. Make routine implementation decisions, record the reasoning, and continue. Do not reduce the agreed educational scope arbitrarily.
4. Complete a feature through explanation, interaction, exercise, feedback, and verification before expanding it.
5. Unless the user specifies another scope, the initial assignment is M0 and M1. State the resulting status and next milestone afterward.
6. Preserve existing changes and avoid rewriting unrelated files.
7. Correct educational inaccuracies discovered during implementation and document the evidence.
8. Adding real Kafka connectivity, paid services, authentication, or a new deployment scope is not a routine implementation choice.
9. Completion reports must include implemented behavior, execution and inspection instructions, verification results, remaining constraints, and next steps.
10. “Complete” labels in documentation and UI must reflect actual implementation and verification status.

## 13. Initial Task Prompt for Codex

> Use this document as the product and development specification for Kafka Learning Lab. First inspect the repository and its existing instructions, and assess whether existing code can be reused. The initial scope is M0 and M1. Use English for all website UI, educational content, exercises, feedback, project documentation, and code comments. For learners with no prior Kafka knowledge, implement an end-to-end experience connecting substantial explanations, state-based interactions, and a chapter-end mission that validates requirements. Prioritize making the first chapter genuinely usable for learning over creating empty screens for every chapter. Browser exercises must require no installation or server, and the project must retain a static architecture suitable for GitHub Pages. Make routine implementation decisions with documented reasoning. When finished, report how to run the project, verification results, and remaining limitations.
