/* Small shared helpers. */
(function () {
  const R = (window.Roses = window.Roses || {});

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') for (const [p, pv] of Object.entries(v)) el.style.setProperty(p.startsWith('--') ? p : p.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()), pv);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
    return el;
  }

  const fmtTime = (s) => {
    if (!isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, '0')}`;
  };

  const ordinal = (n) => {
    const v = n % 100;
    return n + (v >= 11 && v <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'));
  };

  /** Deterministic pseudo-random in [0,1) from an integer seed. */
  const seeded = (seed) => {
    let x = (seed * 2654435761) >>> 0;
    x ^= x >>> 16; x = Math.imul(x, 2246822507) >>> 0; x ^= x >>> 13; x = Math.imul(x, 3266489909) >>> 0; x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  };

  const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Toast ── */
  let toastTimer;
  function toast(msg, ms = 2800) {
    const el = $('.toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), ms);
  }

  /* ── Find an audio file, forgiving about the extension ──
     "audio/miss-me.mp3" also matches miss-me.m4a / .wav / .ogg / .aac / .webm. */
  const EXTS = ['mp3', 'm4a', 'wav', 'ogg', 'aac', 'webm', 'MP3', 'M4A', 'WAV'];
  const audioCache = new Map();

  function candidates(src) {
    const m = String(src).match(/^(.*)\.([a-z0-9]+)$/i);
    const base = m ? m[1] : src;
    const list = [src];
    for (const e of EXTS) { const c = `${base}.${e}`; if (!list.includes(c)) list.push(c); }
    return list;
  }

  function probeWithAudio(url) {
    return new Promise((resolve) => {
      const a = new Audio();
      let done = false;
      const finish = (ok) => { if (done) return; done = true; a.removeAttribute('src'); a.load(); resolve(ok); };
      a.preload = 'metadata';
      a.addEventListener('loadedmetadata', () => finish(true), { once: true });
      a.addEventListener('error', () => finish(false), { once: true });
      setTimeout(() => finish(null), 6000); // unknown (some browsers don't preload) → treat as maybe
      a.src = url;
    });
  }

  async function probe(url) {
    if (location.protocol.startsWith('http')) {
      try {
        const res = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
        return res.ok;
      } catch (e) { /* fall through */ }
    }
    return probeWithAudio(url);
  }

  /** Resolves to a playable URL, or null when no file is found. */
  function resolveAudio(src) {
    if (!src) return Promise.resolve(null);
    if (audioCache.has(src)) return audioCache.get(src);
    const p = (async () => {
      let maybe = null;
      for (const url of candidates(src)) {
        const ok = await probe(url);
        if (ok === true) return url;
        if (ok === null && !maybe) maybe = url;
      }
      return maybe;
    })();
    audioCache.set(src, p);
    return p;
  }

  /* ── Little heart / sparkle bursts ── */
  const BURST = ['#ff4d6d', '#ff8fab', '#ffb3c6', '#ffd166', '#ffffff', '#c77dff'];
  /* angle/arc (radians) aim the burst: e.g. angle 0 + arc π sprays only to the right.
     Defaults to a full circle. */
  function burst(x, y, { count = 14, spread = 140, size = 14, shapes = ['heart', 'dot', 'sparkle'], angle = 0, arc = Math.PI * 2 } = {}) {
    if (reduceMotion()) return;
    const layer = $('.fx-layer');
    if (!layer) return;
    const full = arc >= Math.PI * 2 - 1e-6;
    for (let k = 0; k < count; k++) {
      const shape = shapes[k % shapes.length];
      const el = h('span', { class: `fx fx-${shape}` });
      const s = size * (0.6 + Math.random() * 0.8);
      el.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px;--c:${BURST[k % BURST.length]}`;
      layer.append(el);
      const ang = full
        ? (Math.PI * 2 * k) / count + Math.random() * 0.6
        : angle - arc / 2 + arc * ((k + Math.random() * 0.8) / count);
      const dist = spread * (0.45 + Math.random() * 0.6);
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - spread * 0.25;
      el.animate(
        [
          { transform: 'translate(-50%,-50%) scale(.2) rotate(0deg)', opacity: 1 },
          { transform: `translate(calc(-50% + ${dx * 0.7}px), calc(-50% + ${dy * 0.7}px)) scale(1) rotate(${(Math.random() - 0.5) * 120}deg)`, opacity: 1, offset: 0.55 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 40}px)) scale(.6) rotate(${(Math.random() - 0.5) * 220}deg)`, opacity: 0 },
        ],
        { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' }
      ).onfinish = () => el.remove();
    }
  }

  /* ── Keep the screen awake while something is playing ── */
  let wakeLock = null;
  async function keepAwake(on) {
    try {
      if (on && 'wakeLock' in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => (wakeLock = null));
      } else if (!on && wakeLock) {
        await wakeLock.release();
        wakeLock = null;
      }
    } catch (e) { /* not supported / not allowed: fine */ }
  }

  R.util = { $, $$, h, fmtTime, ordinal, seeded, reduceMotion, toast, resolveAudio, burst, keepAwake };
})();
