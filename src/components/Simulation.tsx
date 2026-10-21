import type { State } from "../simulation/core";
export function Simulation({ state }: { state: State }) {
  return (
    <div className="simulation" aria-label="Order event delivery state">
      <div className="flow">
        <div className="node">
          <span className="eyebrow">PRODUCER</span>
          <strong>Order service</strong>
          <span>{state.orders.length} / 6 produced</span>
        </div>
        <span className="arrow" aria-hidden="true">
          →
        </span>
        <div className="node log">
          <span className="eyebrow">
            {state.mode === "log" ? "TOPIC" : "CONNECTION"}
          </span>
          <strong>{state.mode === "log" ? "orders" : "Direct calls"}</strong>
          <span>
            {state.mode === "log"
              ? `${state.retained.length} retained records`
              : "No retry storage"}
          </span>
        </div>
        <span className="arrow" aria-hidden="true">
          →
        </span>
        <div className="readers">
          <div className="node">
            <span className="eyebrow">CONSUMER · ACTIVE</span>
            <strong>Notifications</strong>
            <span>{state.notification.length} delivered</span>
          </div>
          <div className={`node ${state.analyticsPaused ? "paused" : ""}`}>
            <span className="eyebrow">
              CONSUMER · {state.analyticsPaused ? "PAUSED" : "ACTIVE"}
            </span>
            <strong>Analytics</strong>
            <span>
              {state.analytics.length} processed ·{" "}
              {state.mode === "log"
                ? state.retained.length - state.analytics.length
                : state.missed.length}{" "}
              {state.mode === "log" ? "pending" : "missed"}
            </span>
          </div>
        </div>
      </div>
      <div className="records" aria-label="Produced events">
        {state.orders.length === 0 ? (
          <span>No events yet. Advance one step to place an order.</span>
        ) : (
          state.orders.map((order) => (
            <div className="record" key={order.id}>
              <strong>{order.name}</strong>
              <span>Notification ✓</span>
              <span>
                {state.analytics.includes(order.id)
                  ? "Analytics ✓"
                  : state.missed.includes(order.id)
                    ? "Analytics missed"
                    : "Analytics pending"}
              </span>
            </div>
          ))
        )}
      </div>
      <details>
        <summary>Execution log · {state.history.length} entries</summary>
        <ol className="event-log">
          {state.history.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      </details>
    </div>
  );
}
