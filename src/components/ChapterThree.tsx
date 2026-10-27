import { useEffect, useState } from "react";
import {
  orderingLessons,
  keyStrategies,
  orderingHints,
  orderingAssumptions,
} from "../content/chapter3";
import {
  initialOrdering,
  stepOrdering,
  partitionFor,
  teachingHash,
  orderingEvidence,
  orderingInputs,
  type KeyStrategy,
  type OrderingConfig,
} from "../simulation/ordering";
import { assessOrdering } from "../assessment/orderingMission";
import {
  completeChapter3,
  emptyChapter3,
  type Progress,
} from "../persistence/progress";
import { localJump } from "./navigation";
import { OrderingView } from "./OrderingView";
export function ChapterThree({
  progress,
  update,
}: {
  progress: Progress;
  update: React.Dispatch<React.SetStateAction<Progress>>;
}) {
  const saved = progress.chapter3 ?? emptyChapter3();
  const [config, setConfig] = useState<OrderingConfig>({
    partitions: 3,
    strategy: "event",
  });
  const [state, setState] = useState(() =>
    initialOrdering({ partitions: 3, strategy: "event" }),
  );
  const [prediction, setPrediction] = useState(""),
    [playing, setPlaying] = useState(false);
  const [mission, setMission] = useState<OrderingConfig>({
    partitions: 1,
    strategy: "constant",
  });
  const [result, setResult] = useState<ReturnType<
      typeof assessOrdering
    > | null>(null),
    [hint, setHint] = useState(0);
  const [compareCount, setCompareCount] = useState(4);
  useEffect(() => {
    update((p) =>
      p.chapter3?.viewed
        ? p
        : {
            ...p,
            chapter3: { ...(p.chapter3 ?? emptyChapter3()), viewed: true },
          },
    );
  }, [update]);
  useEffect(() => {
    if (state.completed.length !== 9) return;
    const evidence = orderingEvidence(state);
    const tag = !evidence.placement
      ? "split"
      : evidence.inOrder && state.config.strategy === "customer"
        ? "stable"
        : null;
    if (!tag) return;
    update((p) => {
      const current = p.chapter3 ?? emptyChapter3();
      return current.experiments.includes(tag)
        ? p
        : {
            ...p,
            chapter3: {
              ...current,
              experiments: [...current.experiments, tag],
            },
          };
    });
  }, [state, update]);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () =>
        setState((s) =>
          stepOrdering(s, { type: s.published < 9 ? "publish" : "process" }),
        ),
      500,
    );
    return () => clearInterval(timer);
  }, [playing]);
  useEffect(() => {
    if (state.completed.length === 9) setPlaying(false);
  }, [state.completed.length]);
  function reset(next = config) {
    setPlaying(false);
    setConfig(next);
    setState(initialOrdering(next));
  }
  function singleStep() {
    setState((s) =>
      stepOrdering(s, { type: s.published < 9 ? "publish" : "process" }),
    );
  }
  function changeMission(next: OrderingConfig) {
    setMission(next);
    setResult(null);
  }
  function validate() {
    const next = assessOrdering(mission);
    setResult(next);
    update((p) => {
      const current = p.chapter3 ?? emptyChapter3();
      return {
        ...p,
        chapter3: {
          ...current,
          attempts: current.attempts + 1,
          missionPassed: current.missionPassed || next.passed,
        },
      };
    });
  }
  return (
    <div className="chapter-layout">
      <aside className="chapter-nav">
        <a href="#/roadmap">← All chapters</a>
        <p className="eyebrow">CHAPTER 03</p>
        <strong>Keys and ordering</strong>
        <nav aria-label="Chapter contents">
          {orderingLessons.map((l) => (
            <a href={`#keys-${l.id}`} key={l.id} onClick={localJump}>
              {l.title}
            </a>
          ))}
          <a href="#key-lab" onClick={localJump}>
            Experiment · keys and slow lanes
          </a>
          <a href="#key-mission" onClick={localJump}>
            Mission · customer activity
          </a>
          <a href="#key-wrap-up" onClick={localJump}>
            Wrap up · explain the boundary
          </a>
        </nav>
        <div className="progress-panel">
          <p>On this device</p>
          <span>✓ Chapter opened</span>
          <span>{saved.experiments.length}/2 comparisons observed</span>
          <span>{saved.attempts} mission attempts</span>
          <span>
            {saved.missionPassed ? "✓ Mission passed" : "○ Mission not passed"}
          </span>
          <strong>
            {completeChapter3(saved)
              ? "Chapter complete"
              : "Learning in progress"}
          </strong>
        </div>
      </aside>
      <article className="chapter-body">
        <section>
          <p className="eyebrow">CHAPTER 03 / KEEP RELATED EVENTS TOGETHER</p>
          <h1>
            Keys and
            <br />
            ordering.
          </h1>
          <p className="lede">
            Alice’s events need a sequence. Bob’s work should not have to wait
            for Alice.
          </p>
          <div className="learning-goals">
            <strong>You will learn to</strong>
            <ul>
              <li>Choose a key based on the entity whose order matters.</li>
              <li>
                Explain partition-local ordering and the assumptions behind
                stable key placement.
              </li>
              <li>
                Compare ordering with cross-partition parallelism, collisions,
                and changing partition counts.
              </li>
            </ul>
            <p>
              Prerequisite:{" "}
              <a href="#/chapter/2">
                records, partitions, offsets, and reading positions
              </a>
              . You can enter this chapter without completing earlier
              activities.
            </p>
          </div>
        </section>
        {orderingLessons.map((l, i) => (
          <section key={l.id} id={`keys-${l.id}`}>
            <h2>{l.title}</h2>
            {l.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {i === 0 && (
              <figure className="lesson-visual">
                <h3>Business sequence is not a Kafka offset</h3>
                <div className="record-anatomy">
                  {["customer-a", "customer-b", "customer-c"].map((c) => (
                    <div className="concept-node" key={c}>
                      <span className="concept-kicker">{c}</span>
                      <strong>#1 → #2 → #3</strong>
                      <span>
                        Preserve this customer’s source sequence. Other
                        customers may progress independently.
                      </span>
                    </div>
                  ))}
                </div>
                <figcaption>
                  The source stream interleaves customers. Our requirement does
                  not impose one global completion order.
                </figcaption>
              </figure>
            )}
            {i === 2 && (
              <figure className="lesson-visual">
                <h3>Inspect the teaching mapping</h3>
                <p>
                  hash(key) mod partition count. Compare hypothetical
                  configurations; this does not move any existing records.
                </p>
                <label htmlFor="mapping-count">
                  Compare current {config.partitions} partitions with
                </label>
                <select
                  id="mapping-count"
                  value={compareCount}
                  onChange={(e) => setCompareCount(Number(e.target.value))}
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} partition(s)
                    </option>
                  ))}
                </select>
                <div
                  className="mapping-table"
                  role="table"
                  aria-label="Hypothetical key placement"
                >
                  <div role="row">
                    <strong role="columnheader">Key / teaching sum</strong>
                    <strong role="columnheader">
                      {config.partitions} partitions
                    </strong>
                    <strong role="columnheader">
                      {compareCount} partitions
                    </strong>
                  </div>
                  {["customer-a", "customer-b", "customer-c"].map((key) => (
                    <div role="row" key={key}>
                      <span role="rowheader">
                        {key}
                        <small>sum = {teachingHash(key)}</small>
                      </span>
                      <span role="cell">
                        P{partitionFor(key, config.partitions)}
                      </span>
                      <span role="cell">
                        P{partitionFor(key, compareCount)}
                      </span>
                    </div>
                  ))}
                </div>
                <figcaption>
                  Same key, different count, possibly different lane. Different
                  keys may also share a lane. This simple arithmetic is not
                  Kafka’s Java hash.
                </figcaption>
              </figure>
            )}
          </section>
        ))}
        <section className="chapter-lab" id="key-lab">
          <p className="eyebrow">PREDICT → ROUTE → COMPARE</p>
          <h2>Will one slow partition break the customer sequence?</h2>
          <p>
            First run with unique event keys and three partitions. Watch
            customer completions after P0 falls behind. Then reset with customer
            keys and compare. Each single step publishes one input until all
            nine are queued, then advances processing by one model tick. No
            processing occurs during the publication phase.
          </p>
          <details>
            <summary>Inspect the fixed source sequence · 9 events</summary>
            <ol className="event-log">
              {orderingInputs.map((e) => (
                <li key={e.id}>
                  {e.customer} sequence {e.sequence}: {e.value}
                </li>
              ))}
            </ol>
          </details>
          <label htmlFor="key-prediction">Predict the ordering boundary</label>
          <select
            id="key-prediction"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
          >
            <option value="">Choose a prediction</option>
            <option value="customer">
              Stable customer placement and serial lanes preserve each
              customer’s source order.
            </option>
            <option value="any">
              Any keys preserve customer order because Kafka orders the topic
              globally.
            </option>
          </select>
          <div className="lab-config">
            <label htmlFor="key-strategy">Record key</label>
            <select
              id="key-strategy"
              value={config.strategy}
              onChange={(e) =>
                reset({ ...config, strategy: e.target.value as KeyStrategy })
              }
            >
              {keyStrategies.map((k) => (
                <option value={k.id} key={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
            <label htmlFor="key-partitions">Fixed partition count</label>
            <select
              id="key-partitions"
              value={config.partitions}
              onChange={(e) =>
                reset({ ...config, partitions: Number(e.target.value) })
              }
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} partition(s)
                </option>
              ))}
            </select>
          </div>
          <p className="caption">
            Changing key strategy or partition count resets the lab. The mapping
            comparison above is hypothetical; this control does not simulate
            live repartitioning.
          </p>
          <div className="controls">
            <button
              className="primary"
              disabled={!prediction || state.completed.length === 9}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? "Pause key playback" : "Start key playback"}
            </button>
            <button
              disabled={!prediction || playing || state.completed.length === 9}
              onClick={singleStep}
            >
              Single key step
            </button>
            <button onClick={() => reset()}>Reset key experiment</button>
          </div>
          {!prediction && (
            <p className="caption">
              Choose a prediction to enable playback and single-step controls.
            </p>
          )}
          <p className="status" role="status">
            {state.message}
          </p>
          <OrderingView state={state} />
          {state.completed.length === 9 && (
            <div className="feedback">
              <strong>
                {prediction === "customer"
                  ? "Your prediction identifies the boundary."
                  : "Revisit the scope of ordering."}
              </strong>
              <p>
                {orderingEvidence(state).placement
                  ? "This run kept each customer on one partition. Check whether more than one lane worked at the same time: preserving order alone is not the same as meeting the parallel-work requirement."
                  : "This run split at least one customer across partitions. Kafka’s partition-local order cannot coordinate that customer’s completion across independently scheduled lanes."}
              </p>
            </div>
          )}
          <p className="caption">{orderingAssumptions}</p>
          <div className="visual-takeaway">
            Experiment checklist:{" "}
            {saved.experiments.includes("split") ? "✓" : "○"} Finish a
            split-customer run (unique event keys with 3 partitions).{" "}
            {saved.experiments.includes("stable") ? "✓" : "○"} Finish a stable
            customer run. Completed observations are saved separately from the
            mission.
          </div>
        </section>
        <section className="chapter-lab" id="key-mission">
          <p className="eyebrow">APPLY / CUSTOMER ACTIVITY</p>
          <h2>Mission: preserve each customer’s story</h2>
          <p>
            The activity service needs all nine events in source order for each
            customer, even when P0 is slower. Keep every customer’s records on
            one lane, process the customer sequences as #1 → #2 → #3, and allow
            at least two partition lanes to work during the same model tick.
            Choose a key strategy and fixed partition count. The validator
            publishes the known inputs, drains every lane, and checks actual
            placements and completions.
          </p>
          <div className="lab-config">
            <label htmlFor="mission-key">Mission key strategy</label>
            <select
              id="mission-key"
              value={mission.strategy}
              onChange={(e) =>
                changeMission({
                  ...mission,
                  strategy: e.target.value as KeyStrategy,
                })
              }
            >
              {keyStrategies.map((k) => (
                <option value={k.id} key={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
            <label htmlFor="mission-partitions">Mission partition count</label>
            <select
              id="mission-partitions"
              value={mission.partitions}
              onChange={(e) =>
                changeMission({
                  ...mission,
                  partitions: Number(e.target.value),
                })
              }
            >
              {[1, 2, 3, 4].map((n) => (
                <option value={n} key={n}>
                  {n} partition(s)
                </option>
              ))}
            </select>
          </div>
          <div className="controls">
            <button className="primary" onClick={validate}>
              Validate customer design
            </button>
            <button
              disabled={hint === orderingHints.length}
              onClick={() => setHint((h) => h + 1)}
            >
              Show ordering hint ({hint}/3)
            </button>
            <button
              onClick={() => {
                setResult(null);
                setHint(0);
              }}
            >
              Retry customer mission
            </button>
          </div>
          {orderingHints.slice(0, hint).map((h) => (
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
                    ? "Customer requirements met"
                    : "Customer requirements need work"}
                </h3>
                <ul>
                  <li>
                    {result.evidence.allProcessed ? "PASS" : "FAIL"} · All nine
                    events completed.
                  </li>
                  <li>
                    {result.evidence.placement ? "PASS" : "FAIL"} · One stable
                    partition per customer.
                  </li>
                  <li>
                    {result.evidence.inOrder ? "PASS" : "FAIL"} · Strict
                    per-customer completion sequence.
                  </li>
                  <li>
                    {result.evidence.parallel ? "PASS" : "FAIL"} · At least two
                    lanes active in the same model tick.
                  </li>
                </ul>
                <p>{result.feedback}</p>
              </div>
            )}
          </div>
          {result && (
            <>
              <OrderingView state={result.state} />
              <details>
                <summary>Reference designs and limitations</summary>
                <p>
                  A customer key with 2, 3, or 4 fixed partitions passes this
                  scenario. More than one customer can share a partition, and an
                  unused partition is not an error. A single partition or
                  constant key can preserve sequence but sacrifices this
                  scenario’s parallelism. Unique event keys may spread work
                  while splitting the entity whose order matters. No result is a
                  real Kafka throughput measurement or a guarantee about
                  arbitrary client retries and external effects.
                </p>
              </details>
            </>
          )}
        </section>
        <section id="key-wrap-up">
          <p className="eyebrow">WRAP UP / STATE THE GUARANTEE</p>
          <h2>Name the entity. Name the assumptions.</h2>
          <p>
            A useful explanation is: “We key by customer, keep the partition
            count and partitioner fixed, publish that customer’s events in
            source order, and process each partition serially.” Saying only
            “Kafka guarantees ordering” leaves out the scope and application
            responsibilities.
          </p>
          <details>
            <summary>What changes if one customer becomes much busier?</summary>
            <p>
              That hot key still maps to one partition in this model. More
              partitions alone cannot divide that one key’s ordered work.
              Revisit the actual ordering boundary before splitting keys,
              because spreading one customer changes the guarantee you can make.
            </p>
          </details>
          <details>
            <summary>What changes if the partition count increases?</summary>
            <p>
              Future placement can change while old records remain in old
              partitions. This lab compares the two mappings but does not
              simulate a migration protocol. A real rollout must plan how to
              handle in-flight and historical events rather than assuming the
              key automatically preserves its old lane.
            </p>
          </details>
          <div className="callout">
            <h3>
              {completeChapter3(saved)
                ? "Chapter 3 complete"
                : "Your chapter 3 checklist"}
            </h3>
            <p>
              {saved.experiments.length}/2 comparisons observed ·{" "}
              {saved.missionPassed
                ? "Customer mission passed"
                : "Customer mission still to pass"}
            </p>
            <p>
              Completion requires finishing a split run and a stable run, plus
              passing the mission. Activity evidence is not a certificate of
              production Kafka proficiency. Later consumer-group assignment and
              failure handling remain separate topics.
            </p>
            <p>
              Next: Chapter 4 will explain how consumer groups assign partition
              work and how scaling interacts with these lanes. It is planned,
              not yet a lesson.
            </p>
            <a href="#/roadmap">View the learning roadmap →</a>
            <p>
              <a href="#/chapter/2">Revisit topics and event logs</a>
            </p>
          </div>
          <p className="caption">
            References checked October 27, 2026:{" "}
            <a href="https://github.com/apache/kafka/blob/4.2.0/docs/design/design.md">
              Kafka 4.2.0 design
            </a>{" "}
            and{" "}
            <a href="https://github.com/apache/kafka/blob/4.2.0/clients/src/main/java/org/apache/kafka/clients/producer/ProducerConfig.java">
              Java producer partitioning and ordering configuration
            </a>
            . This is the selected reference version, not a claim about the
            latest release.
          </p>
        </section>
      </article>
    </div>
  );
}
