export type Mode = "direct" | "log";
export type Order = { id: number; name: string };
export type State = {
  mode: Mode;
  tick: number;
  orders: Order[];
  retained: Order[];
  notification: number[];
  analytics: number[];
  missed: number[];
  outageOrders: number[];
  analyticsPaused: boolean;
  history: string[];
};
export type Action = { type: "step" } | { type: "analytics"; paused: boolean };
export const orderInputs: Order[] = [1, 2, 3, 4, 5, 6].map((id) => ({
  id,
  name: `Order ${String(id).padStart(3, "0")}`,
}));
export function initialState(mode: Mode): State {
  return {
    mode,
    tick: 0,
    orders: [],
    retained: [],
    notification: [],
    analytics: [],
    missed: [],
    outageOrders: [],
    analyticsPaused: false,
    history: [
      `Configured ${mode === "log" ? "retained event log with independent subscriptions" : "direct delivery without retry storage"}.`,
    ],
  };
}
export function step(previous: State, action: Action): State {
  if (action.type === "analytics")
    return {
      ...previous,
      analyticsPaused: action.paused,
      history: [
        ...previous.history,
        `Analytics ${action.paused ? "paused" : "resumed"}.`,
      ],
    };
  const state: State = {
    ...previous,
    tick: previous.tick + 1,
    orders: [...previous.orders],
    retained: [...previous.retained],
    notification: [...previous.notification],
    analytics: [...previous.analytics],
    missed: [...previous.missed],
    outageOrders: [...previous.outageOrders],
    history: [...previous.history],
  };
  const order = orderInputs[previous.orders.length];
  const messages: string[] = [];
  if (order) {
    state.orders.push(order);
    if (state.analyticsPaused) state.outageOrders.push(order.id);
    state.notification.push(order.id);
    messages.push(`${order.name} produced; notification delivered.`);
    if (state.mode === "log") state.retained.push(order);
    else if (state.analyticsPaused) {
      state.missed.push(order.id);
      messages.push("Direct analytics delivery unavailable; no retry storage.");
    } else state.analytics.push(order.id);
  }
  if (state.mode === "log" && !state.analyticsPaused) {
    const next = state.retained.find(
      (event) => !state.analytics.includes(event.id),
    );
    if (next) {
      state.analytics.push(next.id);
      messages.push(
        `Analytics processed order ${next.id} from the retained log.`,
      );
    }
  }
  state.history.push(
    `Step ${state.tick}: ${messages.join(" ") || (state.analyticsPaused ? "Analytics remains paused." : "No pending events.")}`,
  );
  return state;
}
export function isSettled(s: State): boolean {
  return (
    s.orders.length === orderInputs.length &&
    (s.mode === "direct" || s.analytics.length === orderInputs.length)
  );
}
