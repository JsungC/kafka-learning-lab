import { practiceSteps } from "../content/practice";
export function OptionalPractice() {
  return (
    <section id="real-kafka">
      <p className="eyebrow">OPTIONAL / CONNECT THE MODEL TO REAL OUTPUT</p>
      <h2>Try it with an actual Kafka broker</h2>
      <p>
        The browser chapter is complete without this track. If you have Docker
        available on your own development machine, the following exercise
        connects the log model to actual Kafka commands. Nothing here runs
        inside this website, and opening the guide does not certify that you ran
        it.
      </p>
      <details className="practice-guide">
        <summary>Open the Kafka 4.2.0 practice guide · Docker required</summary>
        <p>
          Use a terminal with Docker running, enough memory for a Kafka broker,
          and access to the official Docker image registry. The shell examples
          use POSIX syntax (macOS, Linux, or WSL). All records are synthetic.
          The image version and workflow follow the{" "}
          <a href="https://github.com/apache/kafka/blob/4.2.0/docs/getting-started/quickstart.md">
            official Kafka 4.2.0 quickstart
          </a>
          .
        </p>
        {practiceSteps.map((step) => (
          <section key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.explanation}</p>
            <pre>
              <code>{step.command}</code>
            </pre>
          </section>
        ))}
        <div className="visual-takeaway">
          <strong>Explain the evidence</strong>
          <ul>
            <li>
              Which process stored the records, and which processes were
              clients?
            </li>
            <li>
              Did the second consumer see the same partition, offsets, and
              values?
            </li>
            <li>What did consuming change, and what remained available?</li>
          </ul>
          <p>
            Compare your output with the expected observations. This optional
            track has no automatic completion badge; actual broker behavior is
            separate from browser-model validation.
          </p>
        </div>
      </details>
    </section>
  );
}
