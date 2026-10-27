import { useEffect, useState } from "react";
import { chapter2Lessons, logLabCopy } from "../content/chapter2";
import {
  initialLog,
  transitionLog,
  retainedCount,
  type LogAction,
} from "../simulation/log";
import { assessLog, type LogMissionResult } from "../assessment/logMission";
import {
  completeChapter2,
  emptyChapter2,
  type Progress,
  type Chapter2Progress,
} from "../persistence/progress";
import { localJump } from "./navigation";
import { LogView } from "./LogView";
import { OptionalPractice } from "./OptionalPractice";
export function ChapterTwo({
  progress,
  update,
}: {
  progress: Progress;
  update: React.Dispatch<React.SetStateAction<Progress>>;
}) {
  const saved = progress.chapter2 ?? emptyChapter2();
  const [partitions, setPartitions] = useState(1),
    [retention, setRetention] = useState(24),
    [selected, setSelected] = useState(0);
  const [state, setState] = useState(() => initialLog());
  const [prediction, setPrediction] = useState(""),
    [playing, setPlaying] = useState(false);
  const [missionRetention, setMissionRetention] = useState(3),
    [missionStart, setMissionStart] = useState<"earliest" | "end">("end");
  const [result, setResult] = useState<LogMissionResult | null>(null),
    [hint, setHint] = useState(0);
  function save(change: (p: Chapter2Progress) => Chapter2Progress) {
    update((p) => ({ ...p, chapter2: change(p.chapter2 ?? emptyChapter2()) }));
  }
  useEffect(() => {
    update((p) =>
      p.chapter2?.viewed
        ? p
        : {
            ...p,
            chapter2: { ...(p.chapter2 ?? emptyChapter2()), viewed: true },
          },
    );
  }, [update]);
  useEffect(() => {
    const replay = state.reads.some((r, i) =>
      state.reads
        .slice(0, i)
        .some(
          (old) => old.partition === r.partition && old.offset === r.offset,
        ),
    );
    const expiration = state.expired > 0;
    if (replay || expiration)
      update((p) => {
        const current = p.chapter2 ?? emptyChapter2();
        const experiments = [
          ...new Set([
            ...current.experiments,
            ...(replay ? ["replay"] : []),
            ...(expiration ? ["expiration"] : []),
          ]),
        ];
        return experiments.length === current.experiments.length
          ? p
          : { ...p, chapter2: { ...current, experiments } };
      });
  }, [state, update]);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () =>
        setState((s) =>
          transitionLog(
            s,
            s.produced < 6
              ? { type: "append", partition: 0 }
              : { type: "read", partition: 0 },
          ),
        ),
      900,
    );
    return () => clearInterval(timer);
  }, [playing]);
  useEffect(() => {
    if (playing && (state.reads.length >= 6 || state.tick >= 18))
      setPlaying(false);
  }, [state, playing]);
  function reset(count = partitions, window = retention) {
    setPlaying(false);
    setPartitions(count);
    setRetention(window);
    setSelected(0);
    setState(initialLog(count, window));
  }
  function act(action: LogAction) {
    setState((s) => transitionLog(s, action));
  }
  function validate() {
    const next = assessLog(missionRetention, missionStart);
    setResult(next);
    save((p) => ({
      ...p,
      attempts: p.attempts + 1,
      missionPassed: p.missionPassed || next.passed,
    }));
  }
  return (
    <div className="chapter-layout">
      <aside className="chapter-nav">
        <a href="#/roadmap">← All chapters</a>
        <p className="eyebrow">CHAPTER 02</p>
        <strong>Topics and event logs</strong>
        <nav aria-label="Chapter contents">
          {chapter2Lessons.map((l) => (
            <a key={l.id} href={`#log-${l.id}`} onClick={localJump}>
              {l.title}
            </a>
          ))}
          <a href="#log-lab" onClick={localJump}>
            Experiment · inspect & replay
          </a>
          <a href="#log-mission" onClick={localJump}>
            Mission · rebuild a report
          </a>
          <a href="#real-kafka" onClick={localJump}>
            Optional · real Kafka
          </a>
        </nav>
        <div className="progress-panel">
          <p>On this device</p>
          <span>✓ Chapter opened</span>
          <span>{saved.experiments.length}/2 experiments observed</span>
          <span>{saved.attempts} mission attempts</span>
          <span>
            {saved.missionPassed ? "✓ Mission passed" : "○ Mission not passed"}
          </span>
          <strong>
            {completeChapter2(saved)
              ? "Chapter complete"
              : "Learning in progress"}
          </strong>
        </div>
      </aside>
      <article className="chapter-body">
        <section>
          <p className="eyebrow">CHAPTER 02 / KEEP THE EVIDENCE</p>
          <h1>
            Topics and
            <br />
            event logs.
          </h1>
          <p className="lede">
            An order was processed. Can you still inspect it—and read it again
            tomorrow?
          </p>
          <div className="learning-goals">
            <strong>You will learn to</strong>
            <ul>
              <li>
                Distinguish a record’s key and value from its partition and
                offset.
              </li>
              <li>
                Read and replay retained records without confusing consumption
                with deletion.
              </li>
              <li>
                Choose a retention window and starting position for a recovery
                requirement.
              </li>
            </ul>
            <p>
              Prerequisite:{" "}
              <a href="#/chapter/1">events, producers, topics, and consumers</a>
              . Chapters are never locked by progress.
            </p>
          </div>
        </section>
        {chapter2Lessons.map((l, i) => (
          <section id={`log-${l.id}`} key={l.id}>
            <h2>{l.title}</h2>
            {l.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {i === 0 && (
              <figure className="lesson-visual">
                <span className="eyebrow">
                  ONE RECORD / DIFFERENT QUESTIONS
                </span>
                <div className="record-anatomy">
                  {[
                    [
                      "Business identity",
                      "order-001",
                      "What happened to which order?",
                    ],
                    ["Key", "customer-a", "Which customer does it concern?"],
                    [
                      "Stored location",
                      "orders / P0 / offset 0",
                      "Where is this record in the log?",
                    ],
                  ].map(([name, value, why]) => (
                    <div className="concept-node" key={name}>
                      <span className="concept-kicker">{name}</span>
                      <strong>{value}</strong>
                      <span>{why}</span>
                    </div>
                  ))}
                </div>
                <figcaption>
                  The offset is assigned within the selected partition. It is
                  not a replacement for a business identifier.
                </figcaption>
              </figure>
            )}
            {i === 1 && (
              <figure className="lesson-visual">
                <h3>The same offset can mean different records</h3>
                {[0, 1].map((p) => (
                  <div className="partition-example" key={p}>
                    <strong>orders / P{p}</strong>
                    {[0, 1, 2].map((o) => (
                      <span key={o}>offset {o}</span>
                    ))}
                  </div>
                ))}
                <figcaption>
                  Two separate append sequences. Kafka guarantees ordering
                  within each partition, not one global order across this topic.
                </figcaption>
              </figure>
            )}
            {i === 2 && (
              <figure className="lesson-visual">
                <div className="design-path">
                  {[
                    "Read offset 0",
                    "Next position = 1",
                    "Offset 0 stays retained",
                  ].map((text, j) => (
                    <div key={text}>
                      {j > 0 && (
                        <span className="concept-arrow" aria-hidden="true">
                          →
                        </span>
                      )}
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
                <figcaption>
                  A read moves the bookmark. Seek earliest moves it back,
                  provided that record still exists. Neither number here is a
                  committed restart position.
                </figcaption>
              </figure>
            )}
          </section>
        ))}
        <section id="log-lab" className="chapter-lab">
          <p className="eyebrow">PREDICT → INSPECT → REPLAY</p>
          <h2>Read the log. Keep the record.</h2>
          <p>{logLabCopy.intro}</p>
          <label htmlFor="log-prediction">
            After reading three retained records, how many remain if none
            expire?
          </label>
          <select
            id="log-prediction"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
          >
            <option value="">Choose a prediction</option>
            <option value="zero">Zero: reading deletes them</option>
            <option value="three">Three: reading moves a position</option>
          </select>
          <div className="lab-config">
            <label>
              Partition count
              <select
                value={partitions}
                onChange={(e) => reset(Number(e.target.value), retention)}
              >
                <option value={1}>1 partition</option>
                <option value={2}>2 partitions</option>
              </select>
            </label>
            <label>
              Retention window
              <select
                aria-label="Retention window"
                value={retention}
                onChange={(e) => reset(partitions, Number(e.target.value))}
              >
                {[3, 6, 12, 24].map((n) => (
                  <option key={n} value={n}>
                    {n} model steps
                  </option>
                ))}
              </select>
            </label>
            <label>
              Selected partition
              <select
                value={selected}
                onChange={(e) => setSelected(Number(e.target.value))}
                disabled={playing}
              >
                {state.partitions.map((p) => (
                  <option key={p.id} value={p.id}>
                    Partition {p.id}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="controls">
            <button
              className="primary"
              disabled={!prediction}
              onClick={() => {
                if (!playing) setSelected(0);
                setPlaying((p) => !p);
              }}
            >
              {playing ? "Pause demonstration" : "Start demonstration"}
            </button>
            <button
              disabled={!prediction || playing}
              onClick={() => act({ type: "append", partition: selected })}
            >
              Append one order
            </button>
            <button
              disabled={!prediction || playing}
              onClick={() => act({ type: "read", partition: selected })}
            >
              Read next record
            </button>
            <button
              disabled={!prediction || playing}
              onClick={() =>
                act({ type: "seek", partition: selected, to: "earliest" })
              }
            >
              Seek earliest retained
            </button>
            <button
              disabled={!prediction || playing}
              onClick={() =>
                act({ type: "seek", partition: selected, to: "end" })
              }
            >
              Seek end
            </button>
            <button
              disabled={!prediction || playing}
              onClick={() => act({ type: "wait" })}
            >
              Advance time one step
            </button>
            <button onClick={() => reset()}>Reset log experiment</button>
          </div>
          <p className="caption">
            Choose a prediction to enable controls. The optional demonstration
            appends six orders to partition 0, then reads one at a time; it
            stops after six reads or at step 18 if expiration prevents progress.
            Pause it to use manual controls. Each append, read, or wait is one
            step; seek does not advance time.
          </p>
          <p className="status" role="status">
            {state.message}
          </p>
          <LogView state={state} />
          {state.reads.length > 0 && (
            <div className="feedback">
              <strong>
                {prediction === "three"
                  ? "Your prediction matches the rule."
                  : "Revisit the prediction."}
              </strong>
              <p>
                Reading does not delete a record. There are currently{" "}
                {retainedCount(state)} retained records; any removals here were
                caused by the step-based retention policy.
              </p>
            </div>
          )}
          <p className="caption">{logLabCopy.assumptions}</p>
          <div className="visual-takeaway">
            Experiment checklist:{" "}
            {saved.experiments.includes("replay") ? "✓" : "○"} Read the same
            retained record twice.{" "}
            {saved.experiments.includes("expiration") ? "✓" : "○"} Observe at
            least one record expire. For replay, use 24 steps. For expiration,
            choose 3 steps, append a record, and advance time three times.
          </div>
        </section>
        <section id="log-mission" className="chapter-lab">
          <p className="eyebrow">APPLY / A DIFFERENT READER</p>
          <h2>Mission: rebuild the support report</h2>
          <p>{logLabCopy.mission}</p>
          <div className="lab-config">
            <label>
              Report retention
              <select
                value={missionRetention}
                onChange={(e) => {
                  setMissionRetention(Number(e.target.value));
                  setResult(null);
                }}
              >
                {[3, 6, 12, 24].map((n) => (
                  <option key={n} value={n}>
                    {n} model steps
                  </option>
                ))}
              </select>
            </label>
            <label>
              Initial report position
              <select
                value={missionStart}
                onChange={(e) => {
                  setMissionStart(e.target.value as "earliest" | "end");
                  setResult(null);
                }}
              >
                <option value="end">End of the current log</option>
                <option value="earliest">Earliest retained record</option>
              </select>
            </label>
          </div>
          <div className="controls">
            <button className="primary" onClick={validate}>
              Validate report design
            </button>
            <button
              disabled={hint === logLabCopy.hints.length}
              onClick={() => setHint((h) => h + 1)}
            >
              Show report hint ({hint}/3)
            </button>
            <button
              onClick={() => {
                setResult(null);
                setHint(0);
              }}
            >
              Retry report mission
            </button>
          </div>
          {logLabCopy.hints.slice(0, hint).map((h) => (
            <p className="hint" key={h}>
              {h}
            </p>
          ))}
          <div aria-live="polite">
            {result && (
              <div
                className={`feedback ${result.passed ? "success" : "partial"}`}
              >
                <h3>
                  {result.passed
                    ? "Report requirements met"
                    : "Report requirements need work"}
                </h3>
                <ul>
                  <li>
                    {result.completeRead ? "PASS" : "FAIL"} · First pass reads
                    all three original events.
                  </li>
                  <li>
                    {result.keptAfterRead ? "PASS" : "FAIL"} · All three remain
                    after the first reading pass.
                  </li>
                  <li>
                    {result.replayed ? "PASS" : "FAIL"} · Second pass replays
                    all three original events.
                  </li>
                </ul>
                <p>{result.feedback}</p>
              </div>
            )}
          </div>
          {result && (
            <>
              <LogView state={result.state} />
              <details>
                <summary>Reference configurations and trade-offs</summary>
                <p>
                  Earliest retained with 12 or 24 model steps passes this
                  schedule. Both are valid: retention must cover record age when
                  it is read, not simply the downtime. In the 12-step case the
                  oldest record expires after it has already been read again. A
                  real system also considers processing variability, storage
                  limits, segment-based cleanup, and failure recovery. The
                  validator accepts outcomes, not a particular button sequence.
                </p>
              </details>
            </>
          )}
        </section>
        <OptionalPractice />
        <section>
          <p className="eyebrow">
            WRAP UP / KEEP LOCATION AND PROGRESS SEPARATE
          </p>
          <h2>A record has a location. A reader has a position.</h2>
          <p>
            Appending creates records; reading advances a position; seeking
            moves that position; retention controls what remains. A partition
            offset is not a count of completed business effects, and replay may
            repeat those effects.
          </p>
          <div className="callout">
            <h3>
              {completeChapter2(saved)
                ? "Chapter 2 complete"
                : "Your chapter 2 checklist"}
            </h3>
            <p>
              {saved.experiments.length}/2 experiments observed ·{" "}
              {saved.missionPassed
                ? "Report mission passed"
                : "Report mission still to pass"}
            </p>
            <p>
              Completion requires observing replay and expiration plus passing
              the report mission. Page views and optional Docker commands do not
              mark this chapter complete. Browser completion demonstrates the
              model activities, not production Kafka proficiency.
            </p>
            <p>
              Continue in Chapter 3 to connect keys, partition selection, and
              customer ordering. Later, Chapter 5 will explain committed
              positions and restarts.
            </p>
            <a className="button" href="#/chapter/3">
              Continue to chapter 3 →
            </a>
            <p>
              <a href="#/roadmap">View the learning roadmap →</a>
            </p>
          </div>
          <p className="caption">
            Concept reference:{" "}
            <a href="https://github.com/apache/kafka/blob/4.2.0/docs/design/design.md">
              Apache Kafka 4.2.0 design
            </a>{" "}
            and{" "}
            <a href="https://github.com/apache/kafka/blob/4.2.0/docs/getting-started/introduction.md">
              introduction
            </a>
            . Version-specific defaults are not assumed.
          </p>
        </section>
      </article>
    </div>
  );
}
