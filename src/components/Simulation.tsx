import { Grid } from "@astryxdesign/core/Grid";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { orderInputs, type State } from "../simulation/core";

export function Simulation({ state }: { state: State }) {
  const pending =
    state.mode === "log"
      ? state.retained.length - state.analytics.length
      : state.missed.length;
  return (
    <VStack
      as="figure"
      gap={5}
      className="simulation"
      aria-label="Order event delivery state"
    >
      <HStack
        className="simulation-heading"
        gap={3}
        hAlign="between"
        wrap="wrap"
      >
        <Text type="label">Live event state</Text>
        <Text type="code">
          Step {state.tick} ·{" "}
          {state.mode === "log" ? "Retained log" : "Direct delivery"}
        </Text>
      </HStack>
      <VStack gap={3} className="delivery-diagram">
        <Text type="supporting">PRODUCER → DELIVERY → CONSUMERS</Text>
        <Grid columns={{ minWidth: 112, max: 2 }} gap={3}>
          <VStack gap={2} className="delivery-node">
            <Text type="supporting">Producer</Text>
            <Text type="label">Order service</Text>
            <Text type="body" hasTabularNumbers>
              {state.orders.length} <Text type="supporting">/ 6 produced</Text>
            </Text>
          </VStack>
          <VStack gap={2} className="delivery-node delivery-transport">
            <Text type="supporting">
              {state.mode === "log" ? "Topic" : "Connection"}
            </Text>
            <Text type="label">
              {state.mode === "log" ? "orders" : "Direct calls"}
            </Text>
            <Text type="supporting">
              {state.mode === "log"
                ? `${state.retained.length} retained records`
                : "No retry storage"}
            </Text>
          </VStack>
        </Grid>
        <Grid columns={{ minWidth: 112, max: 2 }} gap={3}>
          <VStack gap={2} className="delivery-node">
            <HStack gap={2} className="reader-indicator">
              <Text className="delivery-status-mark" aria-hidden="true">
                ●
              </Text>
              <Text type="supporting">Consumer · Active</Text>
            </HStack>
            <Text type="label">Notifications</Text>
            <Text type="body" hasTabularNumbers>
              {state.notification.length}{" "}
              <Text type="supporting">delivered</Text>
            </Text>
          </VStack>
          <VStack
            gap={2}
            className={`delivery-node ${state.analyticsPaused ? "reader-paused" : ""}`}
          >
            <HStack gap={2} className="reader-indicator">
              <Text className="delivery-status-mark" aria-hidden="true">
                {state.analyticsPaused ? "Ⅱ" : "●"}
              </Text>
              <Text type="supporting">
                Consumer · {state.analyticsPaused ? "Paused" : "Active"}
              </Text>
            </HStack>
            <Text type="label">Analytics</Text>
            <Text type="supporting" hasTabularNumbers>
              {state.analytics.length} processed · {pending}{" "}
              {state.mode === "log" ? "pending" : "missed"}
            </Text>
          </VStack>
        </Grid>
      </VStack>
      <VStack gap={3} className="event-ledger" aria-label="Produced events">
        <HStack gap={2} hAlign="between">
          <Text type="label">Event ledger</Text>
          <Text type="supporting">{state.orders.length} of 6 events</Text>
        </HStack>
        <Grid columns={{ minWidth: 104, max: 3 }} gap={2}>
          {orderInputs.map((order) => {
            const produced = state.orders.some((o) => o.id === order.id);
            const missed = state.missed.includes(order.id);
            const processed = state.analytics.includes(order.id);
            return (
              <VStack
                gap={2}
                key={order.id}
                className={`event-slot ${produced ? "event-produced" : "event-empty"}`}
              >
                <Text type="code">{order.name}</Text>
                {produced ? (
                  <>
                    <Text type="supporting">Notification ✓</Text>
                    <Text
                      type="supporting"
                      className={missed ? "event-missed" : ""}
                    >
                      {processed
                        ? "Analytics ✓"
                        : missed
                          ? "Analytics missed"
                          : "Analytics pending"}
                    </Text>
                  </>
                ) : (
                  <Text type="supporting">Not produced</Text>
                )}
              </VStack>
            );
          })}
        </Grid>
        {state.orders.length === 0 && (
          <Text type="supporting">
            No events yet. Advance one step to place an order.
          </Text>
        )}
      </VStack>
      <details>
        <summary>Execution log · {state.history.length} entries</summary>
        <ol className="event-log">
          {state.history.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      </details>
    </VStack>
  );
}
