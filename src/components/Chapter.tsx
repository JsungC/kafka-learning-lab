import { useEffect, useState } from "react";
import { hints, lesson, questions, ui } from "../content/course";
import { initialState, isSettled, step, type Mode } from "../simulation/core";
import { assess, type Result } from "../assessment/mission";
import { complete, type Progress } from "../persistence/progress";
import { Simulation } from "./Simulation";
import { localJump } from "./navigation";

export function Chapter({
  progress,
  update,
}: {
  progress: Progress;
  update: React.Dispatch<React.SetStateAction<Progress>>;
}) {
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
  const [self, setSelf] = useState<string[]>([]);
  const settled = isSettled(state);
  const [activeSection, setActiveSection] = useState("chapter-intro");
  useEffect(() => {
    const sections = ["chapter-intro", "experiment", "mission", "wrap-up"]
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "0px 0px -65% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
    <div className="chapter-layout">
      <aside className="chapter-nav">
        <a href="#/roadmap">← All chapters</a>
        <p className="eyebrow">CHAPTER 01</p>
        <strong>Events and why Kafka exists</strong>
        <nav aria-label="Chapter contents">
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
            aria-current={activeSection === "mission" ? "location" : undefined}
            onClick={(e) => {
              localJump(e);
              setActiveSection("mission");
            }}
          >
            03 · Your mission
          </a>
          <a
            href="#wrap-up"
            aria-current={activeSection === "wrap-up" ? "location" : undefined}
            onClick={(e) => {
              localJump(e);
              setActiveSection("wrap-up");
            }}
          >
            04 · Reflect & connect
          </a>
        </nav>
        <div className="progress-panel">
          <p>On this device</p>
          <span>{progress.viewed ? "✓" : "○"} Chapter opened</span>
          <span>{progress.experiments.length} / 2 models tried</span>
          <span>{progress.attempts} mission attempts</span>
          <span>
            {progress.missionPassed
              ? "✓ Mission passed"
              : "○ Mission not passed"}
          </span>
          <strong>
            {complete(progress) ? "Chapter complete" : "Learning in progress"}
          </strong>
        </div>
      </aside>
      <article className="chapter-body">
        <section id="chapter-intro">
          <p className="eyebrow">CHAPTER 01 / FIRST PRINCIPLES</p>
          <h1>
            Events and why
            <br />
            Kafka exists.
          </h1>
          <p className="lede">
            An order is placed. Two services need to know. What should happen if
            one stops?
          </p>
          <div className="learning-goals">
            <strong>You will learn to</strong>
            <ul>
              <li>Identify events, producers, topics, and consumers.</li>
              <li>Explain asynchronous work and independent reading.</li>
              <li>
                Choose a design that keeps records for a recovering reader.
              </li>
            </ul>
            <p>
              Prerequisites: none. New to a term? Open the{" "}
              <a href="#/glossary">glossary</a>.
            </p>
          </div>
          {lesson.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          ))}
        </section>
        <section id="experiment" className="experiment-section">
          <p className="eyebrow">PREDICT → OBSERVE → EXPLAIN</p>
          <h2>Can one reader stop without stopping the other?</h2>
          <p>
            Before running: predict what happens to orders sent while analytics
            is paused. Then try both models, pause analytics, advance three
            steps, resume it, and keep stepping. Six orders are produced; extra
            steps let a recovering reader drain its backlog.
          </p>
          <label htmlFor="prediction">Your prediction</label>
          <select
            id="prediction"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
          >
            <option value="">Choose a prediction</option>
            <option value="both">
              Both models recover every analytics event
            </option>
            <option value="log">
              Only the retained log recovers missed events in this model
            </option>
            <option value="neither">
              Neither model lets notifications continue
            </option>
          </select>
          <label htmlFor="model">
            Delivery model (changing it resets the experiment)
          </label>
          <select
            id="model"
            value={mode}
            onChange={(e) => reset(e.target.value as Mode)}
          >
            <option value="direct">Direct delivery · no retry storage</option>
            <option value="log">
              Retained event log · independent subscriptions
            </option>
          </select>
          <div className="controls">
            <button
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
            </button>
            <button
              disabled={playing || !prediction || settled}
              onClick={advance}
            >
              Single step
            </button>
            <button onClick={() => reset()}>Reset experiment</button>
            <button
              aria-pressed={state.analyticsPaused}
              onClick={() => {
                setState((s) =>
                  step(s, { type: "analytics", paused: !s.analyticsPaused }),
                );
                setAnnouncement(
                  state.analyticsPaused
                    ? "Analytics resumed. Advance steps to process pending events."
                    : "Analytics paused. Notifications remain active.",
                );
              }}
            >
              {state.analyticsPaused ? "Resume analytics" : "Pause analytics"}
            </button>
          </div>
          {!prediction && (
            <p className="muted">
              Choose a prediction to enable playback and single-step controls.
            </p>
          )}
          <p className="status" role="status">
            {announcement}
          </p>
          <Simulation state={state} />
          {state.tick >= 2 && (
            <div className="feedback">
              <strong>What changed?</strong>
              <p>
                {mode === "log"
                  ? "Records stay in the log after notifications read them. Pausing analytics increases its pending count; resuming and stepping lets it catch up."
                  : "Notifications continue independently. If analytics is paused, direct delivery misses its events because this model has no durable retry storage."}
              </p>
              <p>
                {prediction === "log"
                  ? "Your prediction matches the model."
                  : "Revisit your prediction: the retained log preserves events for the paused reader; direct delivery here does not."}
              </p>
            </div>
          )}
          <p className="caption">
            {ui.assumptions} To record an experiment, produce at least three
            orders, including one while analytics is paused, then resume
            analytics. In the retained-log model, also step until analytics has
            caught up. Attempts alone do not complete the chapter.
          </p>
        </section>
        <section id="mission">
          <p className="eyebrow">APPLY WHAT YOU LEARNED</p>
          <h2>{ui.mission}</h2>
          <p>{ui.scenario}</p>
          <p>
            Use what you learned about producers, retained events, and
            independent readers. The test starts fresh: pause analytics, produce
            three orders, resume analytics, then produce the rest and allow
            enough steps to catch up.
          </p>
          <label htmlFor="mission-choice">Your design</label>
          <select
            id="mission-choice"
            value={choice}
            onChange={(e) => {
              setChoice(e.target.value as Mode);
              setResult(null);
            }}
          >
            <option value="direct">
              Direct delivery without retry storage
            </option>
            <option value="log">
              Retained event log with independent subscriptions
            </option>
          </select>
          <div className="controls">
            <button className="primary" onClick={testMission}>
              Validate design
            </button>
            <button
              disabled={hint === hints.length}
              onClick={() => setHint((h) => h + 1)}
            >
              Show hint ({hint}/{hints.length})
            </button>
            <button
              onClick={() => {
                setResult(null);
                setHint(0);
              }}
            >
              Retry mission
            </button>
          </div>
          {hints.slice(0, hint).map((h, i) => (
            <p className="hint" key={h}>
              Hint {i + 1}: {h}
            </p>
          ))}
          <div aria-live="polite">
            {result && (
              <div
                className={`feedback ${result.passed ? "success" : "partial"}`}
              >
                <h3>
                  {result.passed
                    ? "Requirements met"
                    : "One requirement still needs work"}
                </h3>
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
                <p>{result.feedback}</p>
              </div>
            )}
          </div>
          {result && (
            <>
              <Simulation state={result.state} />
              <details>
                <summary>Reference design & trade-offs</summary>
                <p>
                  The retained event log meets both requirements under this
                  model’s assumptions. Independent subscriptions prevent readers
                  sharing the work intended for both. A production design would
                  also need a suitable retention policy and error handling.
                  Durable retries could make a different design valid, but are
                  outside these two configurations. The assessment grades
                  delivery outcomes, not a click sequence.
                </p>
              </details>
            </>
          )}
        </section>
        <section id="wrap-up">
          <p className="eyebrow">REFLECT & CONNECT</p>
          <h2>The record and the reaction are different things.</h2>
          <p>
            An event captures a fact. Keeping that fact lets independent readers
            process it at different times. A successful write is not proof that
            every consumer has completed its work, and reading does not erase a
            retained event.
          </p>
          <p>
            Explain these ideas in your own words, then compare with the model
            explanations. This self-check is for reflection; it is not
            automatically graded.
          </p>
          {questions.map(([q, answer]) => (
            <div className="reflection" key={q}>
              <label>
                {q}
                <textarea
                  placeholder="Your explanation (not saved or graded)"
                  rows={3}
                />
              </label>
              <details>
                <summary>Compare with a model explanation</summary>
                <p>{answer}</p>
              </details>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={self.includes(q)}
                  onChange={(e) =>
                    setSelf((s) =>
                      e.target.checked ? [...s, q] : s.filter((x) => x !== q),
                    )
                  }
                />{" "}
                I can explain this principle.
              </label>
            </div>
          ))}
          <div className="callout">
            <h3>
              {complete(progress)
                ? "Chapter 1 complete"
                : "Your chapter checklist"}
            </h3>
            <p>
              {progress.experiments.length}/2 experiment models tried ·{" "}
              {progress.missionPassed
                ? "Mission passed"
                : "Mission still to pass"}
            </p>
            <p>
              Completion requires both experiments and a passing mission.
              Reading or pressing a single button does not complete this
              chapter.
            </p>
            <p>
              Next: Chapter 2 will unpack the event log—records, offsets,
              partitions, and retention. It is planned and not yet a lesson.
            </p>
            <a href="#/roadmap">View the learning roadmap →</a>
          </div>
        </section>
      </article>
    </div>
  );
}
