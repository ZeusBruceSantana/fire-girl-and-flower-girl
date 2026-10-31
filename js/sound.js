'use strict';
/* Ember Bloom: sounds and music, all made in code with the Web Audio API. No audio files.
   Short, gentle, with small random variations so repeats stay pleasant. Rarity is obvious by ear:
   found-1 (common) is a soft chime, found-2 (rare) a three-note chime with shimmer, found-3 (legendary)
   a long rising arpeggio with a shimmer tail.

   Hook points (wired from other modules):
     uiToast         icon coin / heart / ember / gem  ->  Sound.play('coin' | 'heart' | 'ember' | 'found-N')
     Challenge       success -> 'right' or 'firstTry';  hint -> 'tryAgain';  options tapped -> 'tap'
     Battle          'cast', 'super', 'combo', 'giggle' (the trouble cheers up), level-ups -> 'levelUp'
     MapStage        doors -> 'door', chests -> 'chest', sparkles -> 'found-N' by rarity
     Dialogue        a new page -> 'page';  a choice tapped -> 'pick'
     Day             bedtime -> 'sleep';  music by part of the day
     stageGo / MapStage.go   Sound.music('school' | 'woods' | 'town' | 'lair' | 'peak' | 'battle' | 'night' | null)

   Settings are read live from S.settings.sound (muted, volume, music) once a second, so the grown-up
   corner never has to call anything. In TEST_MODE no AudioContext is made: calls go to Sound.log. */

const Sound = {
  names: ['tap', 'pick', 'right', 'firstTry', 'tryAgain', 'coin', 'heart', 'ember', 'levelUp', 'found-1', 'found-2', 'found-3',
          'cast', 'super', 'combo', 'giggle', 'door', 'chest', 'page', 'sleep'],
  places: ['school', 'woods', 'town', 'lair', 'peak', 'battle', 'night'],
  log: [],                 // in test mode: every play and music call, as 'coin' or 'music:woods'
  ctx: null, master: null, musicGain: null,
  place: null, tune: null, ready: false, timer: 0,

  init() {
    if (this.ready) return;
    this.ready = true;
    if (TEST_MODE) return;
    const wake = () => { this.wake(); };
    document.addEventListener('pointerdown', wake, { once: true });
    document.addEventListener('keydown', wake, { once: true });
    this.timer = setInterval(() => this.refresh(), 1000);
  },
  /* The AudioContext is made on the first tap (browsers insist). */
  wake() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain(); this.musicGain.connect(this.master);
      this.refresh();
      if (this.place) this.startTune(this.place);
    } catch (e) { this.ctx = null; }
  },
  settings() { const s = (typeof S !== 'undefined' && S.settings && S.settings.sound) || {}; return { muted: !!s.muted, volume: s.volume == null ? 0.7 : s.volume, music: s.music !== false }; },
  audible() { const s = this.settings(); return !s.muted && s.volume > 0; },
  /* Read the settings again (every second, and after a wake). */
  refresh() {
    const s = this.settings();
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(s.muted ? 0 : clamp(s.volume, 0, 1), this.ctx.currentTime, 0.05);
    if (this.musicGain && this.ctx) this.musicGain.gain.setTargetAtTime(s.music ? 0.12 : 0, this.ctx.currentTime, 0.3);
    if (!s.music && this.tune) this.stopTune(1.0);
    else if (s.music && this.place && !this.tune && this.ctx) this.startTune(this.place);
  },
  setVolume(v) { void v; this.refresh(); },
  mute(b) { void b; this.refresh(); },

  /* ---------- one-shot sounds ---------- */
  play(name) {
    if (!this.names.includes(name)) return false;
    this.log.push(name); if (this.log.length > 200) this.log.shift();
    if (TEST_MODE || !this.ctx || !this.audible()) return true;
    try { this.synth(name); } catch (e) { /* a sound is never worth an error */ }
    return true;
  },
  /* A single note: oscillator with an attack/decay envelope. t is seconds from now. */
  note(freq, { t = 0, dur = 0.18, type = 'sine', vol = 0.25, detune = 0, slide = 0, shimmer = false } = {}) {
    const ctx = this.ctx, now = ctx.currentTime + t;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, now);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), now + dur);
    o.detune.value = detune + (Math.random() - 0.5) * 8;         // a hair of variation every time
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g); g.connect(this.master);
    o.start(now); o.stop(now + dur + 0.02);
    if (shimmer) {                                                 // a quiet octave above, slightly behind
      const o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o2.type = 'triangle'; o2.frequency.setValueAtTime(freq * 2, now + 0.03);
      g2.gain.setValueAtTime(0.0001, now + 0.03); g2.gain.exponentialRampToValueAtTime(vol * 0.35, now + 0.05); g2.gain.exponentialRampToValueAtTime(0.0001, now + dur * 1.4);
      o2.connect(g2); g2.connect(this.master); o2.start(now + 0.03); o2.stop(now + dur * 1.4 + 0.02);
    }
  },
  synth(name) {
    const v = 1 + (Math.random() - 0.5) * 0.06;                     // tiny pitch variation per play
    const C5 = 523.25 * v, D5 = 587.33 * v, E5 = 659.25 * v, G5 = 783.99 * v, A5 = 880 * v, C6 = 1046.5 * v, E6 = 1318.5 * v, G6 = 1568 * v;
    const A4 = 440 * v, G4 = 392 * v, E4 = 329.63 * v, C4 = 261.63 * v;
    switch (name) {
      case 'tap':      this.note(C6, { dur: 0.06, type: 'triangle', vol: 0.12 }); break;
      case 'pick':     this.note(E5, { dur: 0.09, type: 'triangle', vol: 0.18 }); this.note(G5, { t: 0.06, dur: 0.1, type: 'triangle', vol: 0.16 }); break;
      case 'right':    this.note(E5, { dur: 0.12, vol: 0.22 }); this.note(C6, { t: 0.1, dur: 0.22, vol: 0.22, shimmer: true }); break;
      case 'firstTry': [C5, E5, G5, C6, E6].forEach((f, i) => this.note(f, { t: i * 0.06, dur: 0.16, vol: 0.2, type: i > 2 ? 'triangle' : 'sine', shimmer: i >= 3 })); break;
      case 'tryAgain': this.note(E5, { dur: 0.14, vol: 0.14 }); this.note(C5, { t: 0.12, dur: 0.14, vol: 0.14 }); this.note(D5, { t: 0.3, dur: 0.2, vol: 0.12 }); break;
      case 'coin':     this.note(E6, { dur: 0.08, type: 'square', vol: 0.08 }); this.note(G6, { t: 0.07, dur: 0.16, type: 'square', vol: 0.07 }); break;
      case 'heart':    this.note(A4, { dur: 0.2, vol: 0.18 }); this.note(C5, { t: 0.08, dur: 0.26, vol: 0.18 }); this.note(E5, { t: 0.16, dur: 0.34, vol: 0.16, shimmer: true }); break;
      case 'ember':    this.note(G5, { dur: 0.14, type: 'triangle', vol: 0.16, slide: 1.3 }); this.note(C6, { t: 0.1, dur: 0.18, type: 'triangle', vol: 0.12 }); break;
      case 'levelUp':  [C5, E5, G5, C6, G5, C6, E6].forEach((f, i) => this.note(f, { t: i * 0.09, dur: i === 6 ? 0.5 : 0.14, vol: 0.2, type: 'triangle', shimmer: i >= 5 })); break;
      case 'found-1':  this.note(G5, { dur: 0.3, vol: 0.18 }); break;
      case 'found-2':  [E5, G5, C6].forEach((f, i) => this.note(f, { t: i * 0.1, dur: 0.3, vol: 0.18, shimmer: true })); break;
      case 'found-3':  [C5, E5, G5, C6, E6, G6, C6 * 2].forEach((f, i) => this.note(f, { t: i * 0.08, dur: 0.3 + i * 0.05, vol: 0.18, shimmer: true })); this.note(C6, { t: 0.6, dur: 0.6, type: 'triangle', vol: 0.1, shimmer: true }); break;
      case 'cast':     this.note(A4, { dur: 0.25, type: 'sawtooth', vol: 0.06, slide: 2.2 }); this.note(E5, { t: 0.1, dur: 0.3, vol: 0.14, shimmer: true }); break;
      case 'super':    [G5, C6, E6, G6].forEach((f, i) => this.note(f, { t: i * 0.05, dur: 0.22, vol: 0.2, type: 'triangle', shimmer: true })); break;
      case 'combo':    this.note(E5, { dur: 0.08, vol: 0.18 }); this.note(G5, { t: 0.07, dur: 0.08, vol: 0.18 }); this.note(C6, { t: 0.14, dur: 0.3, vol: 0.2, shimmer: true }); break;
      case 'giggle':   [C5, G5, E5, C6, G5, E6].forEach((f, i) => this.note(f, { t: i * 0.07, dur: 0.1, type: 'triangle', vol: 0.16 })); break;
      case 'door':     this.note(C4, { dur: 0.16, type: 'triangle', vol: 0.14, slide: 0.8 }); this.note(G4, { t: 0.12, dur: 0.2, type: 'triangle', vol: 0.12 }); break;
      case 'chest':    this.note(E4, { dur: 0.1, type: 'square', vol: 0.06 }); this.note(G4, { t: 0.08, dur: 0.1, type: 'square', vol: 0.06 }); this.note(C6, { t: 0.2, dur: 0.4, vol: 0.18, shimmer: true }); break;
      case 'page':     this.note(G5, { dur: 0.05, type: 'triangle', vol: 0.08, slide: 1.6 }); break;
      case 'sleep':    [E5, C5, A4, G4].forEach((f, i) => this.note(f, { t: i * 0.22, dur: 0.5, vol: 0.12 })); break;
      default: break;
    }
  },

  /* ---------- music: a gentle looping tune per place ---------- */
  music(place) {
    if (place !== null && !this.places.includes(place)) return false;
    this.log.push('music:' + place); if (this.log.length > 200) this.log.shift();
    if (place === this.place && this.tune) return true;
    this.place = place;
    if (TEST_MODE || !this.ctx) return true;
    this.stopTune(1.5);
    if (place && this.settings().music) this.startTune(place);
    return true;
  },
  startTune(place) {
    if (!this.ctx || this.tune) return;
    const T = TUNES[place]; if (!T) return;
    const ctx = this.ctx;
    const bus = ctx.createGain(); bus.gain.setValueAtTime(0.0001, ctx.currentTime); bus.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 1.5);
    bus.connect(this.musicGain);
    const tune = { place, bus, step: 0, nextAt: ctx.currentTime + 0.1, timer: 0, chord: 0 };
    this.tune = tune;
    const beat = 60 / T.tempo;
    const scheduler = () => {
      if (this.tune !== tune) return;
      const ahead = ctx.currentTime + 0.6;
      while (tune.nextAt < ahead) {
        const i = tune.step;
        if (i % T.chordEvery === 0) {                                   // a soft pad chord
          const root = T.chords[tune.chord % T.chords.length]; tune.chord++;
          for (const semis of [0, 4 + (T.minor ? -1 : 0), 7]) this.pad(root * Math.pow(2, semis / 12), tune.nextAt, beat * T.chordEvery * 1.05, bus);
        }
        if (Math.random() > T.rest) {                                    // a melody note from the scale, mostly stepwise
          const deg = pickDegree(T, tune);
          const freq = T.base * Math.pow(2, T.scale[deg % T.scale.length] / 12) * (deg >= T.scale.length ? 2 : 1);
          this.melody(freq, tune.nextAt, beat * (T.staccato ? 0.45 : 0.9), bus, T);
        }
        tune.nextAt += beat; tune.step++;
      }
      tune.timer = setTimeout(scheduler, 250);
    };
    scheduler();
  },
  stopTune(fade) {
    const t = this.tune; if (!t) return;
    this.tune = null;
    clearTimeout(t.timer);
    try { t.bus.gain.setTargetAtTime(0.0001, this.ctx.currentTime, fade / 4); } catch (e) { /* ignore */ }
    setTimeout(() => { try { t.bus.disconnect(); } catch (e) { /* ignore */ } }, fade * 1000 + 200);
  },
  pad(freq, at, dur, bus) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(freq, at); o.detune.value = (Math.random() - 0.5) * 6;
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.09, at + dur * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(bus); o.start(at); o.stop(at + dur + 0.05);
  },
  melody(freq, at, dur, bus, T) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = T.voice || 'sine'; o.frequency.setValueAtTime(freq, at); o.detune.value = (Math.random() - 0.5) * 10;
    const vol = 0.16 * (0.85 + Math.random() * 0.3);
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(bus); o.start(at); o.stop(at + dur + 0.05);
  },
};
/* Mostly stepwise melodies: the next degree is near the last one, with the occasional little leap. */
function pickDegree(T, tune) {
  const n = T.scale.length * 2;
  const last = tune.lastDeg == null ? Math.floor(n / 2) : tune.lastDeg;
  const r = Math.random();
  let next = last + (r < 0.4 ? 1 : r < 0.75 ? -1 : r < 0.85 ? 2 : r < 0.95 ? -2 : 0);
  if (tune.step % 8 === 7) next = T.home;                                // phrases come home
  next = Math.max(0, Math.min(n - 1, next));
  tune.lastDeg = next;
  return next;
}
const PENTA_MAJOR = [0, 2, 4, 7, 9], PENTA_MINOR = [0, 3, 5, 7, 10];
const TUNES = {
  school: { tempo: 104, base: 523.25, scale: PENTA_MAJOR, chords: [261.63, 349.23, 392, 261.63], chordEvery: 4, rest: 0.25, home: 5, voice: 'sine' },
  woods:  { tempo: 92,  base: 440,    scale: PENTA_MAJOR, chords: [220, 293.66, 246.94, 220],   chordEvery: 4, rest: 0.3,  home: 4, voice: 'triangle' },
  town:   { tempo: 124, base: 523.25, scale: PENTA_MAJOR, chords: [261.63, 392, 349.23, 392],   chordEvery: 2, rest: 0.15, home: 5, voice: 'triangle' },
  lair:   { tempo: 84,  base: 392,    scale: PENTA_MINOR, chords: [196, 155.56, 174.61, 196],   chordEvery: 4, rest: 0.35, home: 3, voice: 'sine', minor: true },
  peak:   { tempo: 76,  base: 659.25, scale: PENTA_MAJOR, chords: [329.63, 440, 493.88, 329.63], chordEvery: 8, rest: 0.45, home: 6, voice: 'sine' },
  battle: { tempo: 140, base: 523.25, scale: PENTA_MAJOR, chords: [261.63, 311.13, 349.23, 392], chordEvery: 2, rest: 0.1,  home: 5, voice: 'square', staccato: true },
  night:  { tempo: 60,  base: 392,    scale: PENTA_MAJOR, chords: [196, 261.63, 220, 196],      chordEvery: 8, rest: 0.5,  home: 3, voice: 'sine' },
};
Sound.init();
