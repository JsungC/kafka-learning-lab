import {
  initialLog,
  transitionLog,
  retainedCount,
  type LogState,
} from "../simulation/log";
export type LogMissionResult = {
  passed: boolean;
  completeRead: boolean;
  replayed: boolean;
  keptAfterRead: boolean;
  state: LogState;
  feedback: string;
};
export function assessLog(
  retention: number,
  start: "earliest" | "end",
): LogMissionResult {
  let state = initialLog(1, retention);
  for (let i = 0; i < 3; i++)
    state = transitionLog(state, { type: "append", partition: 0 });
  for (let i = 0; i < 4; i++) state = transitionLog(state, { type: "wait" });
  state = transitionLog(state, { type: "seek", partition: 0, to: start });
  for (let i = 0; i < 3; i++)
    state = transitionLog(state, { type: "read", partition: 0 });
  const completeRead = state.reads.length === 3;
  const keptAfterRead = retainedCount(state) === 3;
  const firstReadCount = state.reads.length;
  state = transitionLog(state, { type: "seek", partition: 0, to: "earliest" });
  for (let i = 0; i < 3; i++)
    state = transitionLog(state, { type: "read", partition: 0 });
  const replayed = state.reads.length - firstReadCount === 3;
  const passed = completeRead && keptAfterRead && replayed;
  const feedback = passed
    ? "All three original events were read and then read again. Each record was available when needed for both passes. Consumption did not delete records; time still advances during reads, so retention can expire older records later."
    : start === "end"
      ? "Starting at the end skips the three existing events. Read from the earliest retained position for this historical report; a longer retention window cannot fix a position that intentionally skips history."
      : "The retention window was too short for the four-step delay plus both reading passes. Expired events cannot be recovered by seeking back. Try a longer window, accounting for processing time as well as the outage.";
  return { passed, completeRead, replayed, keptAfterRead, state, feedback };
}
