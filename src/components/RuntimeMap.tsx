export function RuntimeMap() {
  return (
    <figure
      className="lesson-visual"
      aria-label="What actually runs in a Kafka system"
    >
      <span className="eyebrow">BRIDGE / WHAT ACTUALLY RUNS?</span>
      <h3>Applications talk to a running Kafka server.</h3>
      <p>
        Kafka is an event-streaming platform. For this first mental model, a
        broker is a server process that stores partition logs and handles client
        requests. A partition is one ordered log within a topic. Your producer
        and consumer code runs in applications; Kafka clients provide the APIs
        those applications use to communicate with brokers. One application can
        both produce and consume; these boxes show responsibilities, not a
        requirement for separate computers.
      </p>
      <div className="runtime-map">
        <div className="runtime-clients">
          <div className="concept-node">
            <span className="concept-kicker">YOUR APPLICATION PROCESS</span>
            <strong>Order service</strong>
            <span>Producer code + Kafka client</span>
          </div>
          <div className="runtime-connection">Writes records to a topic →</div>
          <div className="concept-node">
            <span className="concept-kicker">YOUR APPLICATION PROCESS</span>
            <strong>Analytics service</strong>
            <span>Consumer code + Kafka client</span>
          </div>
          <div className="runtime-connection">
            Sends fetch requests → records come back
          </div>
        </div>
        <div className="runtime-broker">
          <span className="concept-kicker">KAFKA BROKER / SERVER PROCESS</span>
          <strong>Accept writes. Store logs. Serve reads.</strong>
          <div className="concept-node">
            <span className="concept-kicker">LOGICAL TOPIC: orders</span>
            <strong>Partition 0</strong>
            <span>Record → record → record</span>
          </div>
          <small>
            A topic is a named logical stream, not a separate running program.
          </small>
        </div>
      </div>
      <figcaption>
        In a real cluster, partitions can be distributed and replicated across
        brokers. Kafka also needs metadata management; this introductory view
        omits controllers, replication, storage protocols, and network failures.
        Chapter 6 will study reliability rather than introduce the broker’s
        existence for the first time.
      </figcaption>
      <div className="visual-takeaway">
        <strong>Where this website fits</strong>
        <p>
          Our simulator is TypeScript running in your browser. It models events
          and reader state. It does not start a Kafka broker, use a Kafka
          client, or open a connection to a cluster.
        </p>
      </div>
    </figure>
  );
}
