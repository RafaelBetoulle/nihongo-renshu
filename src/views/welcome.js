export function renderWelcome({ app, store, applyTheme, go }) {
  app.innerHTML = `
    <div class="card welcome">
      <div class="welcome-kana jp">ようこそ</div>
      <p class="ro-line">Yōkoso — Bienvenue !</p>
      <h1>Nihongo Renshū</h1>
      <p>Révise les kana, le vocabulaire et les kanji de base, à ton rythme.<br>
        Ta progression reste sur cet appareil : pas de compte, pas de serveur.</p>
      <form id="welcome-form">
        <label for="name">Comment tu t'appelles ?</label>
        <input id="name" class="answer-input" maxlength="30" autocomplete="given-name" required placeholder="Prénom">
        <button class="btn primary big" type="submit">C'est parti</button>
      </form>
    </div>`;
  const input = app.querySelector("#name");
  input.focus();
  app.querySelector("#welcome-form").onsubmit = (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) return;
    store.createProfile(name);
    applyTheme();
    go("#/");
  };
}
