import type { TransferCondition } from "../simulation/transfer";
export const transferCases: {
  id: TransferCondition;
  label: string;
  scenario: string;
  question: string;
  options: { id: string; label: string }[];
  correct: string;
}[] = [
  {
    id: "expired",
    label: "Records expire",
    scenario:
      "Analytics returns only after all three needed records have expired. The services still have independent subscriptions.",
    question: "Can analytics recover these records from this log?",
    options: [
      { id: "yes", label: "Yes, separate subscriptions guarantee recovery." },
      { id: "no", label: "No, the needed history is no longer retained." },
    ],
    correct: "no",
  },
  {
    id: "durable-direct",
    label: "Direct delivery gains durable retries",
    scenario:
      "Change the original direct-delivery assumption: failed deliveries are now stored durably, the store survives the outage, and all three retries later succeed.",
    question: "Must this direct design still lose the three analytics events?",
    options: [
      { id: "yes", label: "Yes, direct designs always lose events." },
      {
        id: "no",
        label: "No, durable recording and successful retries can recover them.",
      },
    ],
    correct: "no",
  },
  {
    id: "published-only",
    label: "Publication is not processing",
    scenario:
      "The producer successfully writes an order event. Analytics is paused and has not processed it.",
    question: "Which status can the UI justify from this evidence?",
    options: [
      { id: "yes", label: "The analytics report is already updated." },
      {
        id: "no",
        label: "The event was accepted; analytics processing is still pending.",
      },
    ],
    correct: "no",
  },
];
