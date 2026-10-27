import {
  initialOrdering,
  stepOrdering,
  orderingEvidence,
  type OrderingConfig,
  type OrderingState,
} from "./ordering";
export function orderingTimeline(config: OrderingConfig) {
  const states = [initialOrdering(config)];
  while (states.at(-1)!.completed.length < 9) {
    const previous = states.at(-1)!;
    states.push(
      stepOrdering(previous, {
        type: previous.published < 9 ? "publish" : "process",
      }),
    );
  }
  return states;
}
export function explainOrderingStep(states: OrderingState[], index: number) {
  const state = states[index],
    previous = states[Math.max(0, index - 1)];
  if (index === 0)
    return {
      title: "Before publication",
      change: "No events are routed yet.",
      focus: "Notice the empty partition lanes.",
      reason:
        "First locate each customer’s records; processing starts only after all nine are published.",
    };
  if (state.published > previous.published) {
    const record = state.logs.flat().find((r) => r.id === state.published)!;
    return {
      title: `Route event ${record.id}`,
      change: `${record.customer} #${record.sequence} goes to P${record.partition}, offset ${record.offset}.`,
      focus: `Read its key: ${record.key ?? "none (teaching round-robin)"}.`,
      reason:
        "Routing determines which serial lane will handle this event. No business work has completed yet.",
    };
  }
  const completed = state.completed.slice(previous.completed.length);
  const broken = !orderingEvidence(state).inOrder;
  return {
    title: `Processing tick ${state.tick}`,
    change: completed.length
      ? `${completed.length} event(s) completed this tick. Check their customer sequences below.`
      : "No event completed; the slow lane is still working.",
    focus: broken
      ? "Compare each customer’s completion sequence with #1 → #2 → #3."
      : "Compare the slow P0 lane with the other lanes and the customer completion sequences.",
    reason: broken
      ? "A later source event has completed before, or concurrently with, an earlier event for that customer. Partition-local ordering cannot coordinate split lanes."
      : "Each lane is serial, but lanes run independently. Ordered completion requires keeping related events together and processing them serially.",
  };
}
