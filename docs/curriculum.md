# Curriculum boundaries

The required learning path runs entirely in the browser. Optional real-Kafka practice connects model observations to broker output without becoming a prerequisite for the course.

## Concept progression

- Chapter 1 introduces events, independent readers, and asynchronous processing. Its execution map distinguishes application code, Kafka client libraries, brokers, topics, and the browser model. Changed-assumption activities cover expiration, durable retries in a direct-delivery design, and publication versus processing.
- Chapter 2 separates four lessons: record fields; partition-local logs; record offsets and reading positions; and retention. It introduces replay of available history without modeling committed positions or restart recovery.
- Chapter 3 will teach keys and partition selection under explicit partitioner and partition-count assumptions. Manual partition selection in Chapter 2 is not presented as the default Kafka partitioner.
- Chapter 4 will teach group assignment and scaling. Chapter 5 will distinguish current position, completed processing, committed position, and restart behavior. A later optional client-code exercise belongs after that material.
- Broker existence is introduced in Chapter 1; the reliability chapter concentrates on replication and broker failure.
- Event contracts and schema evolution are separate from database/publication failure windows and Outbox. Connect and Streams are optional deeper tracks rather than one overloaded beginner chapter. The capstone remains last.

## Chapter 2 model

`src/simulation/log.ts` supplies deterministic, immutable transitions shared by the inspector and report assessment. Each partition has independently assigned offsets, retained records, and a reader position. Record identifiers are separate from offsets. Seeking does not advance model time. Append, read, and wait actions advance one step and run exact age-based cleanup before their operation. Cleanup reports its effect separately from reading. Real Kafka uses log segments and configurable cleanup behavior; this is not a model of exact Kafka retention timing.

Replay repeats read observations only. No external effects, durable offset commits, transactions, broker failures, key hashing, or compaction are simulated. Expired offsets are not reused, and an out-of-range position requires an explicit earliest-retained seek. Multiple partitions do not imply a global order.

The report scenario appends three records, waits four steps, reads three times, seeks earliest retained, and reads three times again. Outcome validation accepts either a 12- or 24-step window with an earliest start. The 12-step case can expire the oldest record after it has already been replayed; retention is about availability when needed, not immortality.

## Evidence and completion

Reading, practice answers, experiment evidence, and mission success remain separate. Chapter 1 retains its original completion requirements. Chapter 2 requires observing a repeated read, observing expiration, and passing the report mission. Config changes reset the experiment state but preserve already observed activity evidence. The optional Chapter 2 field in schema version 1 is backward compatible; malformed chapter-specific data does not erase valid earlier progress.

Optional Kafka commands do not award automatic completion or proficiency badges. The guide uses the official `apache/kafka:4.2.0` image, a temporary single-node broker, synthetic records, and two fresh groups. It explains how `--from-beginning` depends on an absent valid stored group position and uses the supported `--formatter-property` option. Its output is separate from browser validation.

## References

Checked on 2026-10-23 against Apache Kafka 4.2.0 tagged sources:

- [Introduction](https://github.com/apache/kafka/blob/4.2.0/docs/getting-started/introduction.md)
- [Design](https://github.com/apache/kafka/blob/4.2.0/docs/design/design.md)
- [Quickstart](https://github.com/apache/kafka/blob/4.2.0/docs/getting-started/quickstart.md)

No claim is made that this is the latest Kafka version.
