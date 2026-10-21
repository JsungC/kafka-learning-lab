export const key = "kafka-lab-progress";
export type Progress = {
  version: 1;
  viewed: boolean;
  experiments: string[];
  attempts: number;
  missionPassed: boolean;
};
export const emptyProgress = (): Progress => ({
  version: 1,
  viewed: false,
  experiments: [],
  attempts: 0,
  missionPassed: false,
});
export function loadProgress(storage: Pick<Storage, "getItem">): Progress {
  try {
    const p: unknown = JSON.parse(storage.getItem(key) || "null");
    if (!p || typeof p !== "object") return emptyProgress();
    const v = p as Partial<Progress>;
    if (
      v.version !== 1 ||
      typeof v.viewed !== "boolean" ||
      !Array.isArray(v.experiments) ||
      !v.experiments.every((x) => x === "direct" || x === "log") ||
      !Number.isSafeInteger(v.attempts) ||
      (v.attempts ?? -1) < 0 ||
      typeof v.missionPassed !== "boolean"
    )
      return emptyProgress();
    return v as Progress;
  } catch {
    return emptyProgress();
  }
}
export function complete(p: Progress) {
  return (
    p.experiments.includes("direct") &&
    p.experiments.includes("log") &&
    p.missionPassed
  );
}
