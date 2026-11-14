import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { Heading } from "@astryxdesign/core/Heading";
import { ChapterButton } from "./ChapterButton";
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
    <VStack gap={3} className="concept-review">
      <Text as="p" type="body">
        Recall the idea before revealing the explanation. Choose an answer,
        check the reasoning, and retry any concept you want to revisit. Your
        selections and checked answers are saved on this browser with your
        learning progress when storage is available.
      </Text>
      <Text as="p" type="body" className="review-note">
        This is a practice check, not a score or a chapter-completion
        requirement.
      </Text>
      {reviewItems.map((item, index) => {
        const state = progress.review?.[item.id];
        const selected = item.options.find((o) => o.id === state?.choice);
        const checked = Boolean(state?.checked && selected);
        return (
          <VStack gap={3} className="review-card" key={item.id}>
            <HStack gap={3} wrap="wrap" className="review-heading">
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
            </HStack>
            <Heading level={3}>{item.title}</Heading>
            <Text as="p" type="body" className="review-scenario">
              {item.scenario}
            </Text>
            <RadioList
              label={item.question}
              value={state?.choice ?? ""}
              htmlName={item.id}
              isDisabled={checked}
              onChange={(value) => save(item.id, value, false)}
            >
              {item.options.map((option) => (
                <RadioListItem
                  key={option.id}
                  value={option.id}
                  label={option.text}
                  align="first-line"
                />
              ))}
            </RadioList>
            <HStack gap={3} wrap="wrap" className="chapter-actions">
              <ChapterButton
                className="primary"
                disabled={!selected || checked}
                onClick={() => save(item.id, selected!.id, true)}
              >
                Check reasoning
              </ChapterButton>
              <ChapterButton
                disabled={!selected}
                onClick={() => save(item.id, "", false)}
              >
                Try again
              </ChapterButton>
            </HStack>
            <VStack gap={3} id={`${item.id}-feedback`} aria-live="polite">
              {checked && (
                <VStack
                  gap={3}
                  className={`feedback ${selected?.correct ? "success" : "partial"}`}
                >
                  <strong>
                    {selected?.correct
                      ? "That reasoning fits."
                      : "Let’s look at the assumption."}
                  </strong>
                  <Text as="p" type="body">
                    {selected?.feedback}
                  </Text>
                  {!selected?.correct && (
                    <a href={item.link} onClick={localJump}>
                      {item.linkText} →
                    </a>
                  )}
                </VStack>
              )}
            </VStack>
          </VStack>
        );
      })}
    </VStack>
  );
}
