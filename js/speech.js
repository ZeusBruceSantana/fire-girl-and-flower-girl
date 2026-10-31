'use strict';
/* Ember Bloom: reading aloud with the browser's built-in voice.
   Menus, instructions and story lines are read aloud. The target word of a challenge is NEVER read aloud
   before the player's first try (sayWord checks). A grown-up can pick the voice in the parent screen.
   Offline on a Windows tablet the voices are the classic ones (Zira, David, Mark); the nicer "Natural" ones
   need internet, so the picker prefers them only when online and falls back without fuss. */

const Speech = {
  voice: null, ready: false, queue: [], speaking: false, log: [],
  init() {
    if (!('speechSynthesis' in window)) return;
    const pick = () => { this.voice = pickVoice(speechSynthesis.getVoices()); this.ready = true; };
    speechSynthesis.addEventListener('voiceschanged', pick);
    pick();
  },
  /* Say some text. Longer text is split into sentences so the browser never cuts it off. */
  say(text, { interrupt = true, rate = 0.9, pitch = 1.05 } = {}) {
    if (!text || !S.settings.readAloud) return;
    this.log.push(text); if (this.log.length > 20) this.log.shift();
    if (TEST_MODE || !('speechSynthesis' in window)) return;
    if (interrupt) speechSynthesis.cancel();
    for (const part of String(text).match(/[^.!?]+[.!?]*/g) || [text]) {
      const u = new SpeechSynthesisUtterance(part.trim());
      if (this.voice) u.voice = this.voice;
      u.rate = rate; u.pitch = pitch; u.volume = S.settings.sound.muted ? 0 : 1;
      u.onerror = () => { if (this.voice && !this.voice.localService) { this.voice = pickVoice(speechSynthesis.getVoices(), { localOnly: true }); } };
      speechSynthesis.speak(u);
    }
  },
  /* The target word of a challenge: only after the player has tried once. */
  sayWord(word, { tried }) { if (!tried) return false; this.say(word, { rate: 0.75 }); return true; },
  stop() { if ('speechSynthesis' in window) speechSynthesis.cancel(); },
};
function pickVoice(voices, { localOnly = false } = {}) {
  const good = voices.filter(v => v.lang && /^en/i.test(v.lang) && !/undefined/.test(v.name || ''));
  if (S.settings.voice) { const chosen = good.find(v => v.voiceURI === S.settings.voice); if (chosen) return chosen; }
  const online = navigator.onLine && !localOnly;
  const prefer = [
    v => online && !v.localService && /Ana/i.test(v.name),          // a child's voice, online only
    v => online && !v.localService && /Jenny|Aria|Sonia|Libby/i.test(v.name),
    v => /Zira|Samantha|Karen|Moira|Google UK English Female/i.test(v.name),
    v => v.localService,
    () => true,
  ];
  for (const test of prefer) { const v = good.find(test); if (v) return v; }
  return voices[0] || null;
}
