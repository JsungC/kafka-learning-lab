export type KeyStrategy = "customer" | "event" | "constant" | "unkeyed";
export type OrderingConfig = { partitions: number; strategy: KeyStrategy };
export type CustomerEvent = {
  id: number;
  customer: string;
  sequence: number;
  value: string;
};
export type PlacedEvent = CustomerEvent & {
  key: string | null;
  partition: number;
  offset: number;
};
export type OrderingState = {
  config: OrderingConfig;
  published: number;
  tick: number;
  logs: PlacedEvent[][];
  positions: number[];
  remaining: number[];
  completed: (PlacedEvent & { tick: number })[];
  maxConcurrent: number;
  history: string[];
  message: string;
};
export const orderingInputs: CustomerEvent[] = [
  "a",
  "b",
  "a",
  "c",
  "b",
  "c",
  "a",
  "c",
  "b",
].map((name, index, all) => {
  const sequence = all.slice(0, index + 1).filter((c) => c === name).length;
  return {
    id: index + 1,
    customer: `customer-${name}`,
    sequence,
    value: `Order ${name.toUpperCase()}-${sequence} placed`,
  };
});
// Intentionally readable, NOT Kafka's Java key hash or keyless partitioner.
export function teachingHash(key: string) {
  return [...key].reduce((sum, char) => sum + char.codePointAt(0)!, 0);
}
export function partitionFor(
  key: string | null,
  partitions: number,
  inputIndex = 0,
) {
  if (!Number.isInteger(partitions) || partitions < 1 || partitions > 4)
    throw new Error("Choose 1–4 partitions");
  return (key === null ? inputIndex : teachingHash(key)) % partitions;
}
export function keyFor(event: CustomerEvent, strategy: KeyStrategy) {
  return strategy === "customer"
    ? event.customer
    : strategy === "event"
      ? `event-${event.id}`
      : strategy === "constant"
        ? "all-orders"
        : null;
}
export function initialOrdering(
  config: OrderingConfig = { partitions: 3, strategy: "customer" },
): OrderingState {
  partitionFor("", config.partitions);
  if (!["customer", "event", "constant", "unkeyed"].includes(config.strategy))
    throw new Error("Unknown key strategy");
  return {
    config: { ...config },
    published: 0,
    tick: 0,
    logs: Array.from({ length: config.partitions }, () => []),
    positions: Array(config.partitions).fill(0),
    remaining: Array(config.partitions).fill(0),
    completed: [],
    maxConcurrent: 0,
    history: [
      `Fixed partition count ${config.partitions}; strategy ${config.strategy}; teaching hash = code-point sum modulo partition count.`,
    ],
    message: "Publish records to inspect their key, partition, and offset.",
  };
}
export type OrderingAction = { type: "publish" } | { type: "process" };
export function stepOrdering(
  previous: OrderingState,
  action: OrderingAction,
): OrderingState {
  const s: OrderingState = {
    ...previous,
    logs: previous.logs.map((log) => [...log]),
    positions: [...previous.positions],
    remaining: [...previous.remaining],
    completed: [...previous.completed],
    history: [...previous.history],
  };
  if (action.type === "publish") {
    const event = orderingInputs[s.published];
    if (!event)
      return {
        ...s,
        message:
          "All nine records are published. Advance processing to drain the partitions.",
      };
    const key = keyFor(event, s.config.strategy);
    const partition = partitionFor(key, s.config.partitions, s.published);
    const record = {
      ...event,
      key,
      partition,
      offset: s.logs[partition].length,
    };
    s.logs[partition].push(record);
    s.published++;
    s.message = `Published ${event.customer} sequence ${event.sequence}: key ${key ?? "(none)"}, P${partition} offset ${record.offset}.`;
  } else {
    if (s.logs.every((log, p) => s.positions[p] >= log.length))
      return {
        ...s,
        message: "No pending records. Publish another event or reset the lab.",
      };
    s.tick++;
    let active = 0;
    const finished: string[] = [];
    for (let p = 0; p < s.logs.length; p++) {
      const record = s.logs[p][s.positions[p]];
      if (!record) continue;
      active++;
      if (s.remaining[p] === 0) s.remaining[p] = p === 0 ? 3 : 1;
      s.remaining[p]--;
      if (s.remaining[p] === 0) {
        s.positions[p]++;
        s.completed.push({ ...record, tick: s.tick });
        finished.push(`${record.customer} #${record.sequence} from P${p}`);
      }
    }
    s.maxConcurrent = Math.max(s.maxConcurrent, active);
    s.message = `Processing tick ${s.tick}: ${active} partition lane(s) worked. ${finished.length ? "Completed " + finished.join("; ") + "." : "P0 is still processing its current record."}`;
  }
  s.history.push(s.message);
  return s;
}
export function runOrdering(config: OrderingConfig) {
  let s = initialOrdering(config);
  for (let i = 0; i < orderingInputs.length; i++)
    s = stepOrdering(s, { type: "publish" });
  while (s.completed.length < orderingInputs.length)
    s = stepOrdering(s, { type: "process" });
  return s;
}
export function orderingEvidence(s: OrderingState) {
  const customers = ["customer-a", "customer-b", "customer-c"];
  const placement = customers.every(
    (c) =>
      new Set(
        s.logs
          .flat()
          .filter((r) => r.customer === c)
          .map((r) => r.partition),
      ).size <= 1,
  );
  const inOrder = customers.every((c) =>
    s.completed
      .filter((r) => r.customer === c)
      .every(
        (r, i, all) =>
          i === 0 ||
          (all[i - 1].sequence < r.sequence && all[i - 1].tick < r.tick),
      ),
  );
  return {
    placement,
    inOrder,
    parallel: s.maxConcurrent >= 2,
    allProcessed: s.completed.length === orderingInputs.length,
  };
}
