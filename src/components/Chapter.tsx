import { Theme, useTheme } from "@astryxdesign/core/theme";
import { kafkaReadingTheme } from "../themes/kafka-reading.js";
import "../themes/reading.css";
import { ChapterButton } from "./ChapterButton";
import { Text } from "@astryxdesign/core/Text";
import { Heading } from "@astryxdesign/core/Heading";
import { Section } from "@astryxdesign/core/Section";
import { Button } from "@astryxdesign/core/Button";
import { ChapterOverview } from "./ChapterOverview";
import { HStack } from "@astryxdesign/core/HStack";
import { VStack } from "@astryxdesign/core/VStack";
import { Selector } from "@astryxdesign/core/Selector";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import { LessonParagraph } from "./LessonParagraph";
import { useEffect, useState } from "react";
import { hints, lesson, ui } from "../content/course";
import { initialState, isSettled, step, type Mode } from "../simulation/core";
import { assess, type Result } from "../assessment/mission";
import { complete, type Progress } from "../persistence/progress";
import { Simulation } from "./Simulation";
import { localJump } from "./navigation";
import { lessonVisuals } from "./LessonVisuals";
import { ConceptReview } from "./ConceptReview";
import { RuntimeMap } from "./RuntimeMap";
import { TransferLab } from "./TransferLab";

export function Chapter({
  progress,
  update,
}: {
  progress: Progress;
  update: React.Dispatch<React.SetStateAction<Progress>>;
}) {
  const appearance = useTheme();
  const [mode, setMode] = useState<Mode>("direct");
  const [state, setState] = useState(() => initialState("direct"));
  const [playing, setPlaying] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [choice, setChoice] = useState<Mode>("direct");
  const [result, setResult] = useState<Result | null>(null);
  const [hint, setHint] = useState(0);
  const [announcement, setAnnouncement] = useState(
    "Ready. Choose a prediction, then advance the simulation.",
  );
  const settled = isSettled(state);
  const [activeSection, setActiveSection] = useState("chapter-intro");
  useEffect(() => {
    const sections = ["chapter-intro", "experiment", "mission", "wrap-up"]
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));
    let frame = 0;
    const syncSection = () => {
      const readingLine = Math.min(160, window.innerHeight / 4);
      const current = sections
        .filter((section) => section.getBoundingClientRect().top <= readingLine)
        .at(-1);
      setActiveSection(current?.id ?? "chapter-intro");
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncSection);
    };
    syncSection();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setState((s) => step(s, { type: "step" })),
      950,
    );
    return () => clearInterval(timer);
  }, [playing]);
  useEffect(() => {
    if (settled && playing) {
      setPlaying(false);
      setAnnouncement("Playback finished. Review the event results.");
    }
  }, [settled, playing]);
  useEffect(() => {
    if (
      state.orders.length >= 3 &&
      state.outageOrders.length > 0 &&
      !state.analyticsPaused &&
      (mode === "direct" || state.analytics.length === state.orders.length)
    )
      update((p) =>
        p.experiments.includes(mode)
          ? p
          : { ...p, experiments: [...p.experiments, mode] },
      );
  }, [state, mode, update]);
  function reset(nextMode = mode) {
    setPlaying(false);
    setMode(nextMode);
    setState(initialState(nextMode));
    setAnnouncement("Simulation reset. All event counts are zero.");
  }
  function advance() {
    setState((s) => step(s, { type: "step" }));
    setAnnouncement(
      "Advanced one step. Updated counts and event outcomes are shown below.",
    );
  }
  function testMission() {
    const next = assess(choice);
    setResult(next);
    update((p) => ({
      ...p,
      attempts: p.attempts + 1,
      missionPassed: p.missionPassed || next.passed,
    }));
  }
  return (
    <Theme theme={kafkaReadingTheme} mode={appearance.mode}>
      <HStack
        className="astryx-chapter-one"
        gap={8}
        padding={8}
        wrap="wrap"
        vAlign="start"
        hAlign="center"
        maxWidth="84rem"
      >
        <VStack
          as="aside"
          className="chapter-nav"
          gap={3}
          width="var(--chapter-nav-width)"
        >
          <a href="#/roadmap">← All chapters</a>
          <Text as="p" type="supporting" className="eyebrow">
            CHAPTER 01
          </Text>
          <strong>Events and why Kafka exists</strong>
          <VStack as="nav" gap={1} aria-label="Chapter contents">
            <a
              href="#chapter-intro"
              aria-current={
                activeSection === "chapter-intro" ? "location" : undefined
              }
              onClick={(e) => {
                localJump(e);
                setActiveSection("chapter-intro");
              }}
            >
              01 · The problem
            </a>
            <a
              href="#experiment"
              aria-current={
                activeSection === "experiment" ? "location" : undefined
              }
              onClick={(e) => {
                localJump(e);
                setActiveSection("experiment");
              }}
            >
              02 · Try it yourself
            </a>
            <a
              href="#mission"
              aria-current={
                activeSection === "mission" ? "location" : undefined
              }
              onClick={(e) => {
                localJump(e);
                setActiveSection("mission");
              }}
            >
              03 · Your mission
            </a>
            <a
              href="#wrap-up"
              aria-current={
                activeSection === "wrap-up" ? "location" : undefined
              }
              onClick={(e) => {
                localJump(e);
                setActiveSection("wrap-up");
              }}
            >
              04 · Reflect & connect
            </a>
          </VStack>
          <VStack className="progress-panel" gap={2}>
            <Text as="p" type="supporting">
              On this device
            </Text>
            <Text type="supporting" display="block">
              {progress.viewed ? "✓" : "○"} Chapter opened
            </Text>
            <Text type="supporting" display="block">
              {progress.experiments.length} / 2 models tried
            </Text>
            <Text type="supporting" display="block">
              {progress.attempts} mission attempts
            </Text>
            <Text type="supporting" display="block">
              {progress.missionPassed
                ? "✓ Mission passed"
                : "○ Mission not passed"}
            </Text>
            <strong>
              {complete(progress) ? "Chapter complete" : "Learning in progress"}
            </strong>
          </VStack>
        </VStack>
        <VStack
          as="article"
          className="chapter-body"
          gap={10}
          width="min(100%, 58rem)"
        >
          <VStack as="section" gap={8} id="chapter-intro">
            <HStack
              className="chapter-opening"
              gap={8}
              wrap="wrap"
              vAlign="start"
            >
              <VStack className="chapter-heading" gap={5}>
                <Text as="p" type="supporting" className="eyebrow">
                  CHAPTER 01 / FIRST PRINCIPLES
                </Text>
                <Heading level={1}>Events and why Kafka exists.</Heading>
                <Text as="p" type="large" className="lede">
                  An order is placed. Two services need to know. What should
                  happen if one stops?
                </Text>
                <Button
                  label="Jump to experiment"
                  size="lg"
                  variant="primary"
                  href="#experiment"
                  onClick={localJump}
                />
              </VStack>
              <VStack className="learning-goals" gap={4}>
                <Section padding={5}>
                  <VStack gap={4}>
                    <Text type="label">You will learn to</Text>
                    <ul>
                      <li>
                        Identify events, producers, topics, and consumers.
                      </li>
                      <li>
                        Explain asynchronous work and independent reading.
                      </li>
                      <li>
                        Choose a design that keeps records for a recovering
                        reader.
                      </li>
                    </ul>
                    <Text as="p" type="supporting">
                      Prerequisites: none. New to a term? Open the{" "}
                      <a href="#/glossary">glossary</a>.
                    </Text>
                  </VStack>
                </Section>
              </VStack>
            </HStack>
            <ChapterOverview />
            <RuntimeMap />
            {lesson.map((section, index) => (
              <VStack
                as="section"
                gap={5}
                className="reading-section"
                key={section.title}
              >
                <Text type="supporting" className="lesson-index">
                  01.{String(index + 1).padStart(2, "0")} / CONCEPT
                </Text>
                <Heading level={2}>{section.title}</Heading>
                {section.paragraphs.map((p) => (
                  <LessonParagraph key={p} text={p} themed />
                ))}
                {(() => {
                  const Visual = lessonVisuals[index];
                  return Visual ? <Visual /> : null;
                })()}
              </VStack>
            ))}
          </VStack>
          <VStack
            as="section"
            gap={5}
            id="experiment"
            className="experiment-section"
          >
            <Text as="p" type="supporting" className="eyebrow">
              PREDICT → OBSERVE → EXPLAIN
            </Text>
            <Heading level={2}>
              Can one reader stop without stopping the other?
            </Heading>
            <Text as="p" type="body">
              Before running: predict what happens to orders sent while
              analytics is paused. Then try both models, pause analytics,
              advance three steps, resume it, and keep stepping. Six orders are
              produced; extra steps let a recovering reader drain its backlog.
            </Text>
            <VStack gap={6} className="lab-workspace">
              <HStack
                className="lab-workspace-heading"
                gap={3}
                hAlign="between"
                wrap="wrap"
              >
                <Text type="label">Order delivery experiment</Text>
                <Text type="supporting">6 events · 2 independent readers</Text>
              </HStack>
              <VStack gap={6} className="lab-controls">
                <HStack
                  gap={5}
                  wrap="wrap"
                  vAlign="start"
                  className="experiment-settings"
                >
                  <VStack gap={2} className="prediction-field">
                    <Selector
                      label="Your prediction"
                      placeholder="Choose a prediction"
                      width="100%"
                      value={prediction}
                      onChange={setPrediction}
                      renderValue={(option) => (
                        <Text type="label" textWrap="wrap" maxLines={0}>
                          {option.label}
                        </Text>
                      )}
                      options={[
                        {
                          value: "both",
                          label: "Both models recover every analytics event",
                        },
                        {
                          value: "log",
                          label:
                            "Only the retained log recovers missed events in this model",
                        },
                        {
                          value: "neither",
                          label: "Neither model lets notifications continue",
                        },
                      ]}
                    />
                  </VStack>
                  <VStack gap={2} className="delivery-model-field">
                    <Text as="p" type="label" className="field-label">
                      Delivery model
                    </Text>
                    <SegmentedControl
                      label="Delivery model (changing it resets the experiment)"
                      value={mode}
                      onChange={(value) => reset(value as Mode)}
                      layout="fill"
                    >
                      <SegmentedControlItem
                        value="direct"
                        label="Direct delivery"
                      />
                      <SegmentedControlItem value="log" label="Retained log" />
                    </SegmentedControl>
                    <Text as="p" type="supporting" className="caption">
                      Changing the model resets the experiment. Direct delivery
                      has no retry storage; the log provides independent
                      subscriptions.
                    </Text>
                  </VStack>
                </HStack>
                <HStack className="chapter-actions" gap={3} wrap="wrap">
                  <ChapterButton
                    className="primary"
                    disabled={!prediction || settled}
                    title={
                      !prediction
                        ? "Choose a prediction first"
                        : settled
                          ? "Reset to run again"
                          : undefined
                    }
                    onClick={() => {
                      setPlaying((p) => !p);
                      setAnnouncement(
                        playing ? "Playback paused." : "Playback started.",
                      );
                    }}
                  >
                    {playing ? "Pause playback" : "Start playback"}
                  </ChapterButton>
                  <ChapterButton
                    disabled={playing || !prediction || settled}
                    onClick={advance}
                  >
                    Single step
                  </ChapterButton>
                  <ChapterButton onClick={() => reset()}>
                    Reset experiment
                  </ChapterButton>
                  <ChapterButton
                    aria-pressed={state.analyticsPaused}
                    onClick={() => {
                      setState((s) =>
                        step(s, {
                          type: "analytics",
                          paused: !s.analyticsPaused,
                        }),
                      );
                      setAnnouncement(
                        state.analyticsPaused
                          ? "Analytics resumed. Advance steps to process pending events."
                          : "Analytics paused. Notifications remain active.",
                      );
                    }}
                  >
                    {state.analyticsPaused
                      ? "Resume analytics"
                      : "Pause analytics"}
                  </ChapterButton>
                </HStack>
                {!prediction && (
                  <Text as="p" type="supporting" className="muted">
                    Choose a prediction to enable playback and single-step
                    controls.
                  </Text>
                )}
              </VStack>
              <HStack
                className="lab-observation"
                gap={6}
                wrap="wrap"
                vAlign="start"
              >
                <VStack className="lab-state" gap={3}>
                  <Simulation state={state} />
                </VStack>
                <VStack
                  gap={3}
                  className="chapter-explanation"
                  aria-label="Experiment step explanation"
                >
                  <Text type="supporting" className="eyebrow">
                    OBSERVATION NOTES
                  </Text>
                  <Text as="p" type="label" className="field-label">
                    Current step
                  </Text>
                  <Text
                    as="p"
                    type="body"
                    role="status"
                    className="chapter-step-note"
                  >
                    {state.tick === 0
                      ? announcement
                      : state.history[state.history.length - 1]}
                  </Text>
                  <Text as="p" type="label" className="field-label">
                    What to observe
                  </Text>
                  <Text as="p" type="body">
                    {mode === "log"
                      ? "Records stay in the log after notifications read them. Pausing analytics increases its pending count; resuming and stepping lets it catch up."
                      : "Notifications continue independently. If analytics is paused, direct delivery misses its events because this model has no durable retry storage."}
                  </Text>
                  <Text as="p" type="supporting" className="caption">
                    {state.tick < 2
                      ? "Advance the experiment to compare your prediction with the event outcomes."
                      : prediction === "log"
                        ? "Your prediction matches the model."
                        : "Revisit your prediction: the retained log preserves events for the paused reader; direct delivery here does not."}
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            <Text as="p" type="supporting" className="caption">
              {ui.assumptions} To record an experiment, produce at least three
              orders, including one while analytics is paused, then resume
              analytics. In the retained-log model, also step until analytics
              has caught up. Attempts alone do not complete the chapter.
            </Text>
          </VStack>
          <VStack as="section" gap={5} id="mission">
            <Text as="p" type="supporting" className="eyebrow">
              APPLY WHAT YOU LEARNED
            </Text>
            <Heading level={2}>{ui.mission}</Heading>
            <Text as="p" type="body">
              {ui.scenario}
            </Text>
            <Text as="p" type="body">
              Use what you learned about producers, retained events, and
              independent readers. The test starts fresh: pause analytics,
              produce three orders, resume analytics, then produce the rest and
              allow enough steps to catch up.
            </Text>
            <VStack gap={2}>
              <Text as="p" type="label" className="field-label">
                Your design
              </Text>
              <SegmentedControl
                label="Your design"
                value={choice}
                onChange={(value) => {
                  setChoice(value as Mode);
                  setResult(null);
                }}
                layout="fill"
              >
                <SegmentedControlItem value="direct" label="Direct delivery" />
                <SegmentedControlItem value="log" label="Retained log" />
              </SegmentedControl>
              <Text as="p" type="supporting" className="caption">
                Choose direct delivery without retry storage or a retained log
                with independent subscriptions.
              </Text>
            </VStack>
            <HStack className="chapter-actions" gap={3} wrap="wrap">
              <ChapterButton className="primary" onClick={testMission}>
                Validate design
              </ChapterButton>
              <ChapterButton
                disabled={hint === hints.length}
                onClick={() => setHint((h) => h + 1)}
              >
                Show hint ({hint}/{hints.length})
              </ChapterButton>
              <ChapterButton
                onClick={() => {
                  setResult(null);
                  setHint(0);
                }}
              >
                Retry mission
              </ChapterButton>
            </HStack>
            {hints.slice(0, hint).map((h, i) => (
              <Text as="p" type="body" className="hint" key={h}>
                Hint {i + 1}: {h}
              </Text>
            ))}
            <VStack aria-live="polite">
              {result && (
                <VStack
                  className={`feedback ${result.passed ? "success" : "partial"}`}
                >
                  <Heading level={3}>
                    {result.passed
                      ? "Requirements met"
                      : "One requirement still needs work"}
                  </Heading>
                  <ul>
                    <li>
                      {result.continuity ? "PASS" : "FAIL"} · All first three
                      notifications delivered during the analytics outage.
                    </li>
                    <li>
                      {result.recovery ? "PASS" : "FAIL"} · Analytics processed{" "}
                      {result.state.analytics.length}/6 events after recovery.
                    </li>
                  </ul>
                  <Text as="p" type="body">
                    {result.feedback}
                  </Text>
                </VStack>
              )}
            </VStack>
            {result && (
              <>
                <Simulation state={result.state} />
                <details>
                  <summary>Reference design & trade-offs</summary>
                  <Text as="p" type="body">
                    The retained event log meets both requirements under this
                    model’s assumptions. Independent subscriptions prevent
                    readers sharing the work intended for both. A production
                    design would also need a suitable retention policy and error
                    handling. Durable retries could make a different design
                    valid, but are outside these two configurations. The
                    assessment grades delivery outcomes, not a click sequence.
                  </Text>
                </details>
              </>
            )}
          </VStack>
          <VStack as="section" gap={5} id="wrap-up">
            <Text as="p" type="supporting" className="eyebrow">
              REFLECT & CONNECT
            </Text>
            <Heading level={2}>
              The record and the reaction are different things.
            </Heading>
            <Text as="p" type="body">
              An event captures a fact. Keeping that fact lets independent
              readers process it at different times. A successful write is not
              proof that every consumer has completed its work, and reading does
              not erase a retained event.
            </Text>
            <TransferLab progress={progress} update={update} />
            <ConceptReview progress={progress} update={update} />
            <VStack className="callout" gap={5}>
              <Heading level={3}>
                {complete(progress)
                  ? "Chapter 1 complete"
                  : "Your chapter checklist"}
              </Heading>
              <Text as="p" type="body">
                {progress.experiments.length}/2 experiment models tried ·{" "}
                {progress.missionPassed
                  ? "Mission passed"
                  : "Mission still to pass"}
              </Text>
              <Text as="p" type="body">
                Completion requires both experiments and a passing mission.
                Reading or pressing a single button does not complete this
                chapter.
              </Text>
              <Text as="p" type="body">
                Next: Chapter 2 unpacks the event log—records, partition-local
                offsets, replay, and retention. Reading positions are introduced
                there; commits and restart behavior are reserved for Chapter 5.
              </Text>
              <Button
                label="Continue to chapter 2 →"
                href="#/chapter/2"
                variant="primary"
              />
              <Text as="p" type="body">
                <a href="#/roadmap">View the learning roadmap →</a>
              </Text>
            </VStack>
          </VStack>
        </VStack>
      </HStack>
    </Theme>
  );
}
