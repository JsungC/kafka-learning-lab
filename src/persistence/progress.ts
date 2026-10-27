export const key = "kafka-lab-progress";
export type Chapter2Progress = {
  viewed: boolean;
  experiments: string[];
  attempts: number;
  missionPassed: boolean;
};
export const emptyChapter2 = (): Chapter2Progress => ({
  viewed: false,
  experiments: [],
  attempts: 0,
  missionPassed: false,
});
export function completeChapter2(p?: Chapter2Progress) {
  return Boolean(
    p?.missionPassed &&
    p.experiments.includes("replay") &&
    p.experiments.includes("expiration"),
  );
}
export const emptyChapter3 = emptyChapter2;
export function completeChapter3(p?: Chapter2Progress) {
  return Boolean(
    p?.missionPassed &&
    p.experiments.includes("stable") &&
    p.experiments.includes("split"),
  );
}
export type Progress = {
  version: 1;
  viewed: boolean;
  experiments: string[];
  attempts: number;
  missionPassed: boolean;
  chapter2?: Chapter2Progress;
  chapter3?: Chapter2Progress;
  review?: Record<string, { choice: string; checked: boolean }>;
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
    const base = { ...v } as Progress;
    const chapter2 = v.chapter2;
    if (
      chapter2 !== undefined &&
      (!chapter2 ||
        typeof chapter2 !== "object" ||
        typeof chapter2.viewed !== "boolean" ||
        !Array.isArray(chapter2.experiments) ||
        !chapter2.experiments.every(
          (x) => x === "replay" || x === "expiration",
        ) ||
        !Number.isSafeInteger(chapter2.attempts) ||
        chapter2.attempts < 0 ||
        typeof chapter2.missionPassed !== "boolean")
    )
      delete base.chapter2;
    const chapter3 = v.chapter3;
    if (
      chapter3 !== undefined &&
      (!chapter3 ||
        typeof chapter3 !== "object" ||
        typeof chapter3.viewed !== "boolean" ||
        !Array.isArray(chapter3.experiments) ||
        !chapter3.experiments.every((x) => x === "stable" || x === "split") ||
        !Number.isSafeInteger(chapter3.attempts) ||
        chapter3.attempts < 0 ||
        typeof chapter3.missionPassed !== "boolean")
    )
      delete base.chapter3;
    if (
      v.review !== undefined &&
      (!v.review ||
        typeof v.review !== "object" ||
        Array.isArray(v.review) ||
        !Object.values(v.review).every(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.choice === "string" &&
            item.choice.length <= 128 &&
            typeof item.checked === "boolean",
        ))
    ) {
      const { review: ignored, ...validProgress } = base;
      return validProgress;
    }
    return base;
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
