import { shuffle } from "../core/util.js";

// Quizlet-style "Learn": a word climbs one stage per correct first try, each stage being harder
// (recognise the meaning, find the Japanese, then type it), and steps back down on a miss.
export const LEARN_MODES = ["meaning", "recall", "write"];
export const LEARNED = LEARN_MODES.length;
export const ROUND_SIZE = 20;

export const nextStage = (stage, ok) => (ok ? Math.min(stage + 1, LEARNED) : Math.max(stage - 1, 0));

export function learnSummary(items, stageOf) {
  const counts = { fresh: 0, learning: 0, learned: 0 };
  for (const it of items) {
    const stage = stageOf(it.key);
    counts[stage >= LEARNED ? "learned" : stage > 0 ? "learning" : "fresh"]++;
  }
  return counts;
}

// Words already started come first so they get finished before new ones are introduced.
export function planLearn(items, stageOf, { size = ROUND_SIZE, random = Math.random } = {}) {
  const open = items.filter((it) => stageOf(it.key) < LEARNED);
  const started = shuffle(
    open.filter((it) => stageOf(it.key) > 0),
    random
  );
  const fresh = open.filter((it) => stageOf(it.key) === 0);
  return shuffle([...started, ...fresh].slice(0, size), random).map((item) => ({
    item,
    mode: LEARN_MODES[stageOf(item.key)]
  }));
}
