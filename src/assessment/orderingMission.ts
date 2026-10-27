import {
  runOrdering,
  orderingEvidence,
  type OrderingConfig,
} from "../simulation/ordering";
export function assessOrdering(config: OrderingConfig) {
  const state = runOrdering(config);
  const evidence = orderingEvidence(state);
  const passed =
    evidence.placement &&
    evidence.inOrder &&
    evidence.parallel &&
    evidence.allProcessed;
  const reasons: string[] = [];
  if (!evidence.placement)
    reasons.push(
      "One customer’s records were split across partitions. Partition-local ordering cannot enforce that customer’s order across those lanes. Choose a stable customer key, rather than a new event key or keyless distribution.",
    );
  if (!evidence.inOrder)
    reasons.push(
      "The slow lane let a later event from the same customer finish before or in the same model tick as an earlier one. Inspect the customer completion sequences below.",
    );
  if (!evidence.parallel)
    reasons.push(
      "Only one partition lane worked at a time. One partition or a constant key preserves this input order but does not meet the requirement for cross-customer parallel work.",
    );
  return {
    passed,
    state,
    evidence,
    feedback: passed
      ? "Every customer stayed on one lane, completed sequences 1–2–3, and at least two partition lanes worked in the same model tick. This is valid under the fixed partition count, teaching partitioner, successful ordered publication, and serial-per-partition processing assumptions."
      : reasons.join(" "),
  };
}
