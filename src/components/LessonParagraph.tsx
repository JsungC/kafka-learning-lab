import { Text } from "@astryxdesign/core/Text";
import { keySentences } from "../content/emphasis";
export function LessonParagraph({
  text,
  themed = false,
}: {
  text: string;
  themed?: boolean;
}) {
  const phrase = keySentences.find((s) => text.includes(s));
  const Paragraph = themed ? ThemedParagraph : "p";
  if (!phrase) return <Paragraph>{text}</Paragraph>;
  const index = text.indexOf(phrase);
  return (
    <Paragraph>
      {text.slice(0, index)}
      <strong className="learning-emphasis">{phrase}</strong>
      {text.slice(index + phrase.length)}
    </Paragraph>
  );
}

function ThemedParagraph({ children }: { children: React.ReactNode }) {
  return (
    <Text as="p" type="body">
      {children}
    </Text>
  );
}
