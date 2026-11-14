import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { Heading } from "@astryxdesign/core/Heading";
import { ChapterButton } from "./ChapterButton";
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
      <Heading level={3}>Would your explanation still hold?</Heading>
      <Text as="p" type="body">
        Make a prediction before revealing the model evidence. Changing an
        assumption can change the outcome; Kafka is not automatically the right
        answer. Your predictions are saved locally as concept practice, separate
        from the mission and chapter completion.
      </Text>
      <HStack
        gap={3}
        wrap="wrap"
        className="requirement-options"
        role="group"
        aria-label="Changed conditions"
      >
        {transferCases.map((c, i) => (
          <ChapterButton
            key={c.id}
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
          >
            {c.label}
          </ChapterButton>
        ))}
      </HStack>
      <Text as="p" type="body" className="review-scenario">
        {item.scenario}
      </Text>
      <RadioList
        label={item.question}
        value={answer?.choice ?? ""}
        htmlName="transfer-prediction"
        isDisabled={Boolean(answer?.checked)}
        onChange={(value) => save(value, false)}
      >
        {item.options.map((o) => (
          <RadioListItem
            key={o.id}
            value={o.id}
            label={o.label}
            align="first-line"
          />
        ))}
      </RadioList>
      <HStack gap={3} wrap="wrap" className="chapter-actions">
        <ChapterButton
          className="primary"
          disabled={!answer?.choice || answer.checked}
          onClick={() => save(answer!.choice, true)}
        >
          Reveal model evidence
        </ChapterButton>
        <ChapterButton
          disabled={!answer?.choice}
          onClick={() => save("", false)}
        >
          Retry prediction
        </ChapterButton>
      </HStack>
      <VStack gap={3} aria-live="polite">
        {evidence && (
          <>
            <VStack gap={3} className="snapshot-metrics">
              {evidence.metrics.map(([name, n]) => (
                <VStack gap={3} key={name}>
                  <span>{name}</span>
                  <strong>{n}</strong>
                </VStack>
              ))}
            </VStack>
            <VStack
              gap={3}
              className={`feedback ${answer?.choice === item.correct ? "success" : "partial"}`}
            >
              <strong>
                {answer?.choice === item.correct
                  ? "Your prediction fits the changed assumptions."
                  : "Revisit the assumption behind your prediction."}
              </strong>
              <Text as="p" type="body">
                {evidence.explanation}
              </Text>
            </VStack>
          </>
        )}
      </VStack>
    </section>
  );
}
