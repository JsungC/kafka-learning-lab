import { assignment, roleCount, type GroupState } from "../simulation/groups";
export function GroupView({ state }: { state: GroupState }) {
  return (
    <div
      className="group-view"
      aria-label="Consumer group ownership and progress"
    >
      <div className="bookmark-summary">
        <span>
          Tick: <strong>{state.tick}</strong>
        </span>
        <span>
          Inventory: <strong>{roleCount(state, "inventory")}/12</strong>
        </span>
        <span>
          Analytics: <strong>{roleCount(state, "analytics")}/12</strong>
        </span>
        <span>
          Retained: <strong>12 records</strong>
        </span>
      </div>
      {state.groups.map((g) => {
        const owners = assignment(g);
        return (
          <section className="partition-log" key={g.id}>
            <h3>Group: {g.id}</h3>
            <div
              className="group-assignments"
              role="table"
              aria-label={`${g.id} partition ownership`}
            >
              <div role="row">
                <strong role="columnheader">Partition</strong>
                <strong role="columnheader">Owner</strong>
                <strong role="columnheader">Next position</strong>
              </div>
              {owners.map((owner, p) => (
                <div role="row" key={p}>
                  <span role="cell">P{p}</span>
                  <span role="cell">{owner}</span>
                  <span role="cell">{g.positions[p]} / 3</span>
                </div>
              ))}
            </div>
            <div className="group-members">
              {g.members.map((m) => {
                const owned = owners
                  .map((owner, p) => (owner === m.id ? `P${p}` : null))
                  .filter(Boolean);
                return (
                  <div className="concept-node" key={m.id}>
                    <strong>{m.id}</strong>
                    <span>
                      {owned.length
                        ? owned.join(", ")
                        : "Idle · no partition assigned"}
                    </span>
                    <span>
                      {m.role === "analytics" && state.analyticsPaused
                        ? "Processing paused · still a member"
                        : owned.length
                          ? "Available for assigned work"
                          : "No work assigned"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      <p className="caption">
        Positions are next successfully processed offsets in this teaching
        model, not a claim about committed restart positions. Inventory and
        analytics counts refer to work actually done by those roles.
      </p>
      <details>
        <summary>
          Assignment and processing log · {state.history.length} entries
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
