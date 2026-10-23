import { useState } from "react";
import { visualCopy as copy } from "../content/lessonVisuals";
import { bookmarkState, outageSnapshots } from "../simulation/illustrations";
import { step, type State } from "../simulation/core";

function Arrow() {
  return (
    <span className="concept-arrow" aria-hidden="true">
      →
    </span>
  );
}
function VisualHeader({ label, title }: { label: string; title: string }) {
  return (
    <>
      <span className="eyebrow">{label}</span>
      <h3>{title}</h3>
    </>
  );
}
export function EventAnatomy() {
  const c = copy.event;
  return (
    <figure className="lesson-visual" aria-label={c.title}>
      <VisualHeader label={c.label} title={c.title} />
      <div className="event-anatomy">
        <div className="concept-node">
          <span className="concept-kicker">PRODUCER</span>
          <strong>{c.producer}</strong>
          <span>{c.action}</span>
        </div>
        <Arrow />
        <div className="fact-card">
          <span className="concept-kicker">A FACT THAT ALREADY HAPPENED</span>
          <strong>{c.topic}</strong>
          <dl>
            {c.record.map(([field, value, meaning]) => (
              <div key={field}>
                <dt>{field}</dt>
                <dd>
                  <code>{value}</code>
                  <span>{meaning}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="reaction-branch" aria-hidden="true">
        <span>↓</span>
        <span>↓</span>
      </div>
      <div className="reaction-cards">
        {c.consumers.map(([service, action]) => (
          <div className="concept-node" key={service}>
            <span className="concept-kicker">CONSUMER REACTION</span>
            <strong>{service}</strong>
            <span>{action}</span>
          </div>
        ))}
      </div>
      <figcaption>{c.caption}</figcaption>
      <div className="visual-takeaway">{c.takeaway}</div>
    </figure>
  );
}
function ReaderGrid({ state }: { state: State }) {
  const orders = state.retained;
  return (
    <div
      className="reader-matrix"
      role="table"
      aria-label="Retained orders and independent processing progress"
    >
      <div className="matrix-row" role="row">
        <span role="columnheader">Retained log</span>
        {orders.map((e) => (
          <span role="columnheader" className="matrix-record" key={e.id}>
            #{String(e.id).padStart(3, "0")}
          </span>
        ))}
      </div>
      {[
        { name: "Notifications", ids: state.notification },
        { name: "Analytics", ids: state.analytics },
      ].map((reader) => (
        <div role="row" className="matrix-row" key={reader.name}>
          <span role="rowheader">{reader.name}</span>
          {orders.map((e) => (
            <span
              role="cell"
              className={`read-cell ${reader.ids.includes(e.id) ? "processed" : "waiting"}`}
              key={e.id}
              aria-label={`${reader.name}, order ${e.id}: ${reader.ids.includes(e.id) ? "processed" : "pending"}`}
            >
              {reader.ids.includes(e.id) ? "✓" : "·"}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
export function ReaderBookmarks() {
  const c = copy.readers;
  const [state, setState] = useState(bookmarkState);
  const finished = state.analytics.length === 6;
  return (
    <figure className="lesson-visual" aria-label={c.title}>
      <VisualHeader label={c.label} title={c.title} />
      <p>{c.caption}</p>
      <ReaderGrid state={state} />
      <div className="visual-legend">
        <span>✓ Processed</span>
        <span>· Pending</span>
        <span>Top row = records still retained</span>
      </div>
      <div className="bookmark-summary">
        <span>
          Notifications: <strong>6 / 6</strong>
        </span>
        <span>
          Analytics: <strong>{state.analytics.length} / 6</strong>
        </span>
        <span>
          Still retained: <strong>{state.retained.length}</strong>
        </span>
      </div>
      <div className="controls">
        <button
          disabled={finished}
          title={finished ? c.done : undefined}
          onClick={() =>
            setState((s) =>
              step(step(s, { type: "analytics", paused: false }), {
                type: "step",
              }),
            )
          }
        >
          {c.read}
        </button>
        <button onClick={() => setState(bookmarkState())}>{c.reset}</button>
      </div>
      <div className="visual-takeaway" role="status">
        {state.analytics.length === 0
          ? "Analytics has not read any records. Notifications have already read all six."
          : `Analytics has processed ${state.analytics.length} of 6. ${finished ? "Both readers are caught up." : "Its next record is order " + (state.analytics.length + 1) + "."} All 6 records remain in the log.`}
      </div>
      <figcaption>{c.limit}</figcaption>
    </figure>
  );
}
export function OutageTimeline() {
  const c = copy.outage;
  const [stage, setStage] = useState(0);
  const state = outageSnapshots()[stage];
  return (
    <figure className="lesson-visual" aria-label={c.title}>
      <VisualHeader label={c.label} title={c.title} />
      <p>{c.caption}</p>
      <div
        className="timeline-stages"
        role="group"
        aria-label="Outage snapshots"
      >
        {c.stages.map((s, i) => (
          <button
            key={s.name}
            aria-pressed={stage === i}
            onClick={() => setStage(i)}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {s.name}
          </button>
        ))}
      </div>
      <div className="snapshot-metrics">
        <div>
          <span>Produced</span>
          <strong>{state.orders.length}</strong>
        </div>
        <div>
          <span>Notifications</span>
          <strong>{state.notification.length}</strong>
        </div>
        <div className={state.analyticsPaused ? "metric-paused" : ""}>
          <span>Analytics {state.analyticsPaused ? "· paused" : ""}</span>
          <strong>{state.analytics.length}</strong>
        </div>
        <div>
          <span>Analytics pending</span>
          <strong>{state.retained.length - state.analytics.length}</strong>
        </div>
      </div>
      <div className="snapshot-explanation" role="status">
        <strong>{c.stages[stage].name}</strong>
        <p>{c.stages[stage].why}</p>
      </div>
      <div className="retention-boundary">
        <h4>{c.retentionTitle}</h4>
        <div>
          {c.retention.map(([title, detail], i) => (
            <div key={title} className={i ? "expired" : "retained"}>
              <span aria-hidden="true">{i ? "×" : "✓"}</span>
              <strong>{title}</strong>
              <p>{detail}</p>
            </div>
          ))}
        </div>
      </div>
      <figcaption>{c.limit}</figcaption>
    </figure>
  );
}
export function DesignChoices() {
  const c = copy.choice;
  const [choice, setChoice] = useState(0);
  const selected = c.options[choice];
  return (
    <figure className="lesson-visual" aria-label={c.title}>
      <VisualHeader label={c.label} title={c.title} />
      <p>{c.caption}</p>
      <div
        className="requirement-options"
        role="group"
        aria-label="Design requirements"
      >
        {c.options.map((o, i) => (
          <button
            key={o.name}
            aria-pressed={choice === i}
            onClick={() => setChoice(i)}
          >
            {o.name}
          </button>
        ))}
      </div>
      <div className="design-result" aria-live="polite">
        <span className="concept-kicker">THE REQUIREMENT</span>
        <p>{selected.need}</p>
        <strong>{selected.design}</strong>
        <div className="design-path">
          {selected.path.map((name, i) => (
            <div key={name}>
              {i > 0 && <Arrow />}
              <span>{name}</span>
            </div>
          ))}
        </div>
        <p>{selected.tradeoff}</p>
      </div>
    </figure>
  );
}
export const lessonVisuals = [
  EventAnatomy,
  ReaderBookmarks,
  OutageTimeline,
  DesignChoices,
];
