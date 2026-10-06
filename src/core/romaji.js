const DIGRAPHS = {
  きゃ: "kya",
  きゅ: "kyu",
  きょ: "kyo",
  しゃ: "sha",
  しゅ: "shu",
  しょ: "sho",
  ちゃ: "cha",
  ちゅ: "chu",
  ちょ: "cho",
  にゃ: "nya",
  にゅ: "nyu",
  にょ: "nyo",
  ひゃ: "hya",
  ひゅ: "hyu",
  ひょ: "hyo",
  みゃ: "mya",
  みゅ: "myu",
  みょ: "myo",
  りゃ: "rya",
  りゅ: "ryu",
  りょ: "ryo",
  ぎゃ: "gya",
  ぎゅ: "gyu",
  ぎょ: "gyo",
  じゃ: "ja",
  じゅ: "ju",
  じょ: "jo",
  ぢゃ: "ja",
  ぢゅ: "ju",
  ぢょ: "jo",
  びゃ: "bya",
  びゅ: "byu",
  びょ: "byo",
  ぴゃ: "pya",
  ぴゅ: "pyu",
  ぴょ: "pyo",
  ふぁ: "fa",
  ふぃ: "fi",
  ふぇ: "fe",
  ふぉ: "fo",
  てぃ: "ti",
  でぃ: "di",
  うぃ: "wi",
  うぇ: "we",
  うぉ: "wo",
  しぇ: "she",
  ちぇ: "che",
  じぇ: "je",
  ゔぁ: "va",
  ゔぃ: "vi",
  ゔぇ: "ve",
  ゔぉ: "vo"
};

const MONOGRAPHS = {
  あ: "a",
  い: "i",
  う: "u",
  え: "e",
  お: "o",
  か: "ka",
  き: "ki",
  く: "ku",
  け: "ke",
  こ: "ko",
  さ: "sa",
  し: "shi",
  す: "su",
  せ: "se",
  そ: "so",
  た: "ta",
  ち: "chi",
  つ: "tsu",
  て: "te",
  と: "to",
  な: "na",
  に: "ni",
  ぬ: "nu",
  ね: "ne",
  の: "no",
  は: "ha",
  ひ: "hi",
  ふ: "fu",
  へ: "he",
  ほ: "ho",
  ま: "ma",
  み: "mi",
  む: "mu",
  め: "me",
  も: "mo",
  や: "ya",
  ゆ: "yu",
  よ: "yo",
  ら: "ra",
  り: "ri",
  る: "ru",
  れ: "re",
  ろ: "ro",
  わ: "wa",
  を: "wo",
  ん: "n",
  が: "ga",
  ぎ: "gi",
  ぐ: "gu",
  げ: "ge",
  ご: "go",
  ざ: "za",
  じ: "ji",
  ず: "zu",
  ぜ: "ze",
  ぞ: "zo",
  だ: "da",
  ぢ: "ji",
  づ: "zu",
  で: "de",
  ど: "do",
  ば: "ba",
  び: "bi",
  ぶ: "bu",
  べ: "be",
  ぼ: "bo",
  ぱ: "pa",
  ぴ: "pi",
  ぷ: "pu",
  ぺ: "pe",
  ぽ: "po",
  ゔ: "vu",
  ぁ: "a",
  ぃ: "i",
  ぅ: "u",
  ぇ: "e",
  ぉ: "o",
  ゃ: "ya",
  ゅ: "yu",
  ょ: "yo"
};

export const KANA_RE = /[\u3040-\u30ff]/;
export const KANJI_RE = /[\u3400-\u4dbf\u4e00-\u9faf]/;

export function kataToHira(text) {
  return text.replace(/[\u30a1-\u30f6]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

export function toRomaji(kana) {
  const s = kataToHira(kana);
  let out = "";
  let geminate = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "っ") {
      geminate = true;
      continue;
    }
    if (c === "ー") {
      const vowel = out.match(/[aeiou](?!.*[aeiou])/);
      out += vowel ? vowel[0] : "";
      continue;
    }
    let r = DIGRAPHS[s.substr(i, 2)];
    if (r) i++;
    else r = MONOGRAPHS[c];
    if (r === undefined) {
      out += c;
      geminate = false;
      continue;
    }
    if (geminate) {
      out += r.startsWith("ch") ? "t" : r[0];
      geminate = false;
    }
    if (c === "ん" && /^[aiueoy]/.test(MONOGRAPHS[s[i + 1]] || "")) r = "n'";
    out += r;
  }
  return out;
}

const MACRONS = [
  [/ā|â/g, "aa"],
  [/ī|î/g, "ii"],
  [/ū|û/g, "uu"],
  [/ē|ê/g, "ee"],
  [/ō|ô/g, "ou"]
];

// Accept the usual romanization variants (Kunrei, wāpuro, macrons) so that only real mistakes count.
const VARIANTS = [
  [/tch/g, "cch"],
  [/sy([aueo])/g, "sh$1"],
  [/ty([aueo])/g, "ch$1"],
  [/(zy|jy)([aueo])/g, "j$2"],
  [/si/g, "shi"],
  [/ti/g, "chi"],
  [/tu/g, "tsu"],
  [/(^|[^sc])hu/g, "$1fu"],
  [/zi|di/g, "ji"],
  [/du/g, "zu"],
  [/wo/g, "o"],
  [/oo/g, "ou"],
  [/nn/g, "n"]
];

export function normalize(input) {
  let s = String(input).toLowerCase().trim();
  for (const [re, rep] of MACRONS) s = s.replace(re, rep);
  s = s.replace(/[\s\-'’.,!?。、！？~～・()（）]/g, "");
  for (const [re, rep] of VARIANTS) s = s.replace(re, rep);
  return s;
}

export function matches(input, answers) {
  const typed = KANA_RE.test(input) ? toRomaji(input) : input;
  const n = normalize(typed);
  return n !== "" && answers.some((a) => normalize(a) === n);
}
