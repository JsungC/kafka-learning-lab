// Curated learning principles: avoid highlighting entire paragraphs or every term.
export const keySentences = [
  "An event is a record that something happened: “Order 001 was placed.”",
  "Publishing successfully does not mean a confirmation has already been sent or a dashboard updated.",
  "Consuming a record does not itself delete it.",
  "A topic can have one partition or several.",
  "An offset alone is therefore not a topic-wide record identifier:",
  "The next read position is separate from the stored record.",
  "skipping unavailable history is not the same as recovering it.",
  "Kafka orders records within a partition.",
  "Different keys can still collide in the same partition:",
  "Keys are not unique database constraints and do not prevent duplicates.",
  "Partition count is part of the mapping.",
  "More partitions do not guarantee more throughput:",
  "Kafka’s ordered log does not automatically order the completion of external business effects.",
];
