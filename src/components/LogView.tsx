import {
  earliestOffset,
  retainedCount,
  type LogState,
} from "../simulation/log";
export function LogView({ state }: { state: LogState }) {
  return (
    <div className="log-view" aria-label="Topic orders state">
      <div className="bookmark-summary">
        <span>
          Model step: <strong>{state.tick}</strong>
        </span>
        <span>
          Retained: <strong>{retainedCount(state)}</strong>
        </span>
        <span>
          Read observations: <strong>{state.reads.length}</strong>
        </span>
        <span>
          Expired: <strong>{state.expired}</strong>
        </span>
      </div>
      {state.partitions.map((p) => (
        <section
          className="partition-log"
          key={p.id}
          aria-label={`Partition ${p.id}`}
        >
          <div className="partition-heading">
            <strong>orders / P{p.id}</strong>
            <span>
              Earliest retained: {earliestOffset(p)} · Next append offset:{" "}
              {p.nextOffset}
            </span>
          </div>
          <div className="log-records">
            {p.records.length === 0 ? (
              <p>No retained records in this partition.</p>
            ) : (
              p.records.map((r) => (
                <article className="log-record" key={r.offset}>
                  <span className="concept-kicker">
                    P{p.id} · OFFSET {r.offset}
                  </span>
                  <strong>Event {r.eventId}</strong>
                  <dl>
                    <dt>key</dt>
                    <dd>{r.key}</dd>
                    <dt>value</dt>
                    <dd>{r.value}</dd>
                  </dl>
                  <small>
                    Written at step {r.writtenAt} · Age{" "}
                    {state.tick - r.writtenAt}
                  </small>
                  <span className="record-read-state">
                    {
                      state.reads.filter(
                        (x) => x.partition === p.id && x.offset === r.offset,
                      ).length
                    }{" "}
                    read observation(s)
                  </span>
                </article>
              ))
            )}
          </div>
          <p className="position-marker">
            Next read position in P{p.id}:{" "}
            <strong>{state.positions[p.id]}</strong>{" "}
            <span>— a bookmark, not a stored record or committed position</span>
          </p>
        </section>
      ))}
      <details>
        <summary>Log actions · {state.history.length} entries</summary>
        <ol className="event-log">
          {state.history.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      </details>
      {state.reads.length > 0 && (
        <details>
          <summary>Inspect read observations · {state.reads.length}</summary>
          <ol className="event-log">
            {state.reads.map((r, i) => (
              <li key={i}>
                Read {i + 1}: event {r.eventId}, P{r.partition} offset{" "}
                {r.offset}
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
