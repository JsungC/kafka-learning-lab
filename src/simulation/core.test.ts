import { describe, expect, it } from "vitest";
import { initialState, step } from "./core";
import { assess } from "../assessment/mission";
import { complete, emptyProgress, loadProgress } from "../persistence/progress";
describe("independent delivery model", () => {
  it("keeps notifications flowing while analytics pauses, then catches up without deleting retained events", () => {
    let s = step(initialState("log"), { type: "analytics", paused: true });
    for (let i = 0; i < 3; i++) s = step(s, { type: "step" });
    expect(s.notification).toEqual([1, 2, 3]);
    expect(s.analytics).toEqual([]);
    expect(s.retained).toHaveLength(3);
    s = step(s, { type: "analytics", paused: false });
    for (let i = 0; i < 6; i++) s = step(s, { type: "step" });
    expect(s.analytics).toEqual([1, 2, 3, 4, 5, 6]);
    expect(s.retained).toHaveLength(6);
  });
  it("does not mutate input and produces reproducible transitions", () => {
    const s = initialState("direct");
    const snapshot = structuredClone(s);
    expect(step(s, { type: "step" })).toEqual(step(s, { type: "step" }));
    expect(s).toEqual(snapshot);
  });
  it("explains partial success for direct delivery and accepts recovery outcomes", () => {
    const direct = assess("direct");
    expect(direct.continuity).toBe(true);
    expect(direct.recovery).toBe(false);
    expect(direct.state.missed).toEqual([1, 2, 3]);
    expect(direct.feedback).toContain("durable retry");
    expect(assess("log").passed).toBe(true);
    expect(assess("log")).toEqual(assess("log"));
  });
  it("initializes a clean reset", () => {
    const dirty = step(initialState("log"), { type: "step" });
    expect(dirty.orders).toHaveLength(1);
    expect(initialState("log").orders).toEqual([]);
  });
});
describe("local progress", () => {
  it.each([
    "oops",
    "null",
    '{"version":0}',
    '{"version":1,"viewed":true,"experiments":[3],"attempts":-1,"missionPassed":true}',
  ])("recovers from invalid storage: %s", (value) => {
    expect(loadProgress({ getItem: () => value })).toEqual(emptyProgress());
  });
  it("survives unavailable storage", () => {
    expect(
      loadProgress({
        getItem: () => {
          throw new Error("denied");
        },
      }),
    ).toEqual(emptyProgress());
  });
  it("does not complete a chapter from a view or mission alone", () => {
    expect(
      complete({ ...emptyProgress(), viewed: true, missionPassed: true }),
    ).toBe(false);
    const p = {
      ...emptyProgress(),
      viewed: true,
      experiments: ["direct", "log"],
      missionPassed: true,
    };
    expect(complete(loadProgress({ getItem: () => JSON.stringify(p) }))).toBe(
      true,
    );
  });
});
