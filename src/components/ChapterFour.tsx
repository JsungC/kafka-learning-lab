import { useEffect, useMemo, useState } from "react";
import {
  groupLessons,
  groupAssumptions,
  groupHints,
} from "../content/chapter4";
import {
  groupTimeline,
  explainGroupFrame,
  assessGroups,
  type GroupConfig,
} from "../simulation/groups";
import {
  completeChapter4,
  emptyChapter4,
  type Progress,
} from "../persistence/progress";
import { LessonParagraph } from "./LessonParagraph";
import { localJump } from "./navigation";
import { GroupView } from "./GroupView";
export function ChapterFour({
  progress,
  update,
}: {
  progress: Progress;
  update: React.Dispatch<React.SetStateAction<Progress>>;
}) {
  const saved = progress.chapter4 ?? emptyChapter4();
  const [config, setConfig] = useState<GroupConfig>({
    workers: 2,
    independent: false,
  });
  const frames = useMemo(() => groupTimeline(config), [config]);
  const [cursor, setCursor] = useState(0),
    [playing, setPlaying] = useState(false),
    [prediction, setPrediction] = useState("");
  const state = frames[cursor],
    note = explainGroupFrame(frames, cursor);
  const [mission, setMission] = useState<GroupConfig>({
      workers: 1,
      independent: false,
    }),
    [result, setResult] = useState<ReturnType<typeof assessGroups> | null>(
      null,
    ),
    [hint, setHint] = useState(0);
  useEffect(() => {
    update((p) =>
      p.chapter4?.viewed
        ? p
        : {
            ...p,
            chapter4: { ...(p.chapter4 ?? emptyChapter4()), viewed: true },
          },
    );
  }, [update]);
  useEffect(() => {
    if (cursor !== frames.length - 1) return;
    const tag = config.independent ? "independent" : "shared";
    update((p) => {
      const c = p.chapter4 ?? emptyChapter4();
      return c.experiments.includes(tag)
        ? p
        : { ...p, chapter4: { ...c, experiments: [...c.experiments, tag] } };
    });
  }, [cursor, frames.length, config.independent, update]);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setCursor((i) => Math.min(i + 1, frames.length - 1)),
      900,
    );
    return () => clearInterval(timer);
  }, [playing, frames.length]);
  useEffect(() => {
    if (cursor === frames.length - 1) setPlaying(false);
  }, [cursor, frames.length]);
  function seek(n: number) {
    setPlaying(false);
    setCursor(n);
  }
  function reset(next = config) {
    setPlaying(false);
    setCursor(0);
    setConfig(next);
  }
  function changeMission(next: GroupConfig) {
    setMission(next);
    setResult(null);
  }
  function validate() {
    const next = assessGroups(mission);
    setResult(next);
    update((p) => {
      const c = p.chapter4 ?? emptyChapter4();
      return {
        ...p,
        chapter4: {
          ...c,
          attempts: c.attempts + 1,
          missionPassed: c.missionPassed || next.passed,
        },
      };
    });
  }
  return (
    <div className="chapter-layout">
      <aside className="chapter-nav">
        <a href="#/roadmap">← All chapters</a>
        <p className="eyebrow">CHAPTER 04</p>
        <strong>Consumer groups and scaling</strong>
        <nav aria-label="Chapter contents">
          {groupLessons.map((l) => (
            <a key={l.id} href={`#group-${l.id}`} onClick={localJump}>
              {l.title}
            </a>
          ))}
          <a href="#group-lab" onClick={localJump}>
            Experiment · ownership and subscriptions
          </a>
          <a href="#group-mission" onClick={localJump}>
            Mission · inventory and analytics
          </a>
        </nav>
        <div className="progress-panel">
          <p>On this device</p>
          <span>✓ Chapter opened</span>
          <span>{saved.experiments.length}/2 subscription comparisons</span>
          <span>{saved.attempts} mission attempts</span>
          <span>
            {saved.missionPassed ? "✓ Mission passed" : "○ Mission not passed"}
          </span>
          <strong>
            {completeChapter4(saved)
              ? "Chapter complete"
              : "Learning in progress"}
          </strong>
        </div>
      </aside>
      <article className="chapter-body">
        <section>
          <p className="eyebrow">CHAPTER 04 / PARTITION OWNERSHIP</p>
          <h1>
            Consumer groups
            <br />
            and scaling.
          </h1>
          <p className="lede">
            Inventory needs more processing capacity. Analytics still needs
            every order event. Which consumers should share a group?
          </p>
          <div className="learning-goals">
            <strong>You will learn to</strong>
            <ul>
              <li>
                Distinguish shared work within a group from independent
                subscriptions across groups.
              </li>
              <li>
                Inspect partition ownership, idle members, and group-specific
                progress.
              </li>
              <li>
                Explain how membership changes affect ownership under explicit
                model assumptions.
              </li>
            </ul>
            <p>
              Prerequisites:{" "}
              <a href="#/chapter/2">partitions and reading positions</a> and{" "}
              <a href="#/chapter/3">partition-local ordering</a>. Earlier
              completion is not required to open this chapter.
            </p>
          </div>
        </section>
        {groupLessons.map((l, i) => (
          <section id={`group-${l.id}`} key={l.id}>
            <h2>{l.title}</h2>
            {l.paragraphs.map((p) => (
              <LessonParagraph text={p} key={p} />
            ))}
            {i === 0 && (
              <figure className="lesson-visual">
                <h3>Two different uses of a group ID</h3>
                <div className="reaction-cards">
                  <div className="concept-node">
                    <span className="concept-kicker">SAME GROUP</span>
                    <strong>inventory-1 + inventory-2</strong>
                    <span>One subscription. Split partition work.</span>
                  </div>
                  <div className="concept-node">
                    <span className="concept-kicker">DIFFERENT GROUPS</span>
                    <strong>inventory + analytics</strong>
                    <span>
                      Two subscriptions. Independent reading positions.
                    </span>
                  </div>
                </div>
                <figcaption>
                  The topic’s stored records are shared; group identities
                  separate consumption progress.
                </figcaption>
              </figure>
            )}
            {i === 1 && (
              <figure className="lesson-visual">
                <h3>
                  Four partitions do not provide five active owners in one group
                </h3>
                <div className="design-path">
                  <div>
                    <span>4 assigned members</span>
                  </div>
                  <div>
                    <span className="concept-arrow">+</span>
                    <span>1 idle member</span>
                  </div>
                </div>
                <figcaption>
                  This statement assumes the basic consumer-group model, one
                  subscribed four-partition topic, and identical member
                  subscriptions. A member can own multiple partitions when there
                  are fewer members.
                </figcaption>
              </figure>
            )}
          </section>
        ))}
        <section id="group-lab" className="chapter-lab">
          <p className="eyebrow">PREDICT → ASSIGN → COMPARE</p>
          <h2>Who receives each partition’s records?</h2>
          <p>
            Compare the same-group and separate-group configurations. The
            timeline starts with 12 retained records, pauses analytics
            processing, advances two ticks, changes inventory membership,
            advances once, then resumes analytics and drains the workload. If
            initially five inventory members are selected, the membership change
            removes one; otherwise it adds one. The model does not simulate a
            crash or a real rebalance delay.
          </p>
          <label htmlFor="group-prediction">
            Predict the subscription behavior
          </label>
          <select
            id="group-prediction"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
          >
            <option value="">Choose a prediction</option>
            <option value="independent">
              Separate groups let both services read every retained record.
            </option>
            <option value="shared">
              Members of one group each receive every record.
            </option>
          </select>
          <div className="lab-config">
            <div>
              <label htmlFor="group-workers">Initial inventory consumers</label>
              <select
                id="group-workers"
                value={config.workers}
                onChange={(e) =>
                  reset({ ...config, workers: Number(e.target.value) })
                }
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} consumer(s)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="group-topology">Analytics subscription</label>
              <select
                id="group-topology"
                value={String(config.independent)}
                onChange={(e) =>
                  reset({ ...config, independent: e.target.value === "true" })
                }
              >
                <option value="false">
                  Same group as inventory · shared work
                </option>
                <option value="true">
                  Separate analytics group · independent
                </option>
              </select>
            </div>
          </div>
          <p className="caption">
            Configuration changes reset the timeline. Finishing each
            configuration records comparison evidence; it does not pass the
            mission.
          </p>
          <div className="controls">
            <button
              className="primary"
              disabled={!prediction || cursor === frames.length - 1}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? "Pause group playback" : "Start group playback"}
            </button>
            <button
              disabled={!prediction || playing || cursor === frames.length - 1}
              onClick={() => seek(cursor + 1)}
            >
              Single group step
            </button>
            <button onClick={() => reset()}>Reset group experiment</button>
          </div>
          <div className="ordering-timeline">
            <div className="timeline-toolbar">
              <label htmlFor="group-playhead">
                Group timeline · step {cursor} / {frames.length - 1}
              </label>
              <span>{playing ? "Playing" : "Paused"}</span>
            </div>
            <input
              id="group-playhead"
              type="range"
              min={0}
              max={frames.length - 1}
              step={1}
              value={cursor}
              disabled={!prediction}
              aria-valuetext={`Step ${cursor}: ${note.title}`}
              onChange={(e) => seek(Number(e.target.value))}
            />
            <div className="timeline-navigation">
              <button
                disabled={!prediction || cursor === 0}
                onClick={() => seek(cursor - 1)}
              >
                Previous group step
              </button>
              <div className="timeline-milestones">
                {[
                  { at: 0, label: "Initial owners" },
                  { at: 4, label: "Membership change" },
                  { at: 6, label: "Analytics resumes" },
                  { at: frames.length - 1, label: "Finished" },
                ].map((m) => (
                  <button
                    disabled={!prediction}
                    key={m.label}
                    onClick={() => seek(m.at)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <button
                disabled={!prediction || cursor === frames.length - 1}
                onClick={() => seek(cursor + 1)}
              >
                Next group step
              </button>
            </div>
            <section
              className="step-explanation"
              aria-label="Group timeline explanation"
            >
              <h3>{note.title}</h3>
              <dl>
                <div>
                  <dt>Changed</dt>
                  <dd>{note.change}</dd>
                </div>
                <div>
                  <dt>Look here</dt>
                  <dd>{note.focus}</dd>
                </div>
                <div>
                  <dt>Why it matters</dt>
                  <dd>{note.reason}</dd>
                </div>
              </dl>
            </section>
          </div>
          <GroupView state={state} />
          {cursor === frames.length - 1 && (
            <div className="feedback">
              <strong>
                {prediction === "independent"
                  ? "Your prediction identifies the subscription boundary."
                  : "Revisit the difference between a group and a member."}
              </strong>
              <p>
                {config.independent
                  ? "Both services have independent positions and receive the full retained stream."
                  : "The shared group finished the combined workload, but the two roles did not each receive all 12 records."}
              </p>
            </div>
          )}
          <p className="caption">{groupAssumptions}</p>
          <div className="visual-takeaway">
            {saved.experiments.includes("shared") ? "✓" : "○"} Inspect a
            finished same-group run.{" "}
            {saved.experiments.includes("independent") ? "✓" : "○"} Inspect a
            finished separate-group run.
          </div>
        </section>
        <section id="group-mission" className="chapter-lab">
          <p className="eyebrow">
            APPLY / SHARE WORK WITHOUT LOSING A SUBSCRIPTION
          </p>
          <h2>Mission: scale inventory and keep analytics independent</h2>
          <p>
            Four partitions contain 12 records. Inventory must process all 12
            within six model ticks while analytics processing is paused. After
            resuming, analytics must also process all 12 records. Choose
            inventory membership and the analytics subscription. This validator
            keeps membership fixed, so the deadline compares capacity without a
            mid-run membership change. Each member processes at most one record
            per tick.
          </p>
          <div className="lab-config">
            <div>
              <label htmlFor="mission-group-workers">
                Mission inventory consumers
              </label>
              <select
                id="mission-group-workers"
                value={mission.workers}
                onChange={(e) =>
                  changeMission({ ...mission, workers: Number(e.target.value) })
                }
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option value={n} key={n}>
                    {n} consumer(s)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="mission-group-topology">
                Mission analytics subscription
              </label>
              <select
                id="mission-group-topology"
                value={String(mission.independent)}
                onChange={(e) =>
                  changeMission({
                    ...mission,
                    independent: e.target.value === "true",
                  })
                }
              >
                <option value="false">Same group as inventory</option>
                <option value="true">Separate analytics group</option>
              </select>
            </div>
          </div>
          <div className="controls">
            <button className="primary" onClick={validate}>
              Validate group design
            </button>
            <button
              disabled={hint === groupHints.length}
              onClick={() => setHint((h) => h + 1)}
            >
              Show group hint ({hint}/3)
            </button>
            <button
              onClick={() => {
                setResult(null);
                setHint(0);
              }}
            >
              Retry group mission
            </button>
          </div>
          {groupHints.slice(0, hint).map((h) => (
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
                    ? "Group requirements met"
                    : "Group requirements need work"}
                </h3>
                <ul>
                  <li>
                    {result.inventoryOnTime ? "PASS" : "FAIL"} · Inventory reads
                    all 12 by tick 6 while analytics is paused.
                  </li>
                  <li>
                    {result.inventoryAll ? "PASS" : "FAIL"} · Inventory receives
                    the complete stream.
                  </li>
                  <li>
                    {result.analyticsAll ? "PASS" : "FAIL"} · Analytics receives
                    the complete stream after resuming.
                  </li>
                </ul>
                <p>{result.feedback}</p>
              </div>
            )}
          </div>
          {result && (
            <>
              <GroupView state={result.state} />
              <details>
                <summary>Valid designs and trade-offs</summary>
                <p>
                  Separate groups with 2–5 inventory members pass this workload.
                  Two members divide four partitions; five members leave one
                  inventory member idle. Extra members beyond available
                  partitions do not increase this model’s inventory capacity.
                  All accepted designs satisfy outcomes, not an exact UI
                  arrangement. Real processing capacity depends on workload,
                  clients, brokers, and downstream systems.
                </p>
              </details>
            </>
          )}
        </section>
        <section>
          <p className="eyebrow">WRAP UP / GROUP ID AND MEMBER COUNT</p>
          <h2>Group membership and subscription identity</h2>
          <p>
            Members inside one group divide partition work. Separate groups
            maintain independent reading positions. A membership change can move
            ownership, while a new group introduces another logical
            subscription.
          </p>
          <details>
            <summary>
              Would a new group ID for every inventory instance solve scaling?
            </summary>
            <p>
              It would make each instance a separate subscription receiving the
              stream. That may repeat business work rather than share it. To
              share one inventory workload, use members of the same logical
              group and design external effects and recovery deliberately.
            </p>
          </details>
          <details>
            <summary>
              Does a paused member immediately lose its partitions?
            </summary>
            <p>
              Not in this model: processing pauses but membership stays present.
              Real behavior depends on polling, protocol heartbeats, timeouts,
              and application behavior. Group failure detection and committed
              restart positions are not implied by this pause button.
            </p>
          </details>
          <div className="callout">
            <h3>
              {completeChapter4(saved)
                ? "Chapter 4 complete"
                : "Your chapter 4 checklist"}
            </h3>
            <p>
              {saved.experiments.length}/2 subscription comparisons ·{" "}
              {saved.missionPassed
                ? "Group mission passed"
                : "Group mission still to pass"}
            </p>
            <p>
              Completion requires observing both finished timeline
              configurations and passing the mission. This records model
              activities, not production Kafka proficiency.
            </p>
            <p>
              Next: Chapter 5 will separate read position, completed processing,
              and committed restart position. It is planned and not yet a
              lesson.
            </p>
            <a href="#/roadmap">View the chapter outline →</a>
          </div>
          <p className="caption">
            References checked November 10, 2026 against{" "}
            <a href="https://github.com/apache/kafka/blob/4.2.0/docs/design/design.md">
              Apache Kafka 4.2.0 design: consumer position and membership
            </a>
            . This chapter covers basic consumer groups, not share groups. The
            reference version is not a claim about the latest release.
          </p>
        </section>
      </article>
    </div>
  );
}
