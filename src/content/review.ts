export const reviewItems = [
  {
    id: "independent-readers",
    title: "Keep one reader moving",
    scenario:
      "Analytics goes offline after order 1. Orders 2 and 3 are still retained, and notifications must continue.",
    question:
      "Which design lets notifications continue and analytics catch up later?",
    options: [
      {
        id: "independent",
        text: "Give each service independent reading progress.",
        correct: true,
        feedback:
          "Notifications advance their own position. Analytics can resume from its separate position while the required records are still retained. In Kafka, these independent subscriptions normally use separate consumer groups.",
      },
      {
        id: "shared",
        text: "Put both services in one group so each receives every event.",
        correct: false,
        feedback:
          "Members of the same basic consumer group share partition work. That does not give both services the full stream. Use separate groups for independent subscriptions.",
      },
      {
        id: "wait",
        text: "Stop notifications until analytics comes back.",
        correct: false,
        feedback:
          "Waiting couples the two services and violates the requirement that notifications continue. A retained log with separate reading positions lets each service work at its own pace.",
      },
    ],
    link: "#experiment",
    linkText: "Revisit the independent-consumption experiment",
  },
  {
    id: "retained-records",
    title: "Reading is not deleting",
    scenario:
      "Notifications have processed order 2. Analytics has not read it yet. The record is still within the topic’s retention window.",
    question: "Can analytics still read order 2?",
    options: [
      {
        id: "deleted",
        text: "No. Notifications removed the record by reading it.",
        correct: false,
        feedback:
          "Consumption does not itself remove a Kafka record. Record availability is controlled by retention and cleanup policies, independently of this reader finishing its work.",
      },
      {
        id: "retained",
        text: "Yes. Its own reading progress can still reach the retained record.",
        correct: true,
        feedback:
          "The record remains available while the retention policy keeps it. Each independent reader has its own position. If the needed record expires before analytics catches up, this recovery path no longer works.",
      },
      {
        id: "forever",
        text: "Yes. Kafka keeps every event forever.",
        correct: false,
        feedback:
          "The answer is yes in this scenario, but not because storage is unlimited. Retention can remove old records. Independent reading does not promise an infinite recovery window.",
      },
    ],
    link: "#chapter-intro",
    linkText: "Revisit events and retention",
  },
  {
    id: "design-fit",
    title: "Choose for the requirement",
    scenario:
      "A small service must return an immediate answer to a customer. It does not need independent replayable subscriptions.",
    question: "What is a reasonable starting point?",
    options: [
      {
        id: "always-kafka",
        text: "Always add Kafka because it guarantees faster responses.",
        correct: false,
        feedback:
          "Kafka does not automatically make a request faster. A successful publication also does not mean a downstream consumer has completed the business operation.",
      },
      {
        id: "ignore",
        text: "Publish an event and immediately claim the business operation succeeded.",
        correct: false,
        feedback:
          "Recording a request or event is different from completing its business effect. The customer needs the final result in this scenario, so the response must reflect what actually completed.",
      },
      {
        id: "direct",
        text: "Consider direct request/response and handle failures explicitly.",
        correct: true,
        feedback:
          "A direct call may meet this immediate-response requirement with less complexity. It still needs timeout and failure handling. Reconsider a retained stream when independent readers, replay, or recovery justify it.",
      },
    ],
    link: "#chapter-intro",
    linkText: "Revisit the design trade-offs",
  },
];
