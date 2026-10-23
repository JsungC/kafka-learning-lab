import { initialState, step } from "./core";

// These explanatory snapshots use the same transitions as the chapter lab.
export function outageSnapshots() {
  let state = step(initialState("log"), { type: "step" });
  const before = state;
  state = step(state, { type: "analytics", paused: true });
  state = step(step(state, { type: "step" }), { type: "step" });
  const paused = state;
  state = step(state, { type: "analytics", paused: false });
  state = step(state, { type: "step" });
  const resumed = state;
  for (let i = 0; i < 6; i++) state = step(state, { type: "step" });
  return [before, paused, resumed, state];
}
export function bookmarkState() {
  let state = step(initialState("log"), { type: "analytics", paused: true });
  for (let i = 0; i < 6; i++) state = step(state, { type: "step" });
  return state;
}
