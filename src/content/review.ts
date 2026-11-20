export const reviewItems = [
  {
    id: "independent-readers",
    title: "Who gets the next order?",
    scenario:
      "Analytics stops after 001. The next two orders arrive. Customers are still waiting for their confirmations.",
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
    link: "#reader-bookmarks",
    linkText: "Revisit the independent-consumption experiment",
  },
  {
    id: "retained-records",
    title: "Where will analytics pick up?",
    scenario:
      "The customer has the confirmation for 002. Analytics stopped after 001 and is just coming back. The shop keeps orders until tomorrow.",
    question: "Can analytics use 002 to update the report?",
    options: [
      {
        id: "deleted",
        text: "No. Notifications used up the ticket for 002.",
        correct: false,
        feedback:
          "Look at the log copy in both columns. Sending the confirmation moved the notification reader past 002. The ticket stayed on file for analytics.",
      },
      {
        id: "retained",
        text: "Yes. Its next ticket is 002, and the shop still has it.",
        correct: true,
        feedback:
          "Analytics finished 001 last time. It can open 002 now because the ticket is still on file. Only the last sale counted changes as the report catches up.",
      },
      {
        id: "forever",
        text: "Yes. Its bookmark will keep 002 available for as long as it needs.",
        correct: false,
        feedback:
          "Today the shop still has 002. A bookmark holds a place, not a second copy. Try the longer outage below to see what happens tomorrow.",
      },
    ],
    link: "#retention-boundary",
    linkText: "Compare a retained ticket with an expired ticket",
  },
  {
    id: "design-fit",
    title: "What should checkout wait for?",
    scenario:
      "At checkout a customer asks whether their payment went through. The shop needs the payment result before it can answer.",
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
          "A direct call may meet this immediate-response requirement with less complexity. If the call times out, the shop still has to find out what happened before it confirms payment.",
      },
    ],
    link: "#design-choices",
    linkText: "Revisit the design trade-offs",
  },
];
