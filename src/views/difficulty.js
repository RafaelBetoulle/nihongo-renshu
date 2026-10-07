import { esc } from "../core/util.js";

const AIDS = [
  ["showReading", "Lecture en kana"],
  ["romaji", "Rōmaji"],
  ["kanjiMeaning", "Sens des kanji"]
];
export const difficultyBar = () => `<div class="difficulty" data-difficulty></div>`;

// Aids never show what the question asks for, so some of them have no effect on a given exercise.
export function bindDifficulty(root, store, onChange) {
  const box = root.querySelector("[data-difficulty]");
  if (!box) return;
  const settings = store.settings;

  const draw = () => {
    box.innerHTML = `<span class="difficulty-title">Difficulté</span>
      ${AIDS.map(([key, label]) => `<label class="aid"><input type="checkbox" data-aid="${key}" ${settings[key] ? "checked" : ""}> ${esc(label)}</label>`).join("")}`;
  };
  const commit = () => {
    store.save();
    draw();
    onChange?.();
  };

  box.onchange = (ev) => {
    const key = ev.target.dataset.aid;
    if (!key) return;
    settings[key] = ev.target.checked;
    commit();
  };
  draw();
}
