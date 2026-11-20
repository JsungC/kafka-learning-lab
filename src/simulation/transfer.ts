import { initialLog, transitionLog } from "./log";
import { initialState, step } from "./core";
export type TransferCondition = "expired" | "durable-direct" | "published-only";

export function transferEvidence(condition: TransferCondition) {
  if (condition === "expired") {
    let log = initialLog(1, 6);
    log = transitionLog(log, { type: "append", partition: 0 });
    log = transitionLog(log, { type: "read", partition: 0 });
    log = transitionLog(log, { type: "append", partition: 0 });
    for (let i = 0; i < log.retention; i++)
      log = transitionLog(log, { type: "wait" });
    log = transitionLog(log, { type: "read", partition: 0 });
    return {
      kind: "expired" as const,
      retained: log.partitions[0].records.some(
        (record) => record.eventId === 2,
      ),
      lastRead: log.reads.at(-1)?.eventId,
      explanation:
        "The last sale counted is still 001. Analytics needs 002. Its bookmark remembers a place, but the ticket at that place has expired. The confirmation remains valid even though the report cannot fetch the sale here.",
    };
  }
  const retry = condition === "durable-direct";
  let state = step(initialState(retry ? "direct" : "log"), { type: "step" });
  state = step(state, { type: "analytics", paused: true });
  state = step(state, { type: "step" });
  const counted = state.analytics.includes(2);
  return {
    kind: "status" as const,
    rows: [
      [
        retry ? "Retry storage" : "Orders log",
        retry ? "Empty" : "001",
        retry
          ? state.missed.map((id) => String(id).padStart(3, "0")).join(", ")
          : state.retained.map((o) => o.name.slice(-3)).join(", "),
      ],
      ["Report total", "1 sale", counted ? "2 sales" : "1 sale"],
    ] as [string, string, string][],
    explanation: retry
      ? "In this version the retry worker can pick up the saved call for 002 after restart. It still has to reach analytics and update the report. A durable retry can recover a missed call when delivery later succeeds."
      : "The extra ticket tells support the shop recorded 002. The confirmation tells them notifications acted on it. Only evidence of the report update lets support say that the sales total includes 002.",
  };
}
