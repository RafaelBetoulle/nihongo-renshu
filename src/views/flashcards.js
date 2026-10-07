import { speak } from "../core/speech.js";
import { esc, shuffle } from "../core/util.js";
import { bindDifficulty, difficultyBar } from "./difficulty.js";

// Flip cards sorted into "known" / "to review"; the to-review pile can be replayed until it is empty.
// Only the first pass counts for spaced repetition.
export function startFlashcards(outer, items, { store, ui, title, onExit }) {
  const root = document.createElement("div");
  outer.replaceChildren(root);
  const prefs = (store.prefs.vocab ??= {});
  const startedAt = Date.now();
  const firstPass = items.length;
  let known = 0;

  // On the Japanese front the reading is an aid (difficulty settings); on the back it is the answer.
  function reading(w, aid) {
    const kana = w.jp !== w.kana && (!aid || store.settings.showReading);
    return `${kana ? `<div class="jp fc-reading">${esc(w.kana)}</div>` : ""}${store.settings.romaji ? `<div class="muted"><i>${esc(w.romaji)}</i></div>` : ""}`;
  }

  function faces(w) {
    const jp = `<div class="fc-main jp">${esc(w.jp)}</div>`;
    const fr = `<div class="fc-main fr">${esc(w.fr)}</div>`;
    const extra = `${ui.meanings(w.jp)}${w.note ? `<div class="muted small">dico : <span class="jp">${esc(w.note)}</span></div>` : ""}${ui.speakButton(w.kana)}`;
    return prefs.front === "fr"
      ? [fr, `${jp}${reading(w, false)}${extra}`]
      : [`${jp}${reading(w, true)}`, `${fr}${reading(w, false)}${extra}`];
  }

  function deal(deck, record) {
    const again = [];
    let i = 0;

    root.innerHTML = `
      <div class="quiz fc">
        <div class="quiz-top">
          <button class="btn ghost small" data-act="quit">✕ Quitter</button>
          <div class="progress"><div class="progress-bar"></div></div>
          <div class="counter"></div>
        </div>
        <div class="fc-card" role="button" tabindex="0" aria-label="Retourner la carte"><div class="fc-inner">
          <div class="card fc-face fc-front"></div>
          <div class="card fc-face fc-back"></div>
        </div></div>
        <div class="fc-actions">
          <button class="btn again" data-act="again">✗ À revoir</button>
          <button class="btn" data-act="flip">Retourner</button>
          <button class="btn know" data-act="know">✓ Je sais</button>
        </div>
        <div class="fc-options">
          <button class="link" data-act="side"></button>
          <button class="link" data-act="shuffle">Mélanger</button>
        </div>
        <div class="quiz-hint muted">Espace : retourner · ← à revoir · → je sais · S : écouter</div>
        ${difficultyBar()}
      </div>`;

    const $ = (s) => root.querySelector(s);
    const card = $(".fc-card");
    const flip = () => card.classList.toggle("flipped");

    function paint() {
      const [front, back] = faces(deck[i]);
      $(".fc-front").innerHTML = front;
      $(".fc-back").innerHTML = back;
    }
    bindDifficulty(root, store, () => {
      if (i < deck.length && card.isConnected) paint();
    });

    function show() {
      if (i >= deck.length) return finish(false);
      // Un-flip without animation, otherwise the next card's answer shows while it turns back.
      card.classList.add("instant");
      card.classList.remove("flipped");
      void card.offsetWidth;
      card.classList.remove("instant");
      paint();
      $(".progress-bar").style.width = `${(100 * i) / deck.length}%`;
      $(".counter").textContent = `${i + 1} / ${deck.length}`;
      $("[data-act=side]").textContent = `Recto : ${prefs.front === "fr" ? "français" : "japonais"}`;
    }

    function grade(ok) {
      const w = deck[i];
      if (record) store.record(w.key, ok);
      if (ok) known += record ? 1 : 0;
      else again.push(w);
      i++;
      show();
    }

    card.onclick = (ev) => {
      if (!ev.target.closest("button")) flip();
    };
    $("[data-act=flip]").onclick = flip;
    $("[data-act=know]").onclick = () => grade(true);
    $("[data-act=again]").onclick = () => grade(false);
    $("[data-act=quit]").onclick = () => finish(true);
    $("[data-act=side]").onclick = () => {
      prefs.front = prefs.front === "fr" ? "jp" : "fr";
      store.save();
      show();
    };
    $("[data-act=shuffle]").onclick = () => {
      deck = [...deck.slice(0, i), ...shuffle(deck.slice(i))];
      show();
    };

    function onKey(ev) {
      if (!card.isConnected) return document.removeEventListener("keydown", onKey);
      if (ev.key === " " || ev.key === "Enter") {
        ev.preventDefault();
        flip();
      } else if (ev.key === "ArrowRight") grade(true);
      else if (ev.key === "ArrowLeft") grade(false);
      else if (ev.key.toLowerCase() === "s") speak(deck[i]?.kana);
    }
    document.addEventListener("keydown", onKey);

    function finish(quit) {
      document.removeEventListener("keydown", onKey);
      const left = [...again, ...deck.slice(i)];
      if (record && i) {
        const secs = Math.round((Date.now() - startedAt) / 1000);
        store.logSession({ title, total: i, firstTry: known, secs });
      }
      root.innerHTML = `
        <div class="card result">
          <h2>${quit ? "Cartes interrompues" : left.length ? "Paquet terminé" : "Toutes les cartes sont sues !"}</h2>
          <div class="stats-row">
            <div class="stat"><div class="stat-num">${firstPass - left.length}</div><div class="stat-lbl">sues</div></div>
            <div class="stat"><div class="stat-num">${left.length}</div><div class="stat-lbl">à revoir</div></div>
          </div>
          ${left.length ? "" : `<p class="center">すごい！</p>`}
          <div class="actions">
            ${left.length ? `<button class="btn primary" data-act="left">Revoir les ${left.length} cartes restantes</button>` : ""}
            <button class="btn" data-act="restart">Recommencer</button>
            <button class="btn ghost" data-act="back">Retour</button>
          </div>
        </div>`;
      root.querySelector("[data-act=left]")?.addEventListener("click", () => deal(shuffle(left), false));
      root.querySelector("[data-act=restart]").onclick = () =>
        startFlashcards(outer, shuffle(items), { store, ui, title, onExit });
      root.querySelector("[data-act=back]").onclick = onExit;
    }

    show();
  }

  deal(items, true);
}
