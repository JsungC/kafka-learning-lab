import { keySentences } from "../content/emphasis";
export function LessonParagraph({ text }: { text: string }) {
  const phrase = keySentences.find((s) => text.includes(s));
  if (!phrase) return <p>{text}</p>;
  const index = text.indexOf(phrase);
  return (
    <p>
      {text.slice(0, index)}
      <strong className="learning-emphasis">{phrase}</strong>
      {text.slice(index + phrase.length)}
    </p>
  );
}
