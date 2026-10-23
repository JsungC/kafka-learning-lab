import { reviewItems } from "../content/review";
import type { Progress } from "../persistence/progress";
import { localJump } from "./navigation";
export function ConceptReview({
  progress,
  update,
}: {
  progress: Progress;
  update: React.Dispatch<React.SetStateAction<Progress>>;
}) {
  function save(id: string, choice: string, checked: boolean) {
    update((p) => ({
      ...p,
      review: { ...p.review, [id]: { choice, checked } },
    }));
  }
  return (
    <div className="concept-review">
      <p>
        Recall the idea before revealing the explanation. Choose an answer,
        check the reasoning, and retry any concept you want to revisit. Your
        selections and checked answers are saved on this browser with your
        learning progress when storage is available.
      </p>
      <p className="review-note">
        This is a practice check, not a score or a chapter-completion
        requirement.
      </p>
      {reviewItems.map((item, index) => {
        const state = progress.review?.[item.id];
        const selected = item.options.find((o) => o.id === state?.choice);
        const checked = Boolean(state?.checked && selected);
        return (
          <div className="review-card" key={item.id}>
            <div className="review-heading">
              <span className="eyebrow">
                RECALL / {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={`review-state ${checked ? (selected?.correct ? "understood" : "revisit") : ""}`}
              >
                {checked
                  ? selected?.correct
                    ? "Concept checked"
                    : "Worth revisiting"
                  : "Think it through"}
              </span>
            </div>
            <h3>{item.title}</h3>
            <p className="review-scenario">{item.scenario}</p>
            <fieldset
              className="review-options"
              aria-describedby={`${item.id}-feedback`}
            >
              <legend>{item.question}</legend>
              {item.options.map((option) => (
                <label className="review-option" key={option.id}>
                  <input
                    type="radio"
                    name={item.id}
                    value={option.id}
                    checked={state?.choice === option.id}
                    disabled={checked}
                    onChange={() => save(item.id, option.id, false)}
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </fieldset>
            <div className="controls">
              <button
                className="primary"
                disabled={!selected || checked}
                onClick={() => save(item.id, selected!.id, true)}
              >
                Check reasoning
              </button>
              <button
                disabled={!selected}
                onClick={() => save(item.id, "", false)}
              >
                Try again
              </button>
            </div>
            <div id={`${item.id}-feedback`} aria-live="polite">
              {checked && (
                <div
                  className={`feedback ${selected?.correct ? "success" : "partial"}`}
                >
                  <strong>
                    {selected?.correct
                      ? "That reasoning fits."
                      : "Let’s look at the assumption."}
                  </strong>
                  <p>{selected?.feedback}</p>
                  {!selected?.correct && (
                    <a href={item.link} onClick={localJump}>
                      {item.linkText} →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
