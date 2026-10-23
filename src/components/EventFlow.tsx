export function EventFlow() {
  return (
    <div
      className="hero-art"
      aria-label="Concept illustration: orders are retained for independent notification and analytics readers"
    >
      <div className="diagram-heading">
        <span>
          <i /> EVENT FLOW
        </span>
        <span>Concept preview</span>
      </div>
      <div className="diagram-content">
        <div className="art-order">
          <span className="diagram-icon" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="5" y="4" width="14" height="16" rx="2" />
              <path d="M9 9h6m-6 4h6m-6 4h3" />
            </svg>
          </span>
          <div>
            <small>PRODUCER</small>
            <strong>Order service</strong>
          </div>
          <code>order.placed</code>
        </div>
        <div className="art-line" aria-hidden="true">
          <svg width="18" height="34" viewBox="0 0 18 34">
            <path d="M9 0v30m-4-5 4 5 4-5" />
          </svg>
        </div>
        <div className="art-topic">
          <div className="topic-heading">
            <div>
              <small>KAFKA TOPIC</small>
              <strong>orders</strong>
            </div>
            <span className="topic-badge">Retained log</span>
          </div>
          <div className="blocks" aria-label="Illustrative records">
            <span>001</span>
            <span>002</span>
            <span>003</span>
            <span>004</span>
            <span>005</span>
            <span className="next-record">···</span>
          </div>
          <p>Append once. Read independently.</p>
        </div>
        <div className="art-branch" aria-hidden="true">
          <svg width="300" height="44" viewBox="0 0 300 44">
            <path d="M150 0v16H70v24m80-24h80v24M66 36l4 4 4-4m152 0 4 4 4-4" />
          </svg>
        </div>
        <div className="art-readers">
          <div>
            <span className="reader-dot" />
            <small>CONSUMER A</small>
            <strong>Notifications</strong>
            <span>Keep moving</span>
          </div>
          <div>
            <span className="reader-dot amber" />
            <small>CONSUMER B</small>
            <strong>Analytics</strong>
            <span>Catch up later</span>
          </div>
        </div>
      </div>
      <div className="diagram-footer">
        <svg
          aria-hidden="true"
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
        >
          <path d="M3 2v8h10m-3-3 3 3-3 3" />
        </svg>{" "}
        Same events. Different reading positions.
      </div>
    </div>
  );
}
