import { explainOrderingStep } from "../simulation/orderingTimeline";
import { orderingEvidence, type OrderingState } from "../simulation/ordering";
export function OrderingTimeline({
  states,
  index,
  onSeek,
  playing,
}: {
  states: OrderingState[];
  index: number;
  onSeek: (index: number) => void;
  playing: boolean;
}) {
  const note = explainOrderingStep(states, index);
  const milestones = [
    { at: 0, label: "Before" },
    { at: 9, label: "All routed" },
    {
      at: states.findIndex((s) => s.tick > 0 && !orderingEvidence(s).inOrder),
      label: "Inspect processing",
    },
    { at: states.length - 1, label: "Finished" },
  ].filter((m) => m.at >= 0);
  return (
    <div className="ordering-timeline">
      <div className="timeline-toolbar">
        <label htmlFor="ordering-playhead">
          Learning timeline · step {index} / {states.length - 1}
        </label>
        <span>{playing ? "Playing" : "Paused · explore at your pace"}</span>
      </div>
      <input
        id="ordering-playhead"
        type="range"
        min={0}
        max={states.length - 1}
        step={1}
        value={index}
        aria-valuetext={`Step ${index}: ${note.title}`}
        onChange={(e) => onSeek(Number(e.target.value))}
      />
      <div className="timeline-navigation">
        <button disabled={index === 0} onClick={() => onSeek(index - 1)}>
          Previous step
        </button>
        <div className="timeline-milestones">
          {milestones.map((m) => (
            <button key={m.label} onClick={() => onSeek(m.at)}>
              {m.label}
            </button>
          ))}
        </div>
        <button
          disabled={index === states.length - 1}
          onClick={() => onSeek(index + 1)}
        >
          Next step
        </button>
      </div>
      <section
        className="step-explanation"
        aria-label="Explanation for the selected timeline step"
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
  );
}
