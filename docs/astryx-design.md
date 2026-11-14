# Astryx: Chapter 1 design

Chapter 1 uses Astryx 0.7.15 components and a reading theme derived from Stone. The other chapters retain their existing components. Shared theme initialization follows the existing saved/system appearance preference; the Chapter 1 header uses Stone while other routes retain their original foundation. The small icon-only toggle remains in the header.

## Learning priorities

- Keep all lesson text and selected semantic emphasis. Prioritize readable prose, natural scrolling, and clear heading levels.
- Separate prediction/configuration, actions, step explanation, and event state. The current-step message and interpretation share one consistent observation panel beside the state diagram on desktop and below it on narrow screens.
- Use a native semantic structure for educational diagrams. Use Astryx Button, Selector, SegmentedControl, RadioList, Text, Heading, HStack, and VStack for controls, typography, and UI layout.
- Use short complete model labels on mobile and wrap the selected hypothesis rather than hiding its meaning behind an ellipsis.
- Keep scenario state, assessment rules, saved progress, and reset behavior unchanged. A visual refresh does not change completion requirements.
- Preserve keyboard access, textual event states, reduced motion, light/dark modes, and the absence of promotional copy.

## Implementation

The official CLI initialized the managed Astryx guide in `AGENTS.md`; project-specific instructions explain the learning constraints and migration boundary. Use `npm run astryx -- component NAME` to inspect the installed APIs before changing components.

`src/astryx-themes.ts` is the CLI-generated Neutral and Stone theme registration. `src/themes/reading.ts` extends the official Stone theme with reading-oriented heading sizes and a system-font stack. `npm run astryx:theme` generates its production CSS and module; the normal build also performs this generation. Do not hand-edit generated theme files.

The optional Neutral and Stone font stylesheets normally fetch fonts from Google Fonts. Vite aliases supply a local empty stylesheet instead, deliberately using system-font fallbacks; the reading derivative explicitly uses system fonts. Browser tests assert that neither font service receives a request.

The existing stylesheet is a named lower-priority compatibility layer, and Chapter 1 refinements are scoped to `.astryx-chapter-one` and its Stone route shell and use public theme tokens. Scoped typography rules bridge legacy prose selectors to the same semantic theme tokens. The lesson frame and action rows use HStack; sections use VStack with gap props. Text and Heading own the migrated typography. A bounded reading surface separates the lesson from the navigation. Learning goals use Section; conceptual figures and independent recall exercises have their own surface boundaries. The opening pairs learning goals with the question and a compact event/reaction diagram. Long-form paragraphs use a 16px reading scale with a constrained line length. The experiment groups configuration and actions above an event-state area and a stable observation panel. Six fixed event slots preserve the layout during playback. Step explanations use actual simulation history rather than generic click acknowledgements. Four local anchor destinations remain semantic navigation; app-wide SideNav is unnecessary for these in-page links. Recall and transfer questions use RadioList, retaining their original feedback and persistence. Prose lists preserve their list semantics after the library reset. The library and theme remain MIT licensed; the Astryx license is included in `public/astryx-license.txt` for distribution.

Chapter 1 is lazy-loaded and the selector is split into its own component chunk. The library increases asset size relative to the previous custom controls; no claim of a performance improvement is made. The final production build has no oversized-chunk warning.

## Accent palette

The Stone-based reading theme defines two accent families with explicit light/dark values: restrained teal for primary actions, selected controls, navigation, and subtle key-sentence emphasis; amber for paused/warning states. Body copy and large reading surfaces remain neutral. Palette and component state colors are defined in `src/themes/reading.ts`; scoped CSS consumes those public tokens. Button labels explicitly inherit their control color so solid primary buttons keep the correct foreground.

## Verification

- Domain tests remain unchanged and passing: 36 tests.
- Chromium desktop/mobile suite: 32 tests, including complete lesson-prose presence, actual keyboard selection in Astryx controls, the mission, persisted progress, theme changes across routes, storage failure, and the existing Chapters 2–4 flows.
- `npm run build` and `npm run astryx -- doctor --built dist` succeed. Doctor reports zero failures and two related warnings about optional package font imports. These are intentionally not resolved by adding a remote font request; the tested system-font strategy is documented above.
- Actual before/after screenshots use Git HEAD source for the previous design and the local build for Astryx, with the same synthetic events and viewport conditions. No runtime errors, mobile overflow, or remote font requests were observed in that review.

## Branch preview

Pushes to `feat/chapter-1-stone-redesign` run `.github/workflows/preview.yml`. It builds the branch with the `/kafka-learning-lab/previews/chapter-1-stone/` base and builds `main` separately for the original site root. Both are uploaded as one GitHub Pages deployment, using the `github-pages-preview` environment. The production deploy workflow is unchanged.

Preview URL: https://jsungc.github.io/kafka-learning-lab/previews/chapter-1-stone/#/chapter/1

GitHub Pages has one deployment per repository. A subsequent production deployment from `main` replaces the combined deployment and removes this temporary preview; push another commit to the review branch to publish it again. The preview shares the site's origin and browser storage. Chromium verification does not imply cross-browser accessibility certification.
