export const practiceSteps = [
  {
    title: "1. Start a disposable broker",
    command:
      "docker run --detach --rm --name kafka-learning-practice apache/kafka:4.2.0",
    explanation:
      "Run the official Kafka 4.2.0 image as a temporary broker. All commands below run inside this container, so no Java installation or published host port is needed. Use an unused container name; do not remove an existing container to resolve a name conflict. This single-node lab has no fault tolerance or persistent volume.",
  },
  {
    title: "2. Check readiness, then create a one-partition topic",
    command:
      "docker exec kafka-learning-practice /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list\n\ndocker exec kafka-learning-practice /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --if-not-exists --topic lab-orders --partitions 1 --replication-factor 1\n\ndocker exec kafka-learning-practice /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic lab-orders",
    explanation:
      "The first command asks the broker for its topics. If startup is not complete, inspect docker logs kafka-learning-practice and retry the readiness command before creating the topic. Creation requests one partition and one copy; describe should show PartitionCount: 1. A replication factor of one is for this disposable exercise, not a high-availability recommendation.",
  },
  {
    title: "3. Publish three facts",
    command:
      "printf 'order-001 placed\\norder-002 placed\\norder-003 placed\\n' | docker exec -i kafka-learning-practice /opt/kafka/bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic lab-orders",
    explanation:
      "The console producer is a client application. Each input line becomes a record value sent to the topic. No key is supplied in this small example. Run this once in a fresh container: running it again appends more records rather than replacing the first three.",
  },
  {
    title: "4. Read the retained records",
    command:
      "docker exec kafka-learning-practice /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic lab-orders --group lab-first --from-beginning --max-messages 3 --formatter-property print.partition=true --formatter-property print.offset=true",
    explanation:
      "A fresh consumer group starts at the beginning and prints three values with their partition and offset. In a fresh one-partition topic, expect partition 0 and offsets 0, 1, and 2. Offset ranges in other Kafka logs need not be gapless. The reader exits after three messages; this does not delete the log.",
  },
  {
    title: "5. Read the same facts with a new independent subscription",
    command:
      "docker exec kafka-learning-practice /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic lab-orders --group lab-replay --from-beginning --max-messages 3 --formatter-property print.partition=true --formatter-property print.offset=true",
    explanation:
      "Use this second, previously unused group to read the same three records. Compare partition, offset, and value with the first output. --from-beginning determines the initial position when no valid stored group position exists; it does not forcibly rewind an existing group. Explicit group management and restart behavior belong to Chapters 4 and 5.",
  },
  {
    title: "6. Stop only this practice broker",
    command: "docker stop kafka-learning-practice",
    explanation:
      "This stops the container you created. Because it was started with --rm and without a persistent volume, its temporary topic data is removed. Save any observations you want to keep before stopping it. Do not stop unrelated containers.",
  },
];
