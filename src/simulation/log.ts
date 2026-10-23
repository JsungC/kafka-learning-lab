export type LogRecord = {
  eventId: number;
  key: string;
  value: string;
  offset: number;
  writtenAt: number;
};
export type LogPartition = {
  id: number;
  nextOffset: number;
  records: LogRecord[];
};
export type LogState = {
  tick: number;
  retention: number;
  partitions: LogPartition[];
  positions: number[];
  produced: number;
  reads: { partition: number; offset: number; eventId: number }[];
  expired: number;
  history: string[];
  message: string;
};
export type LogAction =
  | { type: "append"; partition: number }
  | { type: "read"; partition: number }
  | { type: "seek"; partition: number; to: "earliest" | "end" }
  | { type: "wait" };
export function initialLog(partitions = 1, retention = 24): LogState {
  if (![1, 2].includes(partitions) || ![3, 6, 12, 24].includes(retention))
    throw new Error("Unsupported educational log configuration");
  return {
    tick: 0,
    retention,
    partitions: Array.from({ length: partitions }, (_, id) => ({
      id,
      nextOffset: 0,
      records: [],
    })),
    positions: Array(partitions).fill(0),
    produced: 0,
    reads: [],
    expired: 0,
    history: [
      `Configured ${partitions} partition(s), retention ${retention} model steps.`,
    ],
    message: "Append an order to create a record.",
  };
}
export function earliestOffset(p: LogPartition): number {
  return p.records[0]?.offset ?? p.nextOffset;
}
export function retainedCount(s: LogState) {
  return s.partitions.reduce((n, p) => n + p.records.length, 0);
}
export function transitionLog(previous: LogState, action: LogAction): LogState {
  if (action.type !== "wait" && !previous.partitions[action.partition])
    return { ...previous, message: "That partition does not exist." };
  const s: LogState = {
    ...previous,
    partitions: previous.partitions.map((p) => ({
      ...p,
      records: [...p.records],
    })),
    positions: [...previous.positions],
    reads: [...previous.reads],
    history: [...previous.history],
  };
  // Seeking changes the next read position; it does not process a record or advance time.
  if (action.type === "seek") {
    const p = s.partitions[action.partition];
    s.positions[p.id] =
      action.to === "earliest" ? earliestOffset(p) : p.nextOffset;
    s.message = `P${p.id}: next read position set to ${s.positions[p.id]}. No record was read.`;
  } else {
    s.tick++;
    // Exact per-record cleanup is a teaching simplification, not Kafka segment deletion.
    for (const p of s.partitions) {
      const kept = p.records.filter((r) => s.tick - r.writtenAt < s.retention);
      s.expired += p.records.length - kept.length;
      p.records = kept;
    }
    if (action.type === "append") {
      const p = s.partitions[action.partition];
      const id = ++s.produced;
      const record: LogRecord = {
        eventId: id,
        key: `customer-${id % 2 ? "a" : "b"}`,
        value: `Order ${String(id).padStart(3, "0")} placed`,
        offset: p.nextOffset++,
        writtenAt: s.tick,
      };
      p.records.push(record);
      s.message = `Appended event ${id} to P${p.id} at offset ${record.offset}. Existing records were not overwritten.`;
    } else if (action.type === "read") {
      const p = s.partitions[action.partition];
      const position = s.positions[p.id];
      if (position < earliestOffset(p))
        s.message = `P${p.id}: position ${position} is no longer retained. Choose “Seek earliest retained” to continue; missing records cannot be recovered here.`;
      else {
        const r = p.records.find((r) => r.offset >= position);
        if (r) {
          s.reads.push({
            partition: p.id,
            offset: r.offset,
            eventId: r.eventId,
          });
          s.positions[p.id] = r.offset + 1;
          s.message = `Read P${p.id} offset ${r.offset}. Next read position is ${r.offset + 1}. Reading did not delete the record.`;
        } else
          s.message = `P${p.id}: no available record at or after position ${position}. Append another order or seek back to retained records.`;
      }
    } else
      s.message = `Advanced model time to ${s.tick}. Retention cleanup is independent of whether records were consumed.`;
  }
  if (s.expired > previous.expired)
    s.message += ` Retention cleanup expired ${s.expired - previous.expired} record(s) at this step, independently of consumption.`;
  s.history.push(`${s.tick}: ${s.message}`);
  return s;
}
