import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { Heading } from "@astryxdesign/core/Heading";

/** An overview of the question; implementation details come in the lesson. */
export function ChapterOverview() {
  return (
    <VStack
      as="figure"
      gap={5}
      className="chapter-overview"
      aria-label="One order, two independent reactions"
    >
      <HStack gap={3} hAlign="between" wrap="wrap">
        <Text type="supporting" className="eyebrow">
          THE QUESTION WE WILL EXPLORE
        </Text>
        <Text type="code">OrderPlaced</Text>
      </HStack>
      <HStack className="overview-flow" gap={5} wrap="wrap" vAlign="center">
        <VStack gap={2} className="overview-origin">
          <Text type="supporting">01 / A fact happens</Text>
          <Heading level={3}>An order is placed.</Heading>
          <Text type="supporting">The order service publishes an event.</Text>
        </VStack>
        <Text className="overview-arrow" aria-hidden="true">
          →
        </Text>
        <VStack gap={3} className="overview-reactions">
          <HStack gap={3} className="overview-reaction">
            <Text className="service-mark" aria-hidden="true">
              N
            </Text>
            <VStack gap={0.5}>
              <Text type="label">Notifications</Text>
              <Text type="supporting">Send the customer a confirmation.</Text>
            </VStack>
          </HStack>
          <HStack gap={3} className="overview-reaction">
            <Text className="service-mark" aria-hidden="true">
              A
            </Text>
            <VStack gap={0.5}>
              <Text type="label">Analytics</Text>
              <Text type="supporting">Update the order report.</Text>
            </VStack>
          </HStack>
        </VStack>
      </HStack>
      <figcaption>
        What should happen to notifications when analytics stops?
      </figcaption>
    </VStack>
  );
}
