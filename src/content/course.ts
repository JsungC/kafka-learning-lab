export const chapters = [
  [
    "Events and why Kafka exists",
    "Events · independent readers · asynchronous work",
  ],
  ["Topics and event logs", "Records · partitions · offsets · retention"],
  ["Keys and ordering", "Customer keys · local ordering · parallelism"],
  ["Consumer groups and scaling", "Shared work · independent subscriptions"],
  ["Offsets and replay", "Read position · commits · restart behavior"],
  ["Brokers and replication", "Leaders · replicas · acknowledgments"],
  [
    "Delivery guarantees and idempotency",
    "Retries · duplicate effects · database boundaries",
  ],
  ["Lag and failure handling", "Backlogs · retries · poison events"],
  ["Event contracts and integration", "Schemas · Connect · Streams · Outbox"],
  ["Capstone system design", "Requirements · recovery · trade-offs"],
];
export const lesson = [
  {
    title: "Start with an order, not a broker",
    paragraphs: [
      "Imagine a small shop. A customer places an order, and the shop needs to send a confirmation and update a sales dashboard. An event is a record that something happened: “Order 001 was placed.” It describes a fact, rather than asking another service to do something.",
      "A service is a program responsible for a particular job. With direct connections, the order service contacts notification and analytics services itself. HTTP (Hypertext Transfer Protocol) is a common way for programs to make requests and receive responses. If the order service waits for every response, a slow analytics service can delay the customer. Even if it does not wait, failed deliveries need an explicit recovery strategy.",
      "In this lesson, direct delivery is deliberately a simple model: notifications work, analytics may be unavailable, and failed analytics deliveries are not stored or retried. Real applications can add retries and durable storage. Kafka is one way to separate recording an event from processing it later—not the only way.",
    ],
  },
  {
    title: "Keep the fact. Let each reader work.",
    paragraphs: [
      "A producer is a program that writes events. A topic is a named stream of records, such as orders. A consumer is a program that reads records and does useful work with them. Kafka stores topic records in an event log: a sequence to which new records are appended.",
      "Instead of contacting every downstream service, the order producer writes to the orders topic. Notification and analytics consumers read independently. Asynchronous processing means that the producer and downstream work do not need to finish together. Publishing successfully does not mean a confirmation has already been sent or a dashboard updated.",
      "Think of a shared notebook with a separate bookmark for each reader. Reading a page does not tear it out, and one reader can stop without moving the other reader’s bookmark. The analogy explains independent reading, but Kafka is a distributed system with partitions, replication, and explicit retention policies—not an endless notebook.",
    ],
  },
  {
    title: "What happens when analytics stops?",
    paragraphs: [
      "First, the producer appends an order event. Next, notifications read it and send a confirmation. Analytics can be paused while notifications continue. After analytics resumes, it reads the retained events it has not processed. Consuming a record does not itself delete it.",
      "This experiment uses one ordered log and a separate read position for each service. In real Kafka, independent subscriptions are normally implemented using distinct consumer groups. Members of the same group share work rather than each receiving every record. Chapter 4 introduces that mechanism; you do not need to configure it here.",
      "Retention determines how long records remain available, independently of whether consumers have read them. If analytics stays offline beyond retention, recovery can fail. Our six-event model never expires records. Kafka also supports compaction, a different cleanup policy that we cover later. Neither policy promises infinite history.",
    ],
  },
  {
    title: "When is Kafka worth the complexity?",
    paragraphs: [
      "Kafka can be useful when several independent systems need the same event stream, readers need to recover after interruptions, or events need to be read again. A retained stream decouples processing schedules, but teams still need monitoring, capacity planning, and clear event contracts.",
      "A simple request that must return an immediate result may be clearer as a direct call. A small application with one background task may be well served by a job queue. Adding Kafka does not automatically make a system faster, eliminate duplicate processing, or make database changes atomic. Choose based on requirements and operating cost.",
      "By the end of this chapter, you should be able to identify producers, topics, and consumers; explain why a paused reader need not stop another; and choose a delivery model that lets a recovering reader catch up. No prior Kafka knowledge or local software installation is required.",
    ],
  },
];
export const glossary = [
  [
    "Event",
    "A record of something that happened, such as an order being placed.",
  ],
  ["Producer", "A program that writes records to a Kafka topic."],
  [
    "Topic",
    "A named stream of records. Real topics contain one or more partitions.",
  ],
  ["Consumer", "A program that reads and processes records."],
  [
    "Asynchronous processing",
    "Work that can happen later without the caller waiting for its completion.",
  ],
  [
    "Retention",
    "A policy controlling how long or how much log data remains available, independently of consumption.",
  ],
  [
    "Consumer group",
    "A set of consumers sharing reading work. Different groups can independently read the same stream.",
  ],
  [
    "Event log",
    "An ordered sequence of appended records; Kafka ordering is within each partition.",
  ],
];
export const hints = [
  "Which option stores facts while a reader is unavailable?",
  "Notifications and analytics need separate reading progress. Reading must not remove the shared record.",
  "Use the retained event log with independent subscriptions. Analytics can resume from its own position while notifications keep working.",
];
export const questions = [
  [
    "Why does analytics pausing not stop notifications?",
    "Each service has independent reading progress. The log retains records for analytics while notifications continue. In real Kafka, use separate consumer groups for these independent subscriptions.",
  ],
  [
    "Does reading an event remove it?",
    "No. Consumption and retention are separate. A record remains readable only while the retention policy keeps it.",
  ],
  [
    "When might direct connections be appropriate?",
    "For immediate request/response work, or a simpler system where the cost of a retained streaming platform is not justified. Recovery needs can also be addressed by other durable designs.",
  ],
];
export const ui = {
  brand: "Kafka Learning Lab",
  tagline: "Small experiments. Durable understanding.",
  mission: "Mission: keep the shop moving",
  scenario:
    "A promotion creates six order events. Analytics is offline during the first three. Choose a delivery design that keeps every notification flowing and lets analytics process all six orders after it recovers.",
  assumptions:
    "Educational model: six fixed events, one log, independent subscriptions, one event processed per step, no expiration, and successful producer writes. No real Kafka cluster, network, disks, retries, commits, or performance measurements.",
};
