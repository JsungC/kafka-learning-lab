import { expect, it } from "vitest";
import { bookmarkState, outageSnapshots } from "./illustrations";
import { step } from "./core";
it("shows independent bookmarks without removing consumed records", () => {
  let state = bookmarkState();
  expect(state.notification).toHaveLength(6);
  expect(state.analytics).toHaveLength(0);
  for (let i = 0; i < 6; i++) {
    state = step(step(state, { type: "analytics", paused: false }), {
      type: "step",
    });
    expect(state.analytics).toHaveLength(i + 1);
    expect(state.retained).toHaveLength(6);
    expect(state.notification).toHaveLength(6);
  }
});
it("derives outage snapshots from reproducible immutable simulation states", () => {
  const states = outageSnapshots();
  expect(
    states.map((s) => [
      s.orders.length,
      s.notification.length,
      s.analytics.length,
    ]),
  ).toEqual([
    [1, 1, 1],
    [3, 3, 1],
    [4, 4, 2],
    [6, 6, 6],
  ]);
  expect(states[1].analyticsPaused).toBe(true);
  expect(states[3].retained).toHaveLength(6);
  expect(outageSnapshots()).toEqual(states);
});
