import { VStack } from "@astryxdesign/core/VStack";
import { Heading } from "@astryxdesign/core/Heading";

export function ChapterOverview() {
  return (
    <VStack
      as="figure"
      gap={4}
      className="chapter-overview"
      aria-label="One order, two independent reactions"
    >
      <Heading level={2}>One order, two reactions</Heading>
      <svg
        viewBox="0 0 360 146"
        className="order-illustration"
        role="img"
        aria-label="One OrderPlaced ticket branches to a customer confirmation and an entry in a sales report."
      >
        <g className="path-node">
          <path d="M10 18 H97 L116 37 V126 L106 121 L96 126 L86 121 L76 126 L66 121 L56 126 L46 121 L36 126 L26 121 L10 126 Z M97 18 V37 H116" />
          <text className="path-caption" x="21" y="51">
            OrderPlaced
          </text>
          <text className="receipt-id" x="21" y="82">
            #001
          </text>
          <path className="path-wire" d="M22 99 H91 M22 106 H68" />
        </g>
        <g className="path-wire" fill="none">
          <path d="M117 74 H134 Q144 74 144 64 V45 Q144 36 154 36 H177 M171 31 L177 36 L171 41" />
          <path d="M134 74 Q144 74 144 84 V102 Q144 111 154 111 H177 M171 106 L177 111 L171 116" />
        </g>
        <g className="path-node">
          <rect x="184" y="23" width="36" height="26" rx="3" />
          <path d="M185 25 L202 38 L219 25" fill="none" />
          <path d="M184 124 H220 M188 120 V112 H194 V120 Z M199 120 V105 H205 V120 Z M210 120 V97 H216 V120 Z" />
        </g>
        <text className="path-label" x="230" y="34">
          Notifications
        </text>
        <text className="path-caption" x="230" y="53">
          Send confirmation
        </text>
        <text className="path-label" x="230" y="106">
          Analytics
        </text>
        <text className="path-caption" x="230" y="125">
          Update sales report
        </text>
      </svg>
      <figcaption>
        Order 001 has happened. Its confirmation and sales entry are two
        separate pieces of work.
      </figcaption>
    </VStack>
  );
}
