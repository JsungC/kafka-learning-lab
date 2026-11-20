export function RuntimeMap() {
  return (
    <figure
      className="lesson-visual"
      aria-label="What actually runs in a Kafka system"
    >
      <span className="eyebrow">BRIDGE / WHAT ACTUALLY RUNS?</span>
      <h3>Applications talk to a running Kafka server.</h3>
      <p>
        Where does 002 live when the shop closes its app? Follow the write to
        the broker below. That server runs Kafka, stores the log and answers
        requests to read it. The shop calls Kafka through a client library in
        its application. One application can both write and read. The drawing
        shows the jobs each program does.
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
        Here the orders topic has one partition, a single ordered log. A
        larger cluster can spread partitions and their replicas across brokers.
        Chapter 6 follows what happens when a broker fails.
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
