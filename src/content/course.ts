export const chapters = [
  [
    "Events and why Kafka exists",
    "Events · independent readers · asynchronous work",
  ],
  ["Topics and event logs", "Records · partitions · offsets · retention"],
  ["Keys and ordering", "Customer keys · local ordering · parallelism"],
  ["Consumer groups and scaling", "Shared work · independent subscriptions"],
  [
    "Consumer positions and restart",
    "Read position · processing · commits · replay after restart",
  ],
  ["Replication and broker failures", "Leaders · replicas · acknowledgments"],
  [
    "Delivery guarantees and idempotency",
    "Retries · duplicate effects · database boundaries",
  ],
  ["Lag and failure handling", "Backlogs · retries · poison events"],
  [
    "Event contracts and schema changes",
    "Fields · compatibility · evolving consumers",
  ],
  [
    "Databases and event publication",
    "Failure windows · Outbox · reliable integration",
  ],
  ["Capstone system design", "Requirements · recovery · trade-offs"],
];
export const lesson = [
  {
    title: "Why does the dashboard still show one order?",
    paragraphs: [
      "The first customer places Order 001. A confirmation lands on their phone, and the sales dashboard ticks up to one. Then a second customer places Order 002. Their confirmation arrives too. The dashboard still says one. Where did the second order go?",
      "Start with what the shop knows. “Order 002 was placed” is a fact the shop can record. That record is an event. Sending a confirmation and updating the sales total are two jobs that follow from the same fact. Each job belongs to a different program, or service.",
      "Suppose the order service calls each of those programs directly. The notification service answers. The analytics service is offline. If checkout waits for both replies, a slow service makes the customer wait too. If the shop moves on, what will remind it to send 002 again? In our direct-delivery experiment the shop keeps no retry copy. Follow the same order through a design that keeps one shared log.",
    ],
  },
  {
    title: "Where can the report find Order 002?",
    paragraphs: [
      "Look at the middle of the log diagram. The order service wrote 001, then 002, to a stream named orders. Kafka calls a named stream a topic. Here it has one partition, so you can picture it as a single log with each new record added at the end.",
      "Follow 002 from the order service to the log. The program writing those tickets is the producer. Each program reading them is a consumer. As soon as Kafka accepts 002, the shop knows the event was recorded. The dashboard changes only when analytics does its own work. That gap between the write and the work is what asynchronous processing looks like here.",
      "Picture two people reading the same notebook. Each has a bookmark. Reading a page does not tear it out. Notifications can turn the page while analytics keeps its place. Try moving the analytics bookmark below and watch what happens to the row of tickets.",
    ],
  },
  {
    title: "How long can analytics wait?",
    note: {
      title: "What changes with shared groups or compaction?",
      text: "Members of one consumer group divide the partition work. The shop needs a separate group for each service that reads the whole stream. Chapter 4 explores this. A compacted log can keep the latest value for each key, so it may no longer contain every sale you want to replay.",
    },
    paragraphs: [
      "Analytics finished 001 before it went offline. Its next read starts with 002. Notifications has already used 002 to send the confirmation, but its bookmark belongs to notifications. The shop gives the two services separate Kafka consumer groups so each can follow the full stream.",
      "Now leave analytics offline for longer. Its bookmark still points to the same place. Is the page still there? Kafka keeps records according to the topic’s retention policy. A bookmark can point to a record that has expired. Once 002 is gone, analytics cannot rebuild that sale from this log.",
      "In the six-order experiment every order stays in the log. Use the snapshots below to follow a reader through that short outage, then compare the two possible endings underneath.",
    ],
  },
  {
    title: "Would the shop choose Kafka for every job?",
    note: {
      title: "What would the shop have to operate?",
      text: "A team running Kafka needs enough storage, monitoring and an event format its readers understand. It must handle duplicate work and decide how to recover if a database update succeeds but publication fails. A retry queue needs monitoring and duplicate handling too.",
    },
    paragraphs: [
      "Imagine the customer is still at checkout asking, “Did my payment go through?” A payment service can answer a direct request as soon as it knows the result. The shop needs to handle a timeout, but a ticket saying it received the request would leave the customer’s question open.",
      "Printing a packing slip later is a different job. One worker can take it from a job queue. For the sales dashboard, the shop wanted several readers to use the same history and catch up at different times. Keeping one log gives both services a place to come back to.",
      "There are other ways to recover a missed delivery. The shop could save each failed call and retry it when analytics returns.Which would the shop need to keep for tomorrow: a single unfinished job, or a history that several services can read again?",
    ],
  },
];
export const glossary = [
  [
    "Event",
    "A record of something that happened, such as an order being placed.",
  ],
  [
    "HTTP",
    "Hypertext Transfer Protocol. A service can use HTTP to send a request to another program and receive its response.",
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
  mission: "Mission: notifications and analytics recovery",
  scenario:
    "A promotion creates six order events. Analytics is offline during the first three. Choose a delivery design that keeps every notification flowing and lets analytics process all six orders after it recovers.",
  assumptions:
    "Educational model: six fixed events, one log, independent subscriptions, one event processed per step, no expiration, and successful producer writes. No real Kafka cluster, network, disks, retries, commits, or performance measurements.",
};

// Chapter 2 extends the beginner glossary without requiring later concepts.
glossary.push(
  [
    "Broker",
    "A Kafka server process that stores partition logs and handles client reads and writes.",
  ],
  [
    "Kafka client",
    "A library used by an application to communicate with Kafka brokers.",
  ],
  [
    "Record",
    "A stored entry with a value and optional key, timestamp, and headers.",
  ],
  ["Partition", "One ordered log within a topic, with its own offsets."],
  [
    "Offset",
    "A record’s assigned position within a partition, not a topic-wide identifier or proof of completed processing.",
  ],
  [
    "Read position",
    "The location a reader will fetch from next. It is distinct from a committed restart position.",
  ],
  [
    "Replay",
    "Reading retained records again by choosing an earlier reading position.",
  ],
  [
    "Compaction",
    "A cleanup policy that can retain the latest record for each key, rather than every historical event.",
  ],
);

// Ordering vocabulary extends the same English glossary.
glossary.push(
  [
    "Key",
    "Optional record data used by key-aware partitioning to keep related records together; it is not a uniqueness constraint.",
  ],
  [
    "Partitioner",
    "The producer-side rule that selects a partition, subject to the client, key encoding, configuration, and partition count.",
  ],
  [
    "Hot key",
    "A key with much more traffic than others, concentrating its ordered work on one partition under stable keyed routing.",
  ],
  [
    "Partition-local ordering",
    "The sequence of records within one partition, not a global order across the entire topic or automatic ordering of external effects.",
  ],
);

glossary.push(
  [
    "Group ID",
    "The identity of a logical consumer subscription. Members with the same group ID share partition work in the basic consumer-group model.",
  ],
  [
    "Partition assignment",
    "The mapping from subscribed partitions to consumer members within a group.",
  ],
  [
    "Rebalance",
    "Group coordination that can change partition ownership as membership or subscriptions change; exact behavior depends on protocol and assignor.",
  ],
);
