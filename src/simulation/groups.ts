export type GroupConfig = { workers: number; independent: boolean };
export type GroupMember = { id: string; role: "inventory" | "analytics" };
export type ConsumerGroup = {
  id: string;
  members: GroupMember[];
  positions: number[];
  cursors: number[];
};
export type Delivery = {
  group: string;
  member: string;
  role: string;
  partition: number;
  offset: number;
  tick: number;
};
export type GroupState = {
  config: GroupConfig;
  tick: number;
  groups: ConsumerGroup[];
  deliveries: Delivery[];
  analyticsPaused: boolean;
  history: string[];
  message: string;
  rebalanced: boolean;
};
export const partitionCount = 4,
  recordsPerPartition = 3,
  totalGroupRecords = 12;
export function assignment(group: ConsumerGroup) {
  return Array.from(
    { length: partitionCount },
    (_, p) => group.members[p % group.members.length].id,
  );
}
function inventoryMembers(workers: number): GroupMember[] {
  return Array.from({ length: workers }, (_, i) => ({
    id: `inventory-${i + 1}`,
    role: "inventory",
  }));
}
export function initialGroups(
  config: GroupConfig = { workers: 2, independent: true },
): GroupState {
  if (
    !Number.isInteger(config.workers) ||
    config.workers < 1 ||
    config.workers > 5
  )
    throw new Error("Choose 1–5 inventory consumers");
  const members = inventoryMembers(config.workers);
  if (!config.independent)
    members.push({ id: "analytics-1", role: "analytics" });
  const groups: ConsumerGroup[] = [
    {
      id: "inventory",
      members,
      positions: [0, 0, 0, 0],
      cursors: Array(members.length).fill(0),
    },
  ];
  if (config.independent)
    groups.push({
      id: "analytics",
      members: [{ id: "analytics-1", role: "analytics" }],
      positions: [0, 0, 0, 0],
      cursors: [0],
    });
  return {
    config: { ...config },
    tick: 0,
    groups,
    deliveries: [],
    analyticsPaused: false,
    history: ["Four retained partitions contain three records each."],
    message: "Inspect partition ownership and the separate group positions.",
    rebalanced: false,
  };
}
export type GroupAction =
  | { type: "tick" }
  | { type: "analytics"; paused: boolean }
  | { type: "resize"; workers: number };
export function stepGroups(
  previous: GroupState,
  action: GroupAction,
): GroupState {
  const s: GroupState = {
    ...previous,
    config: { ...previous.config },
    groups: previous.groups.map((g) => ({
      ...g,
      members: [...g.members],
      positions: [...g.positions],
      cursors: [...g.cursors],
    })),
    deliveries: [...previous.deliveries],
    history: [...previous.history],
  };
  if (action.type === "analytics") {
    s.analyticsPaused = action.paused;
    s.message = `Analytics processing ${action.paused ? "paused" : "resumed"}; membership is unchanged.`;
  } else if (action.type === "resize") {
    if (
      !Number.isInteger(action.workers) ||
      action.workers < 1 ||
      action.workers > 5
    )
      throw new Error("Choose 1–5 inventory consumers");
    const g = s.groups[0];
    g.members = inventoryMembers(action.workers);
    if (!s.config.independent)
      g.members.push({ id: "analytics-1", role: "analytics" });
    g.cursors = Array(g.members.length).fill(0);
    s.config.workers = action.workers;
    s.rebalanced = true;
    s.message =
      "Membership changed. Recomputed partition ownership; group positions stay at the next unprocessed record. This atomic reassignment omits real protocol delays and restart commits.";
  } else {
    s.tick++;
    let processed = 0;
    for (const g of s.groups) {
      const owners = assignment(g);
      for (let memberIndex = 0; memberIndex < g.members.length; memberIndex++) {
        const m = g.members[memberIndex];
        if (m.role === "analytics" && s.analyticsPaused) continue;
        const owned = owners
          .map((owner, p) => (owner === m.id ? p : -1))
          .filter((p) => p >= 0);
        for (let n = 0; n < owned.length; n++) {
          const index = (g.cursors[memberIndex] + n) % owned.length,
            p = owned[index];
          if (g.positions[p] >= recordsPerPartition) continue;
          s.deliveries.push({
            group: g.id,
            member: m.id,
            role: m.role,
            partition: p,
            offset: g.positions[p]++,
            tick: s.tick,
          });
          g.cursors[memberIndex] = (index + 1) % owned.length;
          processed++;
          break;
        }
      }
    }
    s.message = `Model tick ${s.tick}: ${processed} record processing operation(s). Each active member handles at most one record across all its assigned partitions.`;
  }
  s.history.push(s.message);
  return s;
}
export function groupTimeline(config: GroupConfig) {
  let state = initialGroups(config);
  const states = [state];
  const add = (action: GroupAction) => {
    state = stepGroups(state, action);
    states.push(state);
  };
  add({ type: "analytics", paused: true });
  add({ type: "tick" });
  add({ type: "tick" });
  add({ type: "resize", workers: config.workers < 5 ? config.workers + 1 : 4 });
  add({ type: "tick" });
  add({ type: "analytics", paused: false });
  for (
    let i = 0;
    i < 16 &&
    state.groups.some((g) =>
      g.positions.some((position) => position < recordsPerPartition),
    );
    i++
  )
    add({ type: "tick" });
  return states;
}
export function roleCount(s: GroupState, role: string) {
  return s.deliveries.filter((d) => d.role === role).length;
}
export function assessGroups(config: GroupConfig) {
  let state = initialGroups(config);
  state = stepGroups(state, { type: "analytics", paused: true });
  for (let i = 0; i < 6; i++) state = stepGroups(state, { type: "tick" });
  const inventoryOnTime = roleCount(state, "inventory") === 12;
  state = stepGroups(state, { type: "analytics", paused: false });
  for (let i = 0; i < 16; i++) state = stepGroups(state, { type: "tick" });
  const inventoryAll = roleCount(state, "inventory") === 12,
    analyticsAll = roleCount(state, "analytics") === 12;
  const passed = inventoryOnTime && inventoryAll && analyticsAll;
  return {
    passed,
    inventoryOnTime,
    inventoryAll,
    analyticsAll,
    state,
    feedback: passed
      ? "Inventory processed all 12 records within six model ticks while analytics was paused. Analytics later read all 12 independently. The inventory consumers shared work within one group; the analytics group had its own positions."
      : !config.independent
        ? "Analytics shares partition work with inventory in this design. It does not receive a copy of records handled by other members, and its paused assignments can delay that group. Use separate groups when both services need the full stream."
        : "One inventory consumer processes at most six records in six ticks. Add inventory consumers in the same inventory group to share partition work; keep analytics in its own group.",
  };
}
export function explainGroupFrame(states: GroupState[], index: number) {
  const s = states[index],
    before = states[Math.max(0, index - 1)];
  if (index === 0)
    return {
      title: "Initial ownership",
      change: "Each partition has one owner in each group.",
      focus: "Compare the group names, owners, and next positions.",
      reason:
        "Different groups read the same retained logs independently. Members within a group share the partition work.",
    };
  if (s.rebalanced && !before.rebalanced)
    return {
      title: "Membership change",
      change: "Inventory membership changed and ownership was recalculated.",
      focus:
        "Compare the new owners with the previous step; positions were preserved.",
      reason:
        "A reassignment changes who handles future work. It does not create a second independent subscription.",
    };
  if (s.analyticsPaused !== before.analyticsPaused)
    return {
      title: s.analyticsPaused ? "Analytics paused" : "Analytics resumed",
      change: s.message,
      focus: "Watch analytics positions and inventory progress separately.",
      reason:
        "This is a processing pause with membership retained, not a real failure, poll timeout, or consumer leaving the group.",
    };
  return {
    title: `Processing tick ${s.tick}`,
    change: `Inventory has processed ${roleCount(s, "inventory")}/12; analytics ${roleCount(s, "analytics")}/12.`,
    focus:
      "Inspect which members own unfinished partitions and which are idle.",
    reason: s.config.independent
      ? "Each group has its own positions. A read by inventory does not advance analytics."
      : "The services share one group’s positions. A record processed by one member is not delivered again to the other role in this successful-processing model.",
  };
}
