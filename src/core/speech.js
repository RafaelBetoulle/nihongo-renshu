const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

const japaneseVoice = () => synth?.getVoices().find((v) => v.lang?.replace("_", "-").startsWith("ja"));

export const canSpeak = () => Boolean(synth);
export const hasJapaneseVoice = () => Boolean(japaneseVoice());

export function speak(text) {
  if (!synth || !text) return;
  try {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.85;
    const voice = japaneseVoice();
    if (voice) u.voice = voice;
    synth.speak(u);
  } catch {
    /* speech is a nice-to-have: never break the quiz for it */
  }
}

if (synth) synth.onvoiceschanged = () => {};
