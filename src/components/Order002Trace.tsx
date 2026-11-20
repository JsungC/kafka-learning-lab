import { Text } from "@astryxdesign/core/Text";
import { EvidenceTable } from "./EvidenceTable";

function Ticket({ retained }: { retained: boolean }) {
  return (
    <Text
      type="code"
      className={retained ? "trace-ticket" : "trace-ticket expired"}
    >
      002 · {retained ? "stored" : "expired"}
    </Text>
  );
}

export function Order002Trace({ retained }: { retained: boolean }) {
  return (
    <EvidenceTable
      label="Follow the ticket and each reader’s last processed order"
      columns={["While paused", "After read attempt"]}
      rows={[
        ["Log copy", <Ticket retained />, <Ticket retained={retained} />],
        ["Last notice sent", "002", "002"],
        ["Last sale counted", "001", retained ? "002" : "001"],
      ]}
    />
  );
}
