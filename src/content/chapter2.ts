export const chapter2Lessons = [
  {
    id: "records",
    title: "2.1 / From an event to a stored record",
    paragraphs: [
      "Yesterday the shop needed to tell two services that an order was placed. Today the support team asks a different question: “Can we inspect the original orders and rebuild a report?” If delivery immediately destroys a message, the evidence is gone. A retained log separates storing a fact from reading it.",
      "A record is one stored entry. Its value contains the event data: for example, an order identifier and the fact that the order was placed. A key is optional data associated with that value, such as a customer identifier. Records can also have timestamps and headers. The business identifier inside the value is not the same thing as Kafka’s record offset. An event ID in these examples is application data, not a universal field Kafka automatically uses to prevent duplicates.",
      "The producer uses a Kafka client to send a record to a topic. The broker stores it in one of that topic’s partitions. A topic is a logical named stream, not another application that runs beside your service. In this chapter, orders is the topic, and its partitions are the individual ordered logs.",
      "The record cards below show the event identifier, key, value, partition, and offset separately. These fields answer different questions: what happened, whom it concerns, and where this stored copy can be found. We use readable strings; real clients serialize keys and values into bytes.",
    ],
  },
  {
    id: "partitions",
    title: "2.2 / A topic contains ordered partition logs",
    paragraphs: [
      "Append-only means a new record is added after earlier records in its partition. Producing a new order does not edit an older order in place. A correction can be represented by a later event. Reusing a key does not update an earlier record in place: repeated writes with the same key can coexist at different offsets. Compaction, introduced later, is a cleanup policy rather than an immediate overwrite. Retention may eventually remove old log data, so append-only does not mean the storage grows forever.",
      "A topic can have one partition or several. Each partition has its own sequence of offsets and its own ordering. Partition 0 offset 0 and partition 1 offset 0 are different locations. An offset alone is therefore not a topic-wide record identifier: use the topic, partition, and offset together within that topic’s lifetime. These coordinates identify a stored entry, not a business-level duplicate-protection rule.",
      "With one partition, the stored append order is straightforward to inspect. With two partitions, you can compare their separate sequences, but cannot infer one Kafka-guaranteed global order across them. Similar-looking timestamps do not create that guarantee.",
      "In the experiment, select a partition explicitly before appending. This manual selection is a teaching control, not a demonstration of Kafka’s default partitioner. Chapter 3 will connect keys and partition selection, with fixed partition-count and partitioner assumptions. Changing partition count here resets the model rather than simulating a live topic change.",
    ],
  },
  {
    id: "offsets",
    title: "2.3 / Read a location, then read it again",
    paragraphs: [
      "An offset is a position assigned to a record within a partition. Our simple examples append offsets 0, 1, and 2. Real retained logs do not always present gapless offsets, so do not treat “number of records” as interchangeable with “next offset.” The lab uses consecutive offsets to make the first example easy to follow.",
      "The next read position is separate from the stored record. After reading offset 0, our reader advances to position 1. The record at offset 0 stays in the log while retention keeps it. Fetching bytes, successfully finishing business work, and saving a restart position are different actions; the lab’s read observation does not prove that an email or database update completed. Reading is like moving a bookmark, not tearing out the page.",
      "Seeking changes where the reader will look next. Seek earliest retained, then read again, to replay available history. Seeking to the end chooses the next offset after the current log; it skips existing records and waits for new ones. Neither action rewrites records or performs business work by itself.",
      "Replaying a record can cause business work to run again. A retained log does not by itself prevent a second email or database update. We model read observations only, not external effects. Chapter 5 will distinguish reading from completed processing and committed restart positions; this chapter does not simulate commits or promise restart recovery.",
    ],
  },
  {
    id: "retention",
    title: "2.4 / Retention limits what remains replayable",
    paragraphs: [
      "A reader can catch up only while the records it needs still exist. For a topic using the delete cleanup policy, time-based and size-based retention settings can make older log segments eligible for deletion. Both limits can matter: enough time allowance alone does not protect history if a configured size limit is exceeded. Consumption does not extend a record’s lifetime, and an unread record is not protected merely because a consumer needs it.",
      "Choose a recovery window that covers the outage and the time needed to catch up. In this lab every append, read, or wait advances one model step. A record expires when its age reaches the chosen step limit. Seeking does not advance time. This exact per-record cleanup is deliberately simpler than Kafka, where deletion operates on eligible log segments and cleanup is not an exact per-record timer.",
      "When the reader’s position refers to deleted history, the lab reports that the position is no longer retained. It requires you to choose the earliest retained position explicitly. Real Kafka’s response depends on client settings and error handling; skipping unavailable history is not the same as recovering it.",
      "Compaction is a different cleanup policy that can retain the latest value for a key rather than every historical event. We do not model compaction, replication, failed writes, transactions, or network timing here. All step counts are educational model values, not Kafka performance measurements.",
    ],
  },
];
export const logLabCopy = {
  intro:
    "Predict before you run: if a reader processes every record, how many should remain? Then append three orders, read them, seek back, and read them again. Finally choose a short retention window and observe unavailable history.",
  assumptions:
    "Educational model: one or two manually selected partitions, consecutive assigned offsets, a single reader with a position per partition, successful writes, and exact step-based expiration. No commits, replication, compaction, real brokers, or external business effects. Configuration changes reset the experiment.",
  mission:
    "Support needs the three original order events after a four-step outage, then needs to read all three a second time. Choose retention and the initial reading position. The validator produces three events, waits four steps, reads three times, seeks earliest, and reads three more times. Both passes must recover all three originals; reading must not delete records.",
  hints: [
    "Allow time for the outage and for reading, not only the moment the reader resumes.",
    "Starting at the end intentionally skips existing records. Historical reporting needs the earliest retained record.",
    "A 12- or 24-step window with an earliest-retained start satisfies this fixed scenario. Both configurations are accepted; longer retention can require more storage in a real system.",
  ],
};
