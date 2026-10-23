import { initialLog, transitionLog, retainedCount } from "./log";
import { initialState, step } from "./core";
export type TransferCondition = "expired" | "durable-direct" | "published-only";
export function transferEvidence(condition: TransferCondition) {
  if (condition === "expired") {
    let s = initialLog(1, 3);
    for (let i = 0; i < 3; i++)
      s = transitionLog(s, { type: "append", partition: 0 });
    for (let i = 0; i < 3; i++) s = transitionLog(s, { type: "wait" });
    return {
      metrics: [
        ["Produced", s.produced],
        ["Retained", retainedCount(s)],
        ["Expired", s.expired],
      ] as [string, number][],
      explanation:
        "All three records expired in this model before the reader resumed. Seeking cannot recreate deleted history. Independent subscriptions only help while the needed records remain available.",
    };
  }
  if (condition === "durable-direct") {
    let s = step(initialState("direct"), { type: "analytics", paused: true });
    for (let i = 0; i < 3; i++) s = step(s, { type: "step" });
    const stored = [...s.missed];
    const delivered = [...stored];
    return {
      metrics: [
        ["Initially unavailable", s.missed.length],
        ["Durably pending", stored.length],
        ["Delivered on retry", delivered.length],
      ] as [string, number][],
      explanation:
        "Under this changed assumption, every failed analytics delivery was durably recorded and later retried successfully. Direct delivery can now recover these events too. This is an illustrative retry queue, not a Kafka guarantee or a simulation of database atomicity; a real design must make recording and retrying reliable and handle duplicates.",
    };
  }
  const s = step(
    step(initialState("log"), { type: "analytics", paused: true }),
    { type: "step" },
  );
  return {
    metrics: [
      ["Published", s.orders.length],
      ["Retained", s.retained.length],
      ["Analytics processed", s.analytics.length],
    ] as [string, number][],
    explanation:
      "The log accepted one event while analytics was paused. Publication success does not mean the downstream report is updated. Show an accepted or pending status unless you have evidence that the required business work finished.",
  };
}
