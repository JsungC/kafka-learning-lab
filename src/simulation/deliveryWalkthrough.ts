import { initialState, step, type Action } from "./core";

const scenes: {
  action: Action;
  title: string;
  next: string;
  change: string;
  why: string;
}[] = [
  {
    action: { type: "step" },
    title: "Both readers finish Order 001",
    next: "Pause analytics",
    change: "Both paths end in a confirmation and an analytics entry for 001.",
    why: "Look in the middle. Only the orders log still holds a copy of the event.",
  },
  {
    action: { type: "analytics", paused: true },
    title: "The analytics reader stops",
    next: "Send Order 002",
    change:
      "Analytics switches from active to paused in both diagrams. Order 001 is already processed.",
    why: "Notifications has its own reader. Watch its branch when the next order arrives.",
  },
  {
    action: { type: "step" },
    title: "Order 002 arrives during the outage",
    next: "Resume analytics",
    change:
      "Both notification branches receive 002. Direct delivery misses the analytics call. The log gains a second record.",
    why: "Find 002 in the log. The notification reader has finished, yet analytics can still read that same record later.",
  },
  {
    action: { type: "analytics", paused: false },
    title: "Analytics is ready to read again",
    next: "Try reading Order 002",
    change:
      "Both analytics readers are active again. Neither has processed 002 yet.",
    why: "The shop sends no more orders. Which design can still supply the missing event?",
  },
  {
    action: { type: "read" },
    title: "Analytics tries to catch up",
    next: "Replay from start",
    change:
      "In the log model, analytics moves from 001 to 002. In direct delivery it stays at 001.",
    why: "The reader fetched the saved 002. Both tickets remain in the log after the read. The direct model has no stored retry.",
  },
];

let direct = initialState("direct");
let log = initialState("log");
export const deliveryFrames = scenes.map((scene) => {
  direct = step(direct, scene.action);
  log = step(log, scene.action);
  return { ...scene, direct, log };
});
