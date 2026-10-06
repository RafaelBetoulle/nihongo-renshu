import { MODULES } from "../quiz/catalog.js";
import { MASTERED_BOX } from "../core/srs.js";
import { canSpeak, hasJapaneseVoice, speak } from "../core/speech.js";
import { esc } from "../core/util.js";

const MODULE_LABELS = { kana: "Kana", vocab: "Vocabulaire", kanji: "Kanji" };

const TOGGLES = [
  ["showReading", "Afficher la lecture sous les mots (questions « Sens »)"],
  ["romaji", "Afficher le rōmaji à côté du japonais (sauf quand c'est la réponse attendue)"],
  ["kanjiMeaning", "Afficher le sens de chaque kanji (ex. 図書館 → 図 plan · 書 écrire · 館 bâtiment)"],
  ["tipOnError", "Montrer l'astuce après une erreur"],
  ["autoSpeak", "Prononcer automatiquement la réponse"]
];

function progressTable(store, ui) {
  return Object.entries(MODULE_LABELS)
    .map(([m, label]) => {
      const items = MODULES[m];
      const seen = items.filter((it) => store.card(it.key)).length;
      const mastered = items.filter((it) => (store.card(it.key)?.box ?? 0) >= MASTERED_BOX).length;
      const due = items.filter((it) => store.isDue(it.key)).length;
      const pct = ui.masteryOf(items);
      return `<tr><td>${label}</td><td>${seen}/${items.length}</td><td>${mastered}</td><td>${due}</td><td><div class="meter"><div style="width:${pct}%"></div></div></td></tr>`;
    })
    .join("");
}

function historyTable(history) {
  const recent = history.slice(-12).reverse();
  if (!recent.length) return `<p class="muted">Aucune session pour l'instant.</p>`;
  const date = (d) => new Date(d).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  return `<table class="table"><thead><tr><th>Date</th><th>Session</th><th>Score</th><th>Durée</th></tr></thead><tbody>
    ${recent.map((h) => `<tr><td>${date(h.date)}</td><td>${esc(h.title)}</td><td>${h.firstTry}/${h.total}</td><td>${Math.floor(h.secs / 60)} min ${h.secs % 60} s</td></tr>`).join("")}
  </tbody></table>`;
}

function download(filename, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function renderProgress(ctx) {
  const { app, store, ui, applyTheme, go } = ctx;
  const s = store.settings;
  const voiceWarning = !canSpeak()
    ? "Ton navigateur ne sait pas lire à voix haute."
    : hasJapaneseVoice()
      ? ""
      : "Aucune voix japonaise trouvée : installe-en une dans les réglages de ton système.";

  app.innerHTML = `
    <h1 class="page-title">Progrès & réglages</h1>
    <div class="card"><h2>Où j'en suis</h2>
      <table class="table"><thead><tr><th>Module</th><th>Vus</th><th>Maîtrisés</th><th>À revoir</th><th>Maîtrise</th></tr></thead>
      <tbody>${progressTable(store, ui)}</tbody></table>
    </div>
    <div class="card"><h2>Dernières sessions</h2>${historyTable(store.history)}</div>
    <div class="card"><h2>Réglages</h2>
      <div class="check">Thème :
        <label><input type="radio" name="theme" value="kanapro" ${s.theme === "kanapro" ? "checked" : ""}> Kana Pro (clair)</label>
        <label><input type="radio" name="theme" value="modern" ${s.theme === "modern" ? "checked" : ""}> Moderne (suit le mode clair/sombre du système)</label>
      </div>
      ${TOGGLES.map(([key, label]) => `<label class="check"><input type="checkbox" data-setting="${key}" ${s[key] ? "checked" : ""}> ${label}</label>`).join("")}
      <p><button class="btn small" data-say="こんにちは。にほんごをべんきょうします。">🔊 Tester la voix</button>
        ${voiceWarning ? `<span class="muted small">${voiceWarning}</span>` : ""}</p>
    </div>
    <div class="card"><h2>Profil</h2>
      <p>Profil actuel : <b>${esc(store.profile.name)}</b> <button class="btn small" id="rename">Renommer</button></p>
      ${
        store.profiles.length > 1
          ? `<p>Changer de profil : ${store.profiles
              .filter((p) => p.id !== store.currentId)
              .map((p) => `<button class="btn small" data-switch="${p.id}">${esc(p.name)}</button>`)
              .join(" ")}</p>`
          : ""
      }
      <p><button class="btn small" id="new-profile">+ Nouveau profil</button>
        <button class="btn small danger" id="delete-profile">Supprimer ce profil</button></p>
      <p class="muted small">Tout est enregistré dans ce navigateur, rien n'est envoyé sur internet. Chaque profil a sa propre progression.</p>
    </div>
    <div class="card"><h2>Sauvegarde</h2>
      <p class="muted small">Exporte ta progression pour la garder ou la transférer sur un autre appareil.</p>
      <button class="btn" id="export">Exporter</button>
      <label class="btn">Importer… <input type="file" id="import" accept=".json" hidden></label>
      <button class="btn danger" id="reset">Remettre la progression à zéro</button>
    </div>`;

  app.querySelectorAll("[name=theme]").forEach((r) => {
    r.onchange = () => {
      s.theme = r.value;
      store.save();
      applyTheme();
    };
  });
  app.querySelectorAll("[data-setting]").forEach((c) => {
    c.onchange = () => {
      s[c.dataset.setting] = c.checked;
      store.save();
    };
  });
  app.querySelector("[data-say]").onclick = (e) => speak(e.currentTarget.dataset.say);

  app.querySelector("#rename").onclick = () => {
    const name = prompt("Nouveau nom :", store.profile.name)?.trim();
    if (name) {
      store.renameProfile(name);
      renderProgress(ctx);
    }
  };
  app.querySelectorAll("[data-switch]").forEach((b) => {
    b.onclick = () => {
      store.selectProfile(b.dataset.switch);
      applyTheme();
      go("#/");
    };
  });
  app.querySelector("#new-profile").onclick = () => {
    const name = prompt("Prénom du nouveau profil :")?.trim();
    if (name) {
      store.createProfile(name);
      applyTheme();
      go("#/");
    }
  };
  app.querySelector("#delete-profile").onclick = () => {
    if (!confirm(`Supprimer le profil « ${store.profile.name} » et toute sa progression ?`)) return;
    store.deleteProfile(store.currentId);
    go("#/");
  };

  app.querySelector("#export").onclick = () =>
    download(
      `nihongo-renshu-${store.profile.name}-${new Date().toISOString().slice(0, 10)}.json`,
      store.exportProfile()
    );
  app.querySelector("#import").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      store.importProfile(await file.text());
      applyTheme();
      renderProgress(ctx);
    } catch {
      alert("Ce fichier n'est pas une sauvegarde valide.");
    }
  };
  app.querySelector("#reset").onclick = () => {
    if (confirm("Effacer toute la progression de ce profil ? (tes astuces sont conservées)")) {
      store.resetProgress();
      renderProgress(ctx);
    }
  };
}
