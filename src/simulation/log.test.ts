import { expect, it } from "vitest";
import { initialLog, transitionLog, retainedCount } from "./log";
import { assessLog } from "../assessment/logMission";
import { transferEvidence } from "./transfer";
import {
  completeChapter2,
  emptyProgress,
  loadProgress,
} from "../persistence/progress";
it("assigns separate partition offsets and preserves immutable append order", () => {
  const base = initialLog(2);
  const snapshot = structuredClone(base);
  let s = transitionLog(base, { type: "append", partition: 0 });
  s = transitionLog(s, { type: "append", partition: 1 });
  s = transitionLog(s, { type: "append", partition: 0 });
  expect(s.partitions.map((p) => p.records.map((r) => r.offset))).toEqual([
    [0, 1],
    [0],
  ]);
  expect(base).toEqual(snapshot);
  expect(transitionLog(base, { type: "append", partition: 0 })).toEqual(
    transitionLog(base, { type: "append", partition: 0 }),
  );
});
it("replays the same retained record without resetting its offset or deleting it", () => {
  let s = transitionLog(initialLog(), { type: "append", partition: 0 });
  s = transitionLog(s, { type: "read", partition: 0 });
  expect(s.positions[0]).toBe(1);
  expect(retainedCount(s)).toBe(1);
  s = transitionLog(s, { type: "seek", partition: 0, to: "earliest" });
  const time = s.tick;
  s = transitionLog(s, { type: "read", partition: 0 });
  expect(s.tick).toBe(time + 1);
  expect(s.reads.map((r) => r.offset)).toEqual([0, 0]);
  expect(retainedCount(s)).toBe(1);
});
it("expires unread records, reports unavailable history, and never reuses offsets", () => {
  let s = transitionLog(initialLog(1, 3), { type: "append", partition: 0 });
  for (let i = 0; i < 3; i++) s = transitionLog(s, { type: "wait" });
  expect(retainedCount(s)).toBe(0);
  expect(s.expired).toBe(1);
  expect(s.message).toContain("Retention cleanup expired 1 record(s)");
  s = transitionLog(s, { type: "read", partition: 0 });
  expect(s.message).toContain("no longer retained");
  expect(s.positions[0]).toBe(0);
  s = transitionLog(s, { type: "append", partition: 0 });
  expect(s.partitions[0].records[0].offset).toBe(1);
  s = transitionLog(s, { type: "seek", partition: 0, to: "earliest" });
  s = transitionLog(s, { type: "read", partition: 0 });
  expect(s.reads[0].offset).toBe(1);
});
it("end seeking skips existing records and invalid partitions do not mutate state", () => {
  let s = transitionLog(initialLog(), { type: "append", partition: 0 });
  s = transitionLog(s, { type: "seek", partition: 0, to: "end" });
  s = transitionLog(s, { type: "read", partition: 0 });
  expect(s.reads).toHaveLength(0);
  expect(transitionLog(s, { type: "read", partition: 3 }).partitions).toEqual(
    s.partitions,
  );
});
it("accepts multiple valid retention designs and explains independent failure causes", () => {
  expect(assessLog(12, "earliest").passed).toBe(true);
  expect(assessLog(24, "earliest").passed).toBe(true);
  expect(assessLog(3, "earliest").feedback).toContain("too short");
  expect(assessLog(24, "end").completeRead).toBe(false);
  expect(assessLog(24, "end").feedback).toContain("skips");
});
it("changed assumptions produce explicit retained, retry, and processing evidence", () => {
  expect(transferEvidence("expired").metrics).toContainEqual(["Retained", 0]);
  expect(transferEvidence("durable-direct").metrics).toContainEqual([
    "Delivered on retry",
    3,
  ]);
  expect(transferEvidence("published-only").metrics).toContainEqual([
    "Analytics processed",
    0,
  ]);
});
it("preserves older progress, restores independent chapter 2 data and drops corrupt chapter 2 only", () => {
  const old = { ...emptyProgress(), missionPassed: true };
  expect(loadProgress({ getItem: () => JSON.stringify(old) })).toEqual(old);
  const chapter2 = {
    viewed: true,
    experiments: ["replay", "expiration"],
    attempts: 2,
    missionPassed: true,
  };
  const loaded = loadProgress({
    getItem: () => JSON.stringify({ ...old, chapter2 }),
  });
  expect(completeChapter2(loaded.chapter2)).toBe(true);
  expect(loaded.missionPassed).toBe(true);
  expect(
    loadProgress({
      getItem: () =>
        JSON.stringify({ ...old, chapter2: { ...chapter2, attempts: -1 } }),
    }),
  ).toEqual(old);
  expect(completeChapter2({ ...chapter2, experiments: ["replay"] })).toBe(
    false,
  );
});
