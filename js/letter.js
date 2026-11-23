/* The letter: plays the recording, dims words already read, pops stickers, changes themes. */
(function () {
  const R = window.Roses;
  const { $, h, fmtTime, seeded, reduceMotion, burst, keepAwake, resolveAudio } = R.util;
  const core = R.letterCore;
  const L = window.LETTER || { text: '' };
  const START_THEME = L.startTheme || 'blush';

  let parsed, spans = [], times = [];
  let audio, view, wrap, paper, layer, player, range, timeEl, hint, chip;
  let idx = -1;
  let ready = false, active = false, scrubbing = false, jumped = false;
  let raf = 0, finishTimer = 0, userScrollUntil = 0;
  const shown = new Map(); // sticker index → { el, place }

  /* ───────── Setup ───────── */
  function init() {
    parsed = core.parse(L.text);
    view = $('.view-letter');
    wrap = $('#letter-wrap');
    paper = $('.paper', wrap);
    layer = $('#sticker-layer');
    player = $('#player');
    range = $('#pl-range');
    timeEl = $('#pl-time');
    hint = $('#player-hint');
    chip = $('#follow-chip');
    audio = $('#letter-audio');

    const date = $('#letter-date');
    date.textContent = L.date || '';
    date.hidden = !L.date;

    renderText();
    bindControls();

    player.classList.add('loading');
    resolveAudio(L.audio).then((url) => {
      if (!url) return noAudio();
      audio.src = url;
      audio.load();
    });
    audio.addEventListener('loadedmetadata', onReady);
    audio.addEventListener('error', () => { if (!ready) noAudio(); });
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', () => { if (audio.paused) update(); });

    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(relayoutStickers, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayoutStickers);
  }

  function renderText() {
    const body = $('#letter-body');
    body.innerHTML = '';
    spans = [];
    const lastP = parsed.paragraphs.length - 1;
    parsed.paragraphs.forEach((para, pi) => {
      const count = para.lines.reduce((a, l) => a + l.length, 0);
      const p = h('p', { class: [pi === 0 && count <= 6 ? 'greeting' : '', pi === lastP && pi > 0 && count <= 8 ? 'signoff' : ''].join(' ').trim() || null });
      para.lines.forEach((line, li) => {
        if (li) p.append(h('br'));
        line.forEach((wi, k) => {
          if (k) p.append(' ');
          const w = parsed.words[wi];
          const s = h('span', { class: 'w' + (w.em ? ' em' : ''), 'data-i': wi }, w.text);
          spans[wi] = s;
          p.append(s);
        });
      });
      body.append(p);
    });
  }

  function onReady() {
    const r = core.timesFor(parsed, audio.duration, window.LETTER_TIMING);
    times = r.times;
    if (r.source === 'estimate') console.info('[Roses] Letter timing is an estimate. Generate content/letter-timing.js from the recording for word-perfect sync.');
    ready = true;
    player.classList.remove('loading', 'no-audio');
    view.classList.add('has-audio');
    update(true);
  }

  function noAudio() {
    ready = false;
    player.classList.remove('loading');
    player.classList.add('no-audio');
    hint.textContent = 'My recording is on its way ♡ Read it for now.';
    // Without audio, show every sticker in place so the letter is still decorated.
    idx = spans.length;
    if (active) { syncStickers(false); }
  }

  /* ───────── Controls ───────── */
  function bindControls() {
    $('#pl-play').addEventListener('click', toggle);
    $('#pl-stop').addEventListener('click', stop);

    range.addEventListener('input', () => {
      if (!ready) return;
      scrubbing = true;
      jumped = true;
      audio.currentTime = (range.value / 1000) * audio.duration;
      update(true);
    });
    range.addEventListener('change', () => { scrubbing = false; });

    $('#letter-body').addEventListener('click', (e) => {
      const s = e.target.closest('.w');
      if (!s || !ready) return;
      const i = +s.dataset.i;
      jumped = true;
      audio.currentTime = Math.max(0, times[i] - 0.05);
      view.classList.remove('finished');
      update(true);
      if (audio.paused) audio.play().catch(() => {});
    });

    // Manual scrolling pauses auto-follow for a bit.
    const manual = () => {
      if (!active || audio.paused) return;
      userScrollUntil = performance.now() + 8000;
      chip.classList.add('show');
    };
    addEventListener('wheel', manual, { passive: true });
    addEventListener('touchmove', manual, { passive: true });
    addEventListener('keydown', (e) => {
      if (!active) return;
      if (['PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) manual();
      if (e.key === ' ' && !e.target.closest('button, input, a, textarea')) { e.preventDefault(); toggle(); }
    });
    chip.addEventListener('click', () => {
      userScrollUntil = 0;
      chip.classList.remove('show');
      follow(true);
    });
  }

  function toggle() {
    if (!ready) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  function stop() {
    if (!ready) return;
    audio.pause();
    audio.currentTime = 0;
    jumped = true;
    clearTimeout(finishTimer);
    view.classList.remove('finished', 'started');
    chip.classList.remove('show');
    update(true);
    scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
  }

  function onPlay() {
    clearTimeout(finishTimer);
    view.classList.remove('finished');
    view.classList.add('playing', 'started');
    $('#pl-play').setAttribute('aria-label', 'Pause');
    keepAwake(true);
    if ('mediaSession' in navigator && window.MediaMetadata) {
      try { navigator.mediaSession.metadata = new MediaMetadata({ title: 'A letter for you', artist: (window.SETTINGS && SETTINGS.yourName) || '' }); } catch (e) {}
    }
    loop();
  }

  function onPause() {
    view.classList.remove('playing');
    $('#pl-play').setAttribute('aria-label', 'Play');
    cancelAnimationFrame(raf);
    keepAwake(false);
    update();
  }

  function onEnded() {
    setIndex(spans.length, false);
    updateProgress();
    const vw = innerWidth, vh = innerHeight;
    burst(vw / 2, vh * 0.45, { count: 26, spread: Math.min(vw, vh) * 0.4, size: 20 });
    finishTimer = setTimeout(() => view.classList.add('finished'), 1800);
  }

  function loop() {
    cancelAnimationFrame(raf);
    update();
    if (!audio.paused) raf = requestAnimationFrame(loop);
  }

  /* ───────── State updates ───────── */
  function update(force) {
    if (!ready) return;
    const atStart = audio.paused && audio.currentTime < 0.01;
    const i = audio.ended ? spans.length : atStart ? -1 : core.wordAt(times, audio.currentTime);
    if (i !== idx || force) {
      const animate = !audio.paused && !jumped && i - idx <= 2;
      setIndex(i, animate);
      jumped = false;
    }
    updateProgress();
  }

  function updateProgress() {
    const d = audio.duration;
    if (!isFinite(d) || d <= 0) return;
    if (!scrubbing) range.value = Math.round((audio.currentTime / d) * 1000);
    range.style.setProperty('--fill', `${(audio.currentTime / d) * 100}%`);
    timeEl.textContent = `${fmtTime(audio.currentTime)} / ${fmtTime(d)}`;
  }

  function setIndex(i, animate) {
    idx = i;
    for (let k = 0; k < spans.length; k++) {
      const s = spans[k];
      s.classList.toggle('read', k < i);
      s.classList.toggle('current', k === i);
    }
    syncStickers(animate);
    syncTheme();
    if (!audio.paused) follow();
  }

  function themeAt(i) {
    let name = START_THEME;
    for (const t of parsed.themes) if (i >= t.word) name = t.name;
    return name;
  }

  function syncTheme() {
    if (active) R.themes.apply(ready ? themeAt(idx) : START_THEME);
  }

  /* ───────── Auto-follow ───────── */
  function follow(forceNow) {
    if (!active) return;
    if (!forceNow && performance.now() < userScrollUntil) return;
    if (chip.classList.contains('show') && performance.now() >= userScrollUntil) chip.classList.remove('show');
    const s = spans[Math.max(0, Math.min(idx, spans.length - 1))];
    if (!s) return;
    const r = s.getBoundingClientRect();
    const vh = innerHeight;
    const bottomLimit = vh - player.offsetHeight - vh * 0.16;
    if (forceNow || r.top < vh * 0.18 || r.bottom > bottomLimit) {
      scrollTo({ top: Math.max(0, scrollY + r.top - vh * 0.34), behavior: reduceMotion() ? 'auto' : 'smooth' });
    }
  }

  /* ───────── Stickers ───────── */
  function syncStickers(animate) {
    if (!active) return;
    parsed.stickers.forEach((st, k) => {
      const should = idx >= st.word;
      if (should && !shown.has(k)) addSticker(k, animate && idx - st.word <= 2);
      else if (!should && shown.has(k)) removeSticker(k);
    });
  }

  function geometry() {
    const wr = wrap.getBoundingClientRect();
    const pr = paper.getBoundingClientRect();
    const cs = getComputedStyle(paper);
    const padL = parseFloat(cs.paddingLeft) || 24, padR = parseFloat(cs.paddingRight) || 24;
    const outL = pr.left - wr.left, outR = wr.right - pr.right;
    // Wide screens: stickers sit in the empty margins beside the paper.
    const wide = Math.min(outL, outR) > 120;
    // Narrow screens: stickers sit in the gutter between screen edge and text.
    const gL = outL + padL, gR = outR + padR;
    const sides = wide ? ['l', 'r'] : [gL >= 52 && 'l', gR >= 52 && 'r'].filter(Boolean);
    if (!sides.length) sides.push(gR >= gL ? 'r' : 'l');
    const gutter = Math.min(...sides.map((sd) => (sd === 'l' ? gL : gR)));
    const s = wide ? Math.max(96, Math.min(136, Math.min(outL, outR) * 0.5)) : Math.max(44, Math.min(100, gutter * 0.95));
    return { wr, pr, outL, outR, gL, gR, wide, sides, s };
  }

  function computePlace(k, g, placed) {
    const st = parsed.stickers[k];
    const span = spans[st.word];
    if (!span) return null;
    const sr = span.getBoundingClientRect();
    const r1 = seeded(k * 7 + 1), r2 = seeded(k * 7 + 2), r3 = seeded(k * 7 + 3);
    const s = Math.round(g.s * (g.wide ? 0.88 + r3 * 0.24 : 0.92 + r3 * 0.08));
    const wordX = sr.left + sr.width / 2 - g.pr.left;
    const near = wordX < g.pr.width / 2 ? 'l' : 'r';
    const prefer = g.sides.includes(near) ? near : g.sides[0];
    let y = sr.top + sr.height / 2 - g.wr.top + (r2 - 0.5) * s * (g.wide ? 0.35 : 0.15);

    const xFor = (side) => {
      if (g.wide) {
        const outer = side === 'l' ? g.outL : g.outR;
        const lo = s / 2 + 12, hi = outer + s * 0.1;
        const c = lo + (hi - lo) * (0.4 + r1 * 0.6);
        return side === 'l' ? c : g.wr.width - c;
      }
      const c = Math.max(s * 0.52, (side === 'l' ? g.gL : g.gR) / 2);
      return side === 'l' ? c : g.wr.width - c;
    };
    const clash = (side, yy) => placed.some((p) => p.side === side && Math.abs(p.y - yy) < (p.s + s) * 0.5);

    let side = prefer;
    if (clash(side, y)) {
      const other = g.sides.find((sd) => sd !== prefer);
      if (other && !clash(other, y)) side = other;
      else { while (clash(side, y)) y += s * 0.5; }
    }
    y = Math.max(s / 2, Math.min(g.wr.height - s / 2, y));
    const rot = (r1 - 0.5) * (g.wide ? 30 : 18);
    return { x: xFor(side), y, s, side, rot };
  }

  function position(el, p) {
    el.style.setProperty('--s', p.s + 'px');
    el.style.left = p.x - p.s / 2 + 'px';
    el.style.top = p.y - p.s / 2 + 'px';
    el.style.transform = `rotate(${p.rot}deg)`;
  }

  function addSticker(k, animate) {
    const g = geometry();
    const placed = [...shown.values()].map((v) => v.place);
    const p = computePlace(k, g, placed);
    if (!p) return;
    const el = R.stickers.render(parsed.stickers[k].spec);
    el.classList.add('stk-placed');
    position(el, p);
    layer.append(el);
    shown.set(k, { el, place: p });

    if (animate && !reduceMotion()) {
      // Pops up SMALL just above the word that triggered it, pauses for a beat, then
      // travels in a gentle arc to its spot in the margin, growing to full size on arrival.
      const span = spans[parsed.stickers[k].word];
      const wr0 = wrap.getBoundingClientRect();
      const sr = span.getBoundingClientRect();
      const small = Math.max(26, Math.min(46, p.s * 0.38)); // on-screen size while on the word
      const k0 = small / p.s;
      // Start point in the wrap's coordinates: centered over the word, just above its top.
      const sx = Math.max(small / 2 + 4, Math.min(wr0.width - small / 2 - 4, sr.left + sr.width / 2 - wr0.left));
      const sy = sr.top - wr0.top - small * 0.45;
      const dx = sx - p.x, dy = sy - p.y;
      const r = p.rot;
      const T = (x, y, s, deg) => `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)}) rotate(${deg.toFixed(2)}deg)`;

      // The flight is ONE smooth curve (a quadratic Bézier from the word to the margin, bowed
      // gently upward), with one ease-in-out applied over the whole trip: it starts from rest,
      // glides, and slows to rest on arrival. Size and tilt follow the same curve, so it grows
      // continuously to full size exactly as it lands. Sampled finely so there are no corners.
      const dist = Math.hypot(dx, dy);
      const bow = Math.min(90, dist * 0.22);
      const cx = dx * 0.5, cy = dy * 0.5 - bow; // control point: halfway, lifted up
      const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2); // easeInOutCubic
      const POP = 0.12, SETTLE = 0.2, FLY = 0.32; // pop → settle → short pause → fly
      const startTilt = r - 8;
      const frames = [
        { offset: 0, transform: T(dx, dy + 8, 0, r - 25), opacity: 0, easing: 'cubic-bezier(.2,.8,.3,1)' },
        { offset: POP, transform: T(dx, dy, k0 * 1.28, r + 6), opacity: 1, easing: 'ease-in-out' }, // pops up small
        { offset: SETTLE, transform: T(dx, dy, k0, startTilt) }, // settles on the word, then pauses
      ];
      const STEPS = 48;
      for (let i = 0; i <= STEPS; i++) {
        const u = ease(i / STEPS), v = 1 - u;
        const x = v * v * dx + 2 * v * u * cx; // B(u) with P0=(dx,dy), P1=(cx,cy), P2=(0,0)
        const y = v * v * dy + 2 * v * u * cy;
        frames.push({ offset: FLY + (1 - FLY) * (i / STEPS), transform: T(x, y, k0 + (1 - k0) * u, startTilt + (r - startTilt) * u) });
      }
      frames[frames.length - 1].opacity = 1;
      el.style.zIndex = 40;
      el.animate(frames, { duration: 1800 }).onfinish = () => (el.style.zIndex = '');
      // A tiny sparkle where it pops, then hearts where it lands (aimed away from the text).
      setTimeout(() => {
        const w = span.getBoundingClientRect();
        burst(w.left + w.width / 2, w.top - small * 0.45, { count: 8, spread: small * 1.3, size: 8 });
      }, 190);
      setTimeout(() => {
        const w = wrap.getBoundingClientRect();
        burst(w.left + p.x, w.top + p.y, { count: 12, spread: p.s * 1.1, size: Math.max(10, p.s * 0.14), angle: p.side === 'l' ? Math.PI : 0, arc: Math.PI * 0.9 });
      }, 1720);
    } else {
      el.animate([{ opacity: 0, transform: `scale(.6) rotate(${p.rot}deg)` }, { opacity: 1, transform: `scale(1) rotate(${p.rot}deg)` }], { duration: 260, easing: 'ease-out' });
    }
  }

  function removeSticker(k) {
    const v = shown.get(k);
    shown.delete(k);
    if (!v) return;
    const a = v.el.animate([{ opacity: 1 }, { opacity: 0, transform: `scale(.6) rotate(${v.place.rot}deg)` }], { duration: 220, easing: 'ease-in' });
    a.onfinish = () => v.el.remove();
  }

  function relayoutStickers() {
    if (!active || !shown.size) return;
    const g = geometry();
    const placed = [];
    [...shown.keys()].sort((a, b) => a - b).forEach((k) => {
      const v = shown.get(k);
      const p = computePlace(k, g, placed);
      if (!p) return;
      v.place = p;
      placed.push(p);
      position(v.el, p);
    });
  }

  /* ───────── View lifecycle ───────── */
  function enter() {
    active = true;
    syncTheme();
    // Layout only exists while the view is visible, so place stickers now.
    requestAnimationFrame(() => {
      if (!ready && player.classList.contains('no-audio')) idx = spans.length;
      relayoutStickers();
      syncStickers(false);
    });
  }

  function leave() {
    active = false;
    if (audio && !audio.paused) audio.pause();
    chip.classList.remove('show');
  }

  R.letter = { init, enter, leave };
})();
