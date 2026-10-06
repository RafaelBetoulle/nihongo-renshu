export const DAY = 86_400_000;
export const INTERVALS = [0, 1, 2, 4, 8, 16, 32];
export const MASTERED_BOX = 4;

// A small safety margin so that a card reviewed in the evening is due again the next morning.
const MARGIN = DAY / 4;

export function review(card, correct, { hinted = false, now = Date.now() } = {}) {
  const next = { box: 0, ok: 0, ko: 0, due: 0, last: 0, ...card };
  if (correct) {
    next.ok++;
    next.box = hinted ? Math.max(next.box, 1) : Math.min(next.box + 1, INTERVALS.length - 1);
  } else {
    next.ko++;
    next.box = 0;
  }
  next.last = now;
  next.due = now + INTERVALS[next.box] * DAY - (next.box ? MARGIN : 0);
  return next;
}

export const isDue = (card, now = Date.now()) => Boolean(card) && card.due <= now;
export const mastery = (card) => (card ? Math.min(card.box / MASTERED_BOX, 1) : 0);

export function errorRate(card) {
  return (card.ko + 1) / (card.ok + card.ko + 2) - card.box * 0.1;
}
