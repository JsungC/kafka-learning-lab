export const orderingLessons = [
  {
    id: "boundary",
    title: "3.1 / Decide whose order matters",
    paragraphs: [
      "The shop can process Alice’s orders independently from Bob’s, but its customer activity view must not show Alice’s third event before her first. This is an ordering requirement about one customer, not about every event in the business. Start by naming the entity whose sequence must stay together.",
      "Kafka orders records within a partition. It does not merge all partitions into a single globally ordered stream. If a customer’s events cross partitions, one lane can run ahead of another. The broker can preserve each lane perfectly while the application observes that customer’s events in the wrong order.",
      "The lab supplies nine already ordered input events for three customers. The sequence labels describe their source order, not Kafka offsets. Values represent different orders from the same customer, so a unique order or event identifier is not a substitute for the customer identity when the requirement is customer-wide ordering.",
    ],
  },
  {
    id: "key",
    title: "3.2 / Use a key that matches the requirement",
    paragraphs: [
      "A record key is optional data sent with a value. When the producer’s partitioning logic uses the key, a deterministic rule maps it to a partition. With a fixed partition count, the same serialized key bytes, and the same deterministic partitioning rule, the same key maps to the same partition.",
      "Use customer-a for every event belonging to that customer, even when the order identifier changes. Different keys can still collide in the same partition: a key does not reserve an exclusive lane. A constant key sends all these records to one lane, which limits parallel work. A unique event key spreads the identities you needed to keep together.",
      "Keys are not unique database constraints and do not prevent duplicates. They also do not sort records by timestamp or repair events that arrive in the wrong business order. If multiple producers publish for the same customer, the partition reflects the order accepted into the log, not an automatically reconstructed customer timeline.",
    ],
  },
  {
    id: "partitioner",
    title: "3.3 / Make the partitioner assumptions explicit",
    paragraphs: [
      "For a readable example, this lab adds the Unicode code-point numbers in the key and takes the remainder after division by the partition count. The resulting partition number runs from zero to count minus one. The mapping inspector shows the calculation. This teaching function is not Kafka’s Java client hash and must not be used to predict actual Kafka partition numbers.",
      "The Kafka 4.2.0 Java producer’s ordinary keyed partitioning uses a hash when no explicit partition is supplied and key-based routing is enabled. A custom partitioner, an explicit partition, a different client or serializer, or a setting that ignores keys can change the result. A keyless record must not be assumed to follow this keyed rule; the lab’s round-robin keyless mode is deliberately illustrative, not the Java producer’s sticky or adaptive keyless behavior.",
      "Partition count is part of the mapping. In a modulo-based rule, changing the count can move a key’s future records to a different partition while its older records remain where they were. Existing records are not redistributed automatically to repair this split. The inspector compares hypothetical counts side by side; changing the lab’s configuration resets the scenario rather than performing a live topic expansion.",
    ],
  },
  {
    id: "processing",
    title: "3.4 / Parallel work needs ordered processing within each lane",
    paragraphs: [
      "The lab publishes all nine records in source order, then processes partitions independently. Partition 0 takes three model ticks per record; other partitions take one. A partition never starts its next record before finishing the current one. The uneven speeds expose what happens when one customer is split across lanes.",
      "Stable customer placement allows different customers to make progress in parallel while each customer’s records remain sequential. More partitions do not guarantee more throughput: a hot key can dominate one partition, keys can collide, and real consumer assignment and available processing capacity also matter. Chapter 4 will explain consumer groups and which consumers can own those partitions.",
      "Kafka’s ordered log does not automatically order the completion of external business effects. If your application fetches two records and processes them concurrently without coordination, the later effect can finish first even within one partition. This model deliberately uses serial processing per partition; it does not model threads, external databases, retries, failed sends, commits, replication, or benchmarks.",
      "Producer failures and retry settings can also affect ordering. We assume a single ordered source with successful publication here. Kafka 4.2.0 documents that retries with idempotence disabled and multiple in-flight requests can reorder sends after failures. Reliability chapters will study those settings; do not read this lab as an unconditional end-to-end ordering guarantee.",
    ],
  },
];
export const keyStrategies = [
  { id: "customer", label: "Customer ID · stable per customer" },
  { id: "event", label: "Event ID · unique for each event" },
  { id: "constant", label: "Constant key · all orders together" },
  { id: "unkeyed", label: "No key · teaching round-robin" },
] as const;
export const orderingHints = [
  "Name the ordering boundary first: all events for one customer must stay on the same lane.",
  "A unique event key changes on every write. A constant key keeps everyone together. A customer key keeps related events together without forcing all customers into one lane.",
  "Customer ID with 2, 3, or 4 fixed partitions meets this scenario. All are accepted. More partitions still do not guarantee real-world throughput or one lane per customer.",
];
export const orderingAssumptions =
  "Educational model: one source publishes nine events in known order; fixed 1–4 partitions; readable code-point-sum partitioner (not Kafka’s hash); illustrative round-robin when keyless; no expiration or failed writes; serial processing per partition; P0 takes 3 model ticks per record, others 1. All timing is simulated, not a Kafka benchmark.";
