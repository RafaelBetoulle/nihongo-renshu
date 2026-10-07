import * as srs from "./srs.js";

const PREFIX = "nihongo-renshu";
const INDEX_KEY = `${PREFIX}:profiles`;

export const DEFAULT_SETTINGS = {
  theme: "kanapro",
  sessionSize: 20,
  showReading: true,
  romaji: true,
  kanjiMeaning: true,
  autoSpeak: false,
  tipOnError: true
};

const emptyProfile = (name) => ({
  name,
  created: Date.now(),
  settings: { ...DEFAULT_SETTINGS },
  progress: {},
  history: [],
  tips: {},
  prefs: {},
  learn: {}
});

function safeStorage() {
  try {
    const k = `${PREFIX}:test`;
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return localStorage;
  } catch {
    const mem = new Map();
    return {
      getItem: (k) => mem.get(k) ?? null,
      setItem: (k, v) => mem.set(k, String(v)),
      removeItem: (k) => mem.delete(k)
    };
  }
}

export function createStore(backend = safeStorage()) {
  const read = (key, fallback) => {
    try {
      return JSON.parse(backend.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const write = (key, value) => backend.setItem(key, JSON.stringify(value));

  const index = read(INDEX_KEY, { current: null, profiles: [] });
  let profile = null;

  const profileKey = (id) => `${PREFIX}:profile:${id}`;

  function load(id) {
    const data = read(profileKey(id), null);
    if (!data) return null;
    data.settings = { ...DEFAULT_SETTINGS, ...data.settings };
    data.tips ??= {};
    data.prefs ??= {};
    data.learn ??= {};
    return data;
  }

  function save() {
    if (profile) write(profileKey(index.current), profile);
  }

  function select(id) {
    index.current = id;
    write(INDEX_KEY, index);
    profile = load(id);
  }

  if (index.current) profile = load(index.current);

  return {
    get profile() {
      return profile;
    },
    get profiles() {
      return index.profiles;
    },
    get currentId() {
      return index.current;
    },
    get settings() {
      return profile.settings;
    },
    get progress() {
      return profile.progress;
    },
    get history() {
      return profile.history;
    },
    get prefs() {
      return profile.prefs;
    },

    createProfile(name) {
      const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      index.profiles.push({ id, name });
      write(profileKey(id), emptyProfile(name));
      select(id);
      return id;
    },
    selectProfile: select,
    renameProfile(name) {
      profile.name = name;
      index.profiles.find((p) => p.id === index.current).name = name;
      write(INDEX_KEY, index);
      save();
    },
    deleteProfile(id) {
      backend.removeItem(profileKey(id));
      index.profiles = index.profiles.filter((p) => p.id !== id);
      index.current = index.profiles[0]?.id ?? null;
      write(INDEX_KEY, index);
      profile = index.current ? load(index.current) : null;
    },

    card: (key) => profile.progress[key],
    record(key, correct, hinted = false) {
      profile.progress[key] = srs.review(profile.progress[key], correct, { hinted });
      save();
    },
    isDue: (key) => srs.isDue(profile.progress[key]),
    mastery: (key) => srs.mastery(profile.progress[key]),
    dueKeys: () => Object.keys(profile.progress).filter((k) => srs.isDue(profile.progress[k])),

    learnStage: (key) => profile.learn[key] ?? 0,
    setLearnStage(key, stage) {
      profile.learn[key] = stage;
      save();
    },
    resetLearn(keys) {
      for (const key of keys) delete profile.learn[key];
      save();
    },

    logSession(entry) {
      profile.history.push({ date: Date.now(), ...entry });
      if (profile.history.length > 500) profile.history.shift();
      save();
    },

    tip: (key) => profile.tips[key],
    setTip(key, text) {
      if (text?.trim()) profile.tips[key] = text.trim();
      else delete profile.tips[key];
      save();
    },

    save,
    exportProfile: () => JSON.stringify({ app: PREFIX, version: 1, profile }, null, 1),
    importProfile(json) {
      const data = JSON.parse(json);
      const incoming = data.profile ?? data;
      if (!incoming || typeof incoming.progress !== "object") throw new Error("invalid file");
      Object.assign(profile, {
        progress: incoming.progress,
        history: incoming.history ?? [],
        tips: incoming.tips ?? {},
        learn: incoming.learn ?? {}
      });
      profile.settings = { ...DEFAULT_SETTINGS, ...incoming.settings };
      save();
    },
    resetProgress() {
      Object.assign(profile, { progress: {}, history: [], learn: {} });
      save();
    }
  };
}
