export const groupLessons = [
  {
    id: "subscription",
    title: "4.1 / A group is one logical subscription",
    paragraphs: [
      "Inventory and analytics both need every order event, but for different reasons. Inventory updates stock; analytics builds reports. In the basic Kafka consumer-group model, each logical subscription has a group identity. Applications that need the full stream independently normally use different group IDs.",
      "Within a group, consumers cooperate. Each subscribed partition is assigned to one member at a time, so members share work rather than each receiving a copy of every record. Across groups, that same partition can have a separate owner and separate reading progress. The group is not a new topic and does not copy or delete the retained records.",
      "The number of consumers and the number of independent subscriptions answer different questions. Add members to an existing inventory group to share inventory work. Create a separate analytics group when analytics must receive the entire stream. Giving every inventory instance a unique group ID would make each instance process the full stream instead of sharing one logical inventory workload.",
    ],
  },
  {
    id: "assignment",
    title: "4.2 / Partition ownership limits useful parallelism",
    paragraphs: [
      "A member can own more than one partition. Four partitions with two members might give each member two partitions. More members can distribute that work, but five members cannot all own partitions when the group subscribes only to this four-partition topic. At least one member has no assignment. An idle member in this case is expected, not evidence of missing events.",
      "This chapter uses a simple deterministic assignment: partition number modulo member count selects an owner. This is a teaching rule, not a promise about Kafka’s assignor or protocol. Real assignments depend on subscriptions, configured assignors, group protocol, and membership. All members here subscribe to the same topic.",
      "More members do not automatically make a service faster. Available partitions, uneven load, downstream limits, and processing capacity matter. In this model a member can process one record per tick across all its assigned partitions. Owning four partitions does not grant one member four simultaneous processing slots. Step counts are educational values, not throughput measurements.",
    ],
  },
  {
    id: "positions",
    title: "4.3 / Separate groups keep separate progress",
    paragraphs: [
      "Suppose inventory has processed records through offset 2 in partition 0 while analytics has not read that partition. Inventory’s next position there is 3; analytics may still be at 0. Those positions belong to different logical subscriptions. Inventory reading a record does not move analytics’s position or remove that record from the shared log.",
      "Pausing analytics processing should not stop inventory when they use separate groups. Analytics can catch up later while the required records remain retained. If analytics is instead a member of the inventory group, it owns a share of that group’s work, not an independent copy. Other members do not automatically process its assignments just because its application work is paused.",
      "The timeline pauses processing while keeping the member present. A real application that stops polling, times out, crashes, or leaves can trigger different membership behavior. We do not equate a pause with failure detection. This model also has no retention expiration: real recovery still depends on the records remaining available.",
      "We show the next position after successful processing, not a complete Kafka offset-commit model. Reading, completing a business effect, and committing a restart position remain distinct. Chapter 5 will examine that distinction; successful processing here must not be interpreted as an exactly-once guarantee.",
    ],
  },
  {
    id: "membership",
    title: "4.4 / Membership changes can change ownership",
    paragraphs: [
      "When members join or leave, partition assignments can change. This coordination is commonly discussed as rebalancing. Follow the ownership rows before and after the inventory membership change in the timeline. The group still represents the same logical subscription even when a different member handles a partition.",
      "Our model reassigns ownership atomically between ticks and keeps each group’s next processed position. It does not recreate Kafka’s coordination, partition revocation, transfer delays, committed offsets, or restart behavior. Actual movement and disruption depend on the protocol and assignor; do not infer that every membership change stops every consumer or that partitions are always redistributed by this modulo rule.",
      "This successful, serial-per-partition model assigns one owner per partition per group. It is not a model of share groups, manual assignment, arbitrary concurrent external effects, or failure-related duplicate processing. Chapter 3’s ordering assumptions still apply: sharing partition ownership does not automatically order business effects that the application runs concurrently.",
    ],
  },
];
export const groupAssumptions =
  "Educational model: four fixed partitions, three retained records each, all members subscribe to the same topic, one owner per partition per group, teaching modulo assignment, one record per active member per tick, serial partition processing, no expiration or failures. Membership changes preserve successful processing positions instantaneously; commits and real rebalance protocols are not simulated.";
export const groupHints = [
  "Both services need every record. Decide which roles share a subscription and which need separate subscriptions.",
  "One inventory member handles at most six records in six ticks. Spread the 12 records over at least two inventory members.",
  "Use separate inventory and analytics groups with 2–5 inventory members. All four configurations satisfy this fixed scenario; a fifth member has no inventory partition assignment.",
];
