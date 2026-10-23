export const visualCopy = {
  event: {
    label: "01 / MAKE THE FACT CONCRETE",
    title: "One fact. More than one useful reaction.",
    caption:
      "An illustrative event describes what already happened. Each service decides how to react; the event is not an instruction to send an email.",
    record: [
      ["eventId", "evt-001", "Identifies this event"],
      ["type", "order.placed", "Names the fact"],
      ["orderId", "order-001", "Identifies the order"],
    ],
    producer: "Order service",
    action: "Customer places an order",
    topic: "OrderPlaced event",
    consumers: [
      ["Notifications", "Send a confirmation"],
      ["Analytics", "Update sales totals"],
    ],
    takeaway:
      "The same fact can support different work. The producer does not need to encode each reader’s business logic.",
  },
  readers: {
    label: "02 / MOVE THE BOOKMARK",
    title: "Shared records. Separate reading progress.",
    caption:
      "Six orders have already been written. Notifications processed all six; analytics starts paused. Read one retained event at a time and watch only the analytics bookmark move.",
    log: "Retained orders",
    notification: "Notifications",
    analytics: "Analytics",
    read: "Read next analytics event",
    reset: "Reset bookmarks",
    done: "All six analytics events processed. Reset to explore again.",
    limit:
      "One educational log, independent subscriptions, successful processing, and no expiration. These are counts of processed records, not Kafka committed offsets. Real independent subscriptions use separate consumer groups.",
  },
  outage: {
    label: "03 / FOLLOW CAUSE AND EFFECT",
    title: "An outage changes the reader, not the record.",
    caption:
      "Select a snapshot to trace the same deterministic scenario. All counts below come from the chapter’s simulation engine. Steps are model actions, not elapsed seconds.",
    stages: [
      {
        name: "Before outage",
        why: "Order 1 has reached both consumers. Both reading positions have advanced.",
      },
      {
        name: "Analytics paused",
        why: "Orders 2 and 3 are retained. Notifications keep processing; analytics has two pending events.",
      },
      {
        name: "Reader resumes",
        why: "Order 4 arrives. Analytics reads the older order 2 first; new arrivals can keep the backlog from shrinking immediately.",
      },
      {
        name: "Caught up",
        why: "After production stops, analytics drains its backlog. Both consumers processed all six orders, and the six records still remain.",
      },
    ],
    retentionTitle: "Recovery has a boundary",
    retention: [
      [
        "While the records are retained",
        "A reader can catch up from its own position.",
      ],
      [
        "After needed records expire",
        "The reader cannot recover those records from this log.",
      ],
    ],
    limit:
      "The snapshots do not expire events. This boundary diagram describes real retention conceptually; it is not a retention simulator. Compaction is a different policy.",
  },
  choice: {
    label: "04 / CONNECT THE REQUIREMENT TO THE DESIGN",
    title: "Choose for the job, not the technology.",
    caption:
      "Select a requirement to compare a useful starting point. These are design prompts, not a universal architecture rule or a graded exercise.",
    options: [
      {
        name: "An immediate answer",
        need: "The customer needs to know whether a request succeeded now.",
        design: "Direct request / response",
        path: ["Caller", "Service", "Response"],
        tradeoff:
          "A direct call can be the clearest fit. Handle timeouts and failures explicitly. Publishing an event alone does not provide the final business result.",
      },
      {
        name: "One background task",
        need: "A small application needs work to happen later, with one logical worker role.",
        design: "A job queue may be enough",
        path: ["Application", "Job queue", "Worker"],
        tradeoff:
          "A queue can separate the work from the request. Retry, durability, and delivery semantics depend on the chosen implementation; a queue does not automatically provide independent replayable subscriptions.",
      },
      {
        name: "Independent readers & recovery",
        need: "Notifications and analytics need the same facts and must recover at different times.",
        design: "A retained event stream",
        path: ["Producer", "Retained topic", "Independent readers"],
        tradeoff:
          "Retained records and separate reading progress support this requirement. Choose retention carefully and account for operational cost, duplicate processing, and event contracts.",
      },
    ],
  },
};
