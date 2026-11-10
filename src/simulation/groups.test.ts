import { expect, it } from "vitest";
import {
  initialGroups,
  stepGroups,
  assignment,
  groupTimeline,
  assessGroups,
  roleCount,
} from "./groups";
import {
  loadProgress,
  emptyProgress,
  completeChapter4,
} from "../persistence/progress";
it("assigns each partition once in a group and leaves excess members idle", () => {
  const s = initialGroups({ workers: 5, independent: true });
  const owners = assignment(s.groups[0]);
  expect(owners).toHaveLength(4);
  expect(new Set(owners).size).toBe(4);
  expect(owners.includes("inventory-5")).toBe(false);
  expect(assignment(s.groups[1])).toEqual(Array(4).fill("analytics-1"));
});
it("independent subscriptions each process the full stream without deleting records", () => {
  const states = groupTimeline({ workers: 2, independent: true });
  const s = states.at(-1)!;
  expect(roleCount(s, "inventory")).toBe(12);
  expect(roleCount(s, "analytics")).toBe(12);
  for (const group of s.groups) {
    const reads = s.deliveries.filter((d) => d.group === group.id);
    expect(new Set(reads.map((r) => `${r.partition}:${r.offset}`)).size).toBe(
      12,
    );
  }
});
it("members sharing one group divide the stream rather than each receiving it", () => {
  const s = groupTimeline({ workers: 2, independent: false }).at(-1)!;
  expect(s.deliveries).toHaveLength(12);
  expect(roleCount(s, "inventory") + roleCount(s, "analytics")).toBe(12);
  expect(roleCount(s, "analytics")).toBeLessThan(12);
});
it("processing pause preserves membership while separate inventory advances", () => {
  let s = stepGroups(initialGroups(), { type: "analytics", paused: true });
  const members = structuredClone(s.groups[1].members);
  s = stepGroups(s, { type: "tick" });
  expect(s.groups[1].positions).toEqual([0, 0, 0, 0]);
  expect(s.groups[1].members).toEqual(members);
  expect(roleCount(s, "inventory")).toBe(2);
});
it("membership reassignment preserves group positions and immutable prior states", () => {
  const before = stepGroups(initialGroups(), { type: "tick" });
  const copy = structuredClone(before);
  const next = stepGroups(before, { type: "resize", workers: 3 });
  expect(next.groups[0].positions).toEqual(before.groups[0].positions);
  expect(assignment(next.groups[0])).not.toEqual(assignment(before.groups[0]));
  expect(before).toEqual(copy);
  expect(groupTimeline({ workers: 2, independent: true })).toEqual(
    groupTimeline({ workers: 2, independent: true }),
  );
});
it("per-member capacity does not multiply by owned partitions and valid missions accept 2–5 workers", () => {
  const s = stepGroups(initialGroups({ workers: 1, independent: true }), {
    type: "tick",
  });
  expect(roleCount(s, "inventory")).toBe(1);
  expect(assessGroups({ workers: 1, independent: true }).passed).toBe(false);
  for (const workers of [2, 3, 4, 5])
    expect(assessGroups({ workers, independent: true }).passed).toBe(true);
  expect(assessGroups({ workers: 4, independent: false }).passed).toBe(false);
  expect(() => initialGroups({ workers: 0, independent: true })).toThrow();
});
it("restores fourth-chapter progress without changing earlier completion and isolates corruption", () => {
  const base = { ...emptyProgress(), missionPassed: true };
  const chapter4 = {
    viewed: true,
    experiments: ["shared", "independent"],
    attempts: 2,
    missionPassed: true,
  };
  const restored = loadProgress({
    getItem: () => JSON.stringify({ ...base, chapter4 }),
  });
  expect(completeChapter4(restored.chapter4)).toBe(true);
  expect(restored.missionPassed).toBe(true);
  expect(
    loadProgress({
      getItem: () =>
        JSON.stringify({ ...base, chapter4: { ...chapter4, attempts: -1 } }),
    }),
  ).toEqual(base);
  expect(completeChapter4({ ...chapter4, experiments: ["shared"] })).toBe(
    false,
  );
});
