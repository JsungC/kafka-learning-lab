import { expect, it } from "vitest";
import {
  initialOrdering,
  stepOrdering,
  runOrdering,
  orderingEvidence,
  orderingInputs,
  partitionFor,
  teachingHash,
} from "./ordering";
import { assessOrdering } from "../assessment/orderingMission";
import {
  loadProgress,
  emptyProgress,
  completeChapter3,
} from "../persistence/progress";
it("stable customer keys preserve each customer across colliding partition lanes", () => {
  for (const partitions of [2, 3, 4]) {
    const s = runOrdering({ partitions, strategy: "customer" });
    expect(orderingEvidence(s)).toEqual({
      placement: true,
      inOrder: true,
      parallel: true,
      allProcessed: true,
    });
    for (const customer of ["customer-a", "customer-b", "customer-c"])
      expect(
        s.completed
          .filter((r) => r.customer === customer)
          .map((r) => r.sequence),
      ).toEqual([1, 2, 3]);
  }
  const s = runOrdering({ partitions: 2, strategy: "customer" });
  expect(s.logs.filter((log) => log.length > 0)).toHaveLength(2);
  expect(
    s.logs.some((log) => new Set(log.map((r) => r.customer)).size > 1),
  ).toBe(true);
});
it("unique event keys expose cross-partition reordering under the fixed slow-lane schedule", () => {
  const s = runOrdering({ partitions: 3, strategy: "event" });
  expect(orderingEvidence(s).placement).toBe(false);
  expect(orderingEvidence(s).inOrder).toBe(false);
  expect(s.completed).toHaveLength(9);
  for (const log of s.logs) {
    const processed = s.completed.filter(
      (r) => r.partition === log[0]?.partition,
    );
    expect(processed.map((r) => r.offset)).toEqual(log.map((r) => r.offset));
  }
});
it("single-lane designs keep sequence but fail cross-lane parallelism", () => {
  expect(assessOrdering({ partitions: 1, strategy: "customer" }).passed).toBe(
    false,
  );
  const result = assessOrdering({ partitions: 4, strategy: "constant" });
  expect(result.evidence.inOrder).toBe(true);
  expect(result.evidence.parallel).toBe(false);
  expect(result.feedback).toContain("Only one partition lane");
});
it("keyless placement is deterministic illustrative round-robin, and count changes can remap keys", () => {
  expect([0, 1, 2, 3].map((i) => partitionFor(null, 3, i))).toEqual([
    0, 1, 2, 0,
  ]);
  expect(teachingHash("a")).toBe(97);
  expect(partitionFor("a", 3)).toBe(partitionFor("a", 3));
  expect(
    ["customer-a", "customer-b", "customer-c"].some(
      (k) => partitionFor(k, 3) !== partitionFor(k, 4),
    ),
  ).toBe(true);
  expect(() =>
    initialOrdering({ partitions: 0, strategy: "customer" }),
  ).toThrow();
});
it("transitions are immutable, reproducible, and record completed times remain serial inside a partition", () => {
  const s = initialOrdering();
  const snapshot = structuredClone(s);
  expect(stepOrdering(s, { type: "publish" })).toEqual(
    stepOrdering(s, { type: "publish" }),
  );
  expect(s).toEqual(snapshot);
  const full = runOrdering({ partitions: 3, strategy: "customer" });
  expect(full).toEqual(runOrdering({ partitions: 3, strategy: "customer" }));
  for (let p = 0; p < 3; p++) {
    const ticks = full.completed
      .filter((r) => r.partition === p)
      .map((r) => r.tick);
    expect(ticks.every((t, i) => i === 0 || t > ticks[i - 1])).toBe(true);
  }
  expect(full.published).toBe(orderingInputs.length);
});
it("mission checks placements and outcomes, accepts multiple designs and explains split customers", () => {
  for (const partitions of [2, 3, 4])
    expect(assessOrdering({ partitions, strategy: "customer" }).passed).toBe(
      true,
    );
  for (const strategy of ["event", "unkeyed"] as const) {
    const r = assessOrdering({ partitions: 3, strategy });
    expect(r.passed).toBe(false);
    expect(r.feedback).toContain("split across partitions");
  }
});
it("restores chapter 3 separately and rejects malformed data without erasing earlier progress", () => {
  const base = { ...emptyProgress(), missionPassed: true };
  const chapter3 = {
    viewed: true,
    experiments: ["stable", "split"],
    attempts: 3,
    missionPassed: true,
  };
  const restored = loadProgress({
    getItem: () => JSON.stringify({ ...base, chapter3 }),
  });
  expect(completeChapter3(restored.chapter3)).toBe(true);
  expect(restored.missionPassed).toBe(true);
  expect(
    loadProgress({
      getItem: () =>
        JSON.stringify({
          ...base,
          chapter3: { ...chapter3, experiments: ["unknown"] },
        }),
    }),
  ).toEqual(base);
  expect(completeChapter3({ ...chapter3, experiments: ["stable"] })).toBe(
    false,
  );
  expect(loadProgress({ getItem: () => JSON.stringify(base) })).toEqual(base);
});
