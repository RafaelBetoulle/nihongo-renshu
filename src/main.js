import { createStore } from "./core/store.js";
import { speak } from "./core/speech.js";
import { byKey, defaultTip } from "./quiz/catalog.js";
import { startSession } from "./quiz/session.js";
import { createUi } from "./views/ui.js";
import { renderHome, runDaily } from "./views/home.js";
import { renderKana } from "./views/kana.js";
import { renderStudy } from "./views/study.js";
import { renderVocab } from "./views/vocab.js";
import { renderTips } from "./views/tips.js";
import { renderProgress } from "./views/progress.js";
import { renderWelcome } from "./views/welcome.js";

const app = document.getElementById("app");
const store = createStore();
const ui = createUi(store);

const go = (hash) => {
  if (location.hash === hash) render();
  else location.hash = hash;
};

function applyTheme() {
  const theme = store.profile?.settings.theme ?? "kanapro";
  document.body.classList.toggle("theme-kp", theme === "kanapro");
  const toggle = document.getElementById("theme-toggle");
  toggle.textContent = theme === "kanapro" ? "Thème : Classique" : "Thème : Moderne";
  toggle.hidden = !store.profile;
}

function runQuiz(entries, title, back, extra = {}) {
  if (!entries.length) {
    alert("Aucune question : sélectionne au moins une liste.");
    return;
  }
  startSession(app, entries, { store, ui, title, onExit: () => go(back), ...extra });
}

const ctx = { app, store, ui, go, runQuiz, applyTheme };

const ROUTES = {
  "": () => renderHome(ctx),
  daily: () => runDaily(ctx),
  kana: () => renderKana(ctx),
  vocab: (path) => renderVocab(ctx, path),
  kanji: () => renderStudy("kanji", ctx),
  tips: () => renderTips(ctx),
  progress: () => renderProgress(ctx)
};

function render() {
  document.querySelector("nav").hidden = !store.profile;
  if (!store.profile) {
    renderWelcome(ctx);
    return;
  }
  const [route, ...path] = location.hash.replace(/^#\/?/, "").split("/");
  document
    .querySelectorAll("nav a")
    .forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#/${route}`));
  (ROUTES[route] ?? ROUTES[""])(path);
  window.scrollTo(0, 0);
}

function editTip(key) {
  const item = byKey.get(key);
  if (!item) return;
  const text = prompt("Ton astuce (laisse vide pour revenir à celle d'origine) :", ui.tipFor(item));
  if (text === null) return;
  store.setTip(key, text === defaultTip(item) ? "" : text);
  document.querySelectorAll(`[data-tip="${CSS.escape(key)}"]`).forEach((el) => {
    el.outerHTML = ui.tip(item);
  });
}

document.addEventListener("click", (e) => {
  const sayButton = e.target.closest("[data-say]");
  if (sayButton) speak(sayButton.dataset.say);
  const editButton = e.target.closest("[data-edit-tip]");
  if (editButton) editTip(editButton.dataset.editTip);
});

document.getElementById("theme-toggle").onclick = () => {
  store.settings.theme = store.settings.theme === "kanapro" ? "modern" : "kanapro";
  store.save();
  applyTheme();
};

window.addEventListener("hashchange", render);
applyTheme();
render();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
