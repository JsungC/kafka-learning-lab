import { useState } from "react";
import { transferCases } from "../content/transfer";
import { transferEvidence } from "../simulation/transfer";
import type { Progress } from "../persistence/progress";
export function TransferLab({
  progress,
  update,
}: {
  progress: Progress;
  update: React.Dispatch<React.SetStateAction<Progress>>;
}) {
  const [index, setIndex] = useState(0);
  const item = transferCases[index];
  const id = `transfer-${item.id}`;
  const answer = progress.review?.[id];
  const evidence = answer?.checked ? transferEvidence(item.id) : null;
  function save(choice: string, checked: boolean) {
    update((p) => ({
      ...p,
      review: { ...p.review, [id]: { choice, checked } },
    }));
  }
  return (
    <section
      className="lesson-visual"
      aria-label="Apply the idea when assumptions change"
    >
      <span className="eyebrow">TRANSFER / CHANGE THE ASSUMPTION</span>
      <h3>Would your explanation still hold?</h3>
      <p>
        Make a prediction before revealing the model evidence. Changing an
        assumption can change the outcome; Kafka is not automatically the right
        answer. Your predictions are saved locally as concept practice, separate
        from the mission and chapter completion.
      </p>
      <div
        className="requirement-options"
        role="group"
        aria-label="Changed conditions"
      >
        {transferCases.map((c, i) => (
          <button
            key={c.id}
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <p className="review-scenario">{item.scenario}</p>
      <fieldset className="review-options">
        <legend>{item.question}</legend>
        {item.options.map((o) => (
          <label className="review-option" key={o.id}>
            <input
              type="radio"
              name="transfer-prediction"
              checked={answer?.choice === o.id}
              disabled={Boolean(answer?.checked)}
              onChange={() => save(o.id, false)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </fieldset>
      <div className="controls">
        <button
          className="primary"
          disabled={!answer?.choice || answer.checked}
          onClick={() => save(answer!.choice, true)}
        >
          Reveal model evidence
        </button>
        <button disabled={!answer?.choice} onClick={() => save("", false)}>
          Retry prediction
        </button>
      </div>
      <div aria-live="polite">
        {evidence && (
          <>
            <div className="snapshot-metrics">
              {evidence.metrics.map(([name, n]) => (
                <div key={name}>
                  <span>{name}</span>
                  <strong>{n}</strong>
                </div>
              ))}
            </div>
            <div
              className={`feedback ${answer?.choice === item.correct ? "success" : "partial"}`}
            >
              <strong>
                {answer?.choice === item.correct
                  ? "Your prediction fits the changed assumptions."
                  : "Revisit the assumption behind your prediction."}
              </strong>
              <p>{evidence.explanation}</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
