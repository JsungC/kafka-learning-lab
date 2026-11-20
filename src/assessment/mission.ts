import {
  initialState,
  orderInputs,
  step,
  type Mode,
  type State,
} from "../simulation/core";
export type Result = {
  passed: boolean;
  continuity: boolean;
  recovery: boolean;
  state: State;
  beforeRestart: State;
  firstStep: State;
  firstAfterResume: number;
  feedback: string;
};
export function assess(mode: Mode): Result {
  let state = initialState(mode);
  state = step(state, { type: "analytics", paused: true });
  for (let i = 0; i < 3; i++) state = step(state, { type: "step" });
  const continuity =
    state.notification.length === 3 && state.analytics.length === 0;
  const beforeRestart = state;
  state = step(state, { type: "analytics", paused: false });
  state = step(state, { type: "step" });
  const firstStep = state;
  const firstAfterResume = state.analytics[0];
  for (let i = 0; i < 8; i++) state = step(state, { type: "step" });
  const recovery = state.analytics.length === orderInputs.length;
  return {
    passed: continuity && recovery,
    continuity,
    recovery,
    state,
    beforeRestart,
    firstStep,
    firstAfterResume,
    feedback: recovery
      ? "Both requirements passed. Notifications continued during the outage. Analytics later read all six retained events using its independent subscription."
      : "Partial success: notifications continued, but analytics missed orders 1–3. This direct-delivery model has no durable retry storage. Choose a retained log so an unavailable reader can catch up. Direct calls can still suit immediate request/response work; a durable outbox or retry system would change this model.",
  };
}
