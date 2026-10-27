import { orderingEvidence, type OrderingState } from "../simulation/ordering";
export function OrderingView({ state }: { state: OrderingState }) {
  const evidence = orderingEvidence(state);
  return (
    <div
      className="ordering-view"
      aria-label="Key routing and processing state"
    >
      <div className="bookmark-summary">
        <span>
          Published: <strong>{state.published}/9</strong>
        </span>
        <span>
          Completed: <strong>{state.completed.length}/9</strong>
        </span>
        <span>
          Processing tick: <strong>{state.tick}</strong>
        </span>
        <span>
          Max concurrent lanes: <strong>{state.maxConcurrent}</strong>
        </span>
      </div>
      <div className="ordering-partitions">
        {state.logs.map((log, p) => (
          <section
            className="partition-log"
            key={p}
            aria-label={`Ordering partition ${p}`}
          >
            <div className="partition-heading">
              <strong>P{p}</strong>
              <span>
                {p === 0 ? "Slow lane · 3 ticks/record" : "1 tick/record"}
              </span>
            </div>
            <ol className="key-records">
              {log.map((r) => {
                const done = state.completed.some((c) => c.id === r.id);
                const working =
                  !done &&
                  state.remaining[p] > 0 &&
                  state.logs[p][state.positions[p]]?.id === r.id;
                return (
                  <li
                    className={`key-record customer-${r.customer.at(-1)} ${done ? "key-done" : ""}`}
                    key={r.id}
                  >
                    <strong>
                      {r.customer} · #{r.sequence}
                    </strong>
                    <span>{r.value}</span>
                    <code>key: {r.key ?? "(none)"}</code>
                    <small>
                      P{p} offset {r.offset} ·{" "}
                      {done ? "Completed" : working ? "Processing" : "Queued"}
                    </small>
                  </li>
                );
              })}
            </ol>
            {log.length === 0 && (
              <p className="caption">No records routed here.</p>
            )}
          </section>
        ))}
      </div>
      <div className="customer-results">
        <h4>Customer completion sequences</h4>
        {["customer-a", "customer-b", "customer-c"].map((customer) => (
          <div key={customer}>
            <strong>{customer}</strong>
            <span>
              {state.completed
                .filter((r) => r.customer === customer)
                .map((r) => `#${r.sequence} (tick ${r.tick})`)
                .join(" → ") || "No completed events yet"}
            </span>
          </div>
        ))}
      </div>
      <p className="caption">
        Source order for each customer is #1 → #2 → #3. Completion entries with
        the same tick are concurrent; their displayed order is not a global
        ordering guarantee.
      </p>
      {state.completed.length === 9 && (
        <div className="visual-takeaway">
          {evidence.placement
            ? "✓ One lane per customer"
            : "! A customer crossed partition boundaries"}{" "}
          ·{" "}
          {evidence.inOrder
            ? "✓ Customer completion order observed"
            : "! Customer completion order not established"}{" "}
          ·{" "}
          {evidence.parallel
            ? "✓ Cross-partition parallel work observed"
            : "! No cross-partition parallel work"}
        </div>
      )}
      <details>
        <summary>
          Routing and processing log · {state.history.length} entries
        </summary>
        <ol className="event-log">
          {state.history.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      </details>
    </div>
  );
}
