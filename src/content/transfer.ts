import type { TransferCondition } from "../simulation/transfer";

export const transferCases: {
  id: TransferCondition;
  answerKey: string;
  label: string;
  scenario: string;
  question: string;
  options: { id: string; label: string }[];
  correct: string;
}[] = [
  {
    id: "expired",
    answerKey: "transfer-expired",
    label: "A longer outage",
    scenario:
      "Rewind to the same confirmation for 002. This time analytics stays offline until the shop’s retention window has passed. Its bookmark still points to 002.",
    question: "Can the report recover this sale from the orders log?",
    options: [
      { id: "no", label: "No. There is no copy of 002 left to fetch." },
      { id: "yes", label: "Yes. The bookmark keeps a copy for analytics." },
    ],
    correct: "no",
  },
  {
    id: "durable-direct",
    answerKey: "transfer-retry-status",
    label: "A saved retry",
    scenario:
      "Try the direct path again. This time the shop writes the failed call for 002 to durable storage. The shop restarts. Analytics is still offline.",
    question: "What should the shop show for this sale?",
    options: [
      {
        id: "finished",
        label: "Report updated. The retry survived the restart.",
      },
      { id: "waiting", label: "Update pending. A worker can send 002 again." },
    ],
    correct: "waiting",
  },
  {
    id: "published-only",
    answerKey: "transfer-report-evidence",
    label: "A support call",
    scenario:
      "The customer asks whether the sale is in the report. Support can see that Kafka accepted 002 and the confirmation reached the phone.",
    question: "What else should support check before saying yes?",
    options: [
      { id: "write", label: "Whether Kafka still stores 002." },
      {
        id: "mail",
        label: "Whether the confirmation contains the right order number.",
      },
      {
        id: "report",
        label: "Whether analytics applied 002 to the sales total.",
      },
    ],
    correct: "report",
  },
];
