const PREFERRED_NAME_PATTERN = /female|woman|girl|samantha|victoria|zira|susan/i;

export function pickVoice(voices) {
  if (!voices || voices.length === 0) return null;
  const english = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith("en"));
  const preferred = english.find(v => PREFERRED_NAME_PATTERN.test(v.name));
  if (preferred) return preferred;
  if (english.length > 0) return english[0];
  return voices[0];
}

export function speak(text, { rate = 0.95 } = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  const voice = pickVoice(window.speechSynthesis.getVoices());
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
