import { useState } from "react";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Selector } from "@astryxdesign/core/Selector";
import { Slider } from "@astryxdesign/core/Slider";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { deliveryFrames } from "../simulation/deliveryWalkthrough";
import type { State } from "../simulation/core";
import { ChapterButton } from "./ChapterButton";

function DeliveryPath({ state, previous }: { state: State; previous?: State }) {
  const retained = state.mode === "log";
  const order = state.orders[state.orders.length - 1];
  const id = order.name.slice(-3);
  const read = state.analytics.includes(order.id);
  const missed = state.missed.includes(order.id);
  const outcome = read ? "read" : missed ? "missed" : "pending";
  const reader = state.analyticsPaused ? "paused" : "active";
  const model = retained ? "Retained log" : "Direct delivery";
  const newOrder = Boolean(
    previous && previous.orders.length !== state.orders.length,
  );
  const readerChanged = Boolean(
    previous &&
    (previous.analyticsPaused !== state.analyticsPaused ||
      previous.analytics.length !== state.analytics.length ||
      newOrder),
  );

  return (
    <VStack gap={1} className="delivery-path">
      <Text type="label">{model}</Text>
      <svg
        viewBox="0 0 316 124"
        role="img"
        aria-label={`${model}. ${order.name}. ${retained ? `${state.retained.length} record${state.retained.length === 1 ? "" : "s"} retained` : "No retry copy"}. Notifications received ${id}. Analytics ${reader}, ${id} ${outcome}.`}
      >
        <g className="path-wire" fill="none">
          <path d="M49 61 H83 M147 61 H161 Q169 61 169 53 V33 Q169 25 177 25 H190" />
          <path
            className={read ? "" : "wire-interrupted"}
            d="M161 61 Q169 61 169 69 V89 Q169 97 177 97 H190"
          />
        </g>
        <g className={newOrder ? "path-node path-highlight" : "path-node"}>
          <path d="M5 39 H38 L48 49 V82 L44 79 L40 82 L36 79 L32 82 L28 79 L24 82 L20 79 L16 82 L12 79 L5 82 Z M38 39 V49 H48" />
          <text x="26" y="67" textAnchor="middle">
            {id}
          </text>
        </g>
        <text className="path-caption" x="26" y="104" textAnchor="middle">
          Order
        </text>
        {retained ? (
          <g className={newOrder ? "path-node path-highlight" : "path-node"}>
            <path d="M76 48 V74 H149 V48" fill="none" />
            {state.retained.map((record, i) => (
              <g key={record.id} transform={`translate(${79 + i * 34} 45)`}>
                <rect width="31" height="25" rx="3" />
                <text x="15.5" y="17" textAnchor="middle">
                  {record.name.slice(-3)}
                </text>
              </g>
            ))}
            <text className="path-caption" x="113" y="103" textAnchor="middle">
              orders log
            </text>
          </g>
        ) : (
          <g>
            <path className="path-wire" d="M78 61 H151" />
            <text className="path-caption" x="113" y="102" textAnchor="middle">
              No retry copy
            </text>
          </g>
        )}
        <g className={newOrder ? "path-node path-highlight" : "path-node"}>
          <circle cx="194" cy="25" r="5" />
          <text className="path-label" x="207" y="21">
            Notifications
          </text>
          <text className="path-caption" x="207" y="40">
            {id} received
          </text>
        </g>
        <g className={readerChanged ? "path-node path-highlight" : "path-node"}>
          {missed ? (
            <path
              className="path-warning"
              d="M188 91 L200 103 M200 91 L188 103"
            />
          ) : !read ? (
            <g className="path-warning">
              <circle cx="194" cy="97" r="7" />
              <path d="M194 92 V97 L198 99" />
            </g>
          ) : state.analyticsPaused ? (
            <path className="path-warning" d="M192 91 V103 M197 91 V103" />
          ) : (
            <circle cx="194" cy="97" r="5" />
          )}
          <text className="path-label" x="207" y="79">
            Analytics
          </text>
          <text
            className={read ? "path-caption" : "path-warning-label"}
            x="207"
            y="97"
          >
            {id} {outcome}
          </text>
          <text className="path-caption" x="207" y="115">
            {reader}
          </text>
        </g>
      </svg>
    </VStack>
  );
}

export function DeliveryWalkthrough() {
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState("");
  const frame = deliveryFrames[index];
  const last = deliveryFrames.length - 1;
  return (
    <VStack
      as="figure"
      className="guided-delivery"
      aria-label="Follow one order through both designs"
      gap={4}
    >
      <VStack gap={1}>
        <Text type="supporting">Guided experiment · two orders</Text>
        <Heading level={3}>Follow Order 002 through an outage</Heading>
        <Text as="p">
          Track the ticket from the order service to each reader.
        </Text>
      </VStack>
      <HStack className="delivery-pair" gap={4} wrap="wrap">
        <DeliveryPath
          state={frame.direct}
          previous={deliveryFrames[index - 1]?.direct}
        />
        <DeliveryPath
          state={frame.log}
          previous={deliveryFrames[index - 1]?.log}
        />
      </HStack>
      <Slider
        label="Delivery timeline"
        min={0}
        max={last}
        step={1}
        value={index}
        onChange={setIndex}
        marks={deliveryFrames.map((_, value) => ({ value }))}
        formatValue={(i) =>
          `${i + 1} of ${last + 1}. ${deliveryFrames[i].title}`
        }
        valueDisplay="none"
      />
      <HStack className="walkthrough-actions" gap={2} hAlign="between">
        <ChapterButton
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          Back
        </ChapterButton>
        <ChapterButton
          className="primary"
          onClick={() => {
            if (index === last) setPrediction("");
            setIndex(index === last ? 0 : index + 1);
          }}
        >
          {frame.next}
        </ChapterButton>
      </HStack>
      <VStack as="figcaption" gap={2} className="walkthrough-note">
        <VStack
          gap={2}
          role="status"
          aria-label="Step explanation"
          aria-live="polite"
          aria-atomic="true"
        >
          <Text type="label">
            Step {index + 1} of {last + 1} · {frame.title}
          </Text>
          <Text as="p">{frame.change}</Text>
          <Text as="p">{frame.why}</Text>
          {index === last && prediction && (
            <Text as="p" type="label">
              {prediction === "log"
                ? "Your prediction fits the evidence."
                : prediction === "both"
                  ? "Trace the direct path again. It has no copy of 002 to send."
                  : "Look at 002 in the log. It supplied the reader after the shop stopped sending orders."}
            </Text>
          )}
        </VStack>
        {index === last - 1 && (
          <Selector
            label="Predict who can recover 002"
            placeholder="Choose a prediction"
            width="100%"
            value={prediction}
            onChange={setPrediction}
            options={[
              { value: "both", label: "Both designs" },
              { value: "log", label: "Only the retained log" },
              { value: "neither", label: "Neither design" },
            ]}
          />
        )}
      </VStack>
    </VStack>
  );
}
