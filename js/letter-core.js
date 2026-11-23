/* Letter parsing + word timing.
   parse(text)  → words, paragraphs, sticker/theme cues
   timesFor()   → when each word starts in the recording */
(function () {
  const R = (window.Roses = window.Roses || {});

  const MARKER = /\{\s*(sticker|theme)\s*:\s*([^}]*?)\s*\}/gi;
  const SENTENCE_END = /[.!?…]+["'”’)\]]*$/;
  const SOFT_END = /[,;:—–]+["'”’)\]]*$/;
  const LETTERS = /[\p{L}\p{N}]/gu;

  function parse(text) {
    const src = String(text || '').replace(/\r\n?/g, '\n').trim();
    const words = [], paragraphs = [], stickers = [], themes = [];
    const earlyStickers = [];
    let em = false;

    for (const block of src.split(/\n[ \t]*\n+/)) {
      const para = { lines: [] };
      for (const lineText of block.split('\n')) {
        const markers = [];
        const prepared = lineText.replace(MARKER, (_, kind, value) => ` \u0001${markers.push({ kind: kind.toLowerCase(), value }) - 1}\u0001 `);
        const lineWords = [];
        for (const tok of prepared.split(/\s+/)) {
          if (!tok) continue;
          const mk = tok.match(/^\u0001(\d+)\u0001$/);
          if (mk) {
            const m = markers[+mk[1]];
            if (m.kind === 'sticker') {
              // Pops on the word right before it (like an emoji after a word).
              if (words.length) stickers.push({ spec: m.value, word: words.length - 1 });
              else earlyStickers.push(m.value);
            } else {
              // Changes the look on the word right after it.
              themes.push({ name: m.value.toLowerCase(), word: words.length });
            }
            continue;
          }
          let t = tok, isEm = em;
          if (t.startsWith('*')) { t = t.replace(/^\*+/, ''); isEm = em = true; }
          const close = t.match(/^(.*?)\*+([^\p{L}\p{N}]*)$/u);
          if (close) { t = close[1] + close[2]; em = false; }
          if (!t) continue;
          const w = { i: words.length, text: t, em: isEm, p: paragraphs.length, l: para.lines.length };
          words.push(w);
          lineWords.push(w.i);
        }
        if (lineWords.length) para.lines.push(lineWords);
      }
      if (para.lines.length) paragraphs.push(para);
    }

    earlyStickers.forEach((spec) => stickers.unshift({ spec, word: 0 }));
    const last = Math.max(0, words.length - 1);
    themes.forEach((t) => (t.word = Math.min(t.word, last)));

    // How big a pause follows each word: 0 none, 1 comma/line, 2 sentence, 3 paragraph.
    paragraphs.forEach((para) => {
      para.lines.forEach((line, li) => {
        line.forEach((wi, k) => {
          const w = words[wi];
          let pause = SENTENCE_END.test(w.text) ? 2 : SOFT_END.test(w.text) ? 1 : 0;
          if (k === line.length - 1) pause = Math.max(pause, 1);
          if (k === line.length - 1 && li === para.lines.length - 1) pause = 3;
          w.pause = pause;
          w.weight = wordWeight(w.text);
        });
      });
    });

    // Phrases = runs of words between pauses.
    const phrases = [];
    let start = 0;
    words.forEach((w, i) => {
      if (w.pause >= 1 || i === words.length - 1) {
        const ws = words.slice(start, i + 1);
        phrases.push({ start, end: i, weight: ws.reduce((a, x) => a + x.weight, 0), strength: w.pause });
        start = i + 1;
      }
    });

    return { words, paragraphs, stickers, themes, phrases, fingerprint: fingerprint(words) };
  }

  function wordWeight(t) {
    const n = (t.match(LETTERS) || []).length;
    return 0.14 + 0.06 * Math.max(1, n);
  }

  function fingerprint(words) {
    let h = 5381;
    const s = words.map((w) => w.text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')).join(' ');
    for (let k = 0; k < s.length; k++) h = ((h << 5) + h + s.charCodeAt(k)) >>> 0;
    return h.toString(36);
  }

  /** Rough timing when no timing file exists: spread words over the recording by length + punctuation. */
  const PAUSE_SECONDS = [0, 0.28, 0.6, 0.95];
  function estimate(parsed, duration) {
    const words = parsed.words;
    if (!words.length || !isFinite(duration) || duration <= 0) return words.map(() => 0);
    const lead = Math.min(0.5, duration * 0.04), tail = Math.min(0.8, duration * 0.05);
    const units = words.map((w, i) => w.weight + (i < words.length - 1 ? PAUSE_SECONDS[w.pause] : 0));
    const total = units.reduce((a, b) => a + b, 0);
    const scale = Math.max(0.01, duration - lead - tail) / total;
    const times = [];
    let t = lead;
    units.forEach((u) => { times.push(+t.toFixed(3)); t += u * scale; });
    return times;
  }

  /** Picks the best timing: the timing file if it matches, otherwise an estimate. */
  function timesFor(parsed, duration, timing) {
    const n = parsed.words.length;
    if (timing && Array.isArray(timing.times) && timing.times.length === n) {
      return { times: timing.times.map(Number), source: 'file' };
    }
    if (timing) console.warn(`[Roses] letter-timing.js has ${timing.times ? timing.times.length : 0} words but the letter has ${n}. Using an estimate until it's regenerated.`);
    return { times: estimate(parsed, duration), source: 'estimate' };
  }

  /** Index of the word being spoken at time t (-1 before the first word). */
  function wordAt(times, t) {
    let lo = 0, hi = times.length - 1, ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (times[mid] <= t) { ans = mid; lo = mid + 1; } else hi = mid - 1;
    }
    return ans;
  }

  R.letterCore = { parse, estimate, timesFor, wordAt };
})();
