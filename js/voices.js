/* Voice notes: each card holds several short clips.
   • Tap a card → a random clip plays (shuffle bag: no repeats until all its clips have played).
   • Tap again while it plays → instantly switches to the next random clip.
   • The round button in the corner plays, or stops while playing.
   • Each card shows how many times it's been tapped (shared via Firebase when set up). */
(function () {
  const R = window.Roses;
  const { $, h, fmtTime, toast, burst, keepAwake } = R.util;

  const PALETTE = [
    ['#ffe0e8', '#ffb3c8'], ['#ede0ff', '#cfb3ff'], ['#ffe9d6', '#ffc8a2'], ['#dcf5e3', '#b4e2c3'],
    ['#dcefff', '#b3d5ff'], ['#fff5c9', '#ffe08a'], ['#ffd3e4', '#ff9fc2'], ['#e6e4ff', '#c4c0ff'],
  ];
  const TILTS = [-1.4, 1.1, -0.7, 1.6, -1.1, 0.8, -1.6, 1.3];
  const ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.2-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
  const ICON_STOP = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5"/></svg>';
  const ICON_HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5C6.2 16.7 2.5 13.3 2.5 9.1 2.5 6.3 4.7 4 7.4 4c1.9 0 3.6 1.1 4.6 2.7C13 5.1 14.7 4 16.6 4c2.7 0 4.9 2.3 4.9 5.1 0 4.2-3.7 7.6-9.5 11.4z"/></svg>';

  let cards = [];
  const byId = {};
  let current = null; // { card, a, url }
  let token = 0;
  let raf = 0;
  const pool = new Map(); // url → <audio>, so clips are loaded once and switch instantly

  const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  const splitLabel = (label) => {
    const m = String(label).match(/^(.*?\bwhen)\s+(.+)$/i);
    return m ? [m[1], m[2]] : ['', String(label)];
  };
  const fmtCount = (n) => (n < 1000 ? String(n) : n < 10000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : Math.round(n / 1000) + 'k');

  function audioFor(url) {
    let a = pool.get(url);
    if (!a) {
      a = new Audio();
      a.preload = 'auto';
      a.src = url;
      a.addEventListener('ended', () => { if (current && current.a === a) finished(); });
      pool.set(url, a);
    }
    return a;
  }
  /** Start downloading the clip this card will play next, so the next tap starts instantly. */
  const preloadNext = (card) => { const next = card.bag.peek(); if (next) audioFor(next); };

  /* ───────── Build the cards ───────── */
  function build() {
    const grid = $('#vn-grid');
    const notes = Array.isArray(window.VOICE_NOTES) ? window.VOICE_NOTES : [];
    grid.innerHTML = '';
    cards = notes.map((n, i) => {
      let id = slug(n.id || n.label) || `note-${i + 1}`;
      while (byId[id]) id += '-' + (i + 1);
      const clips = (Array.isArray(n.clips) ? n.clips : n.file ? [n.file] : []).filter(Boolean);
      const [small, big] = splitLabel(n.label || 'Click me');
      const [c1, c2] = Array.isArray(n.colors) ? n.colors : PALETTE[i % PALETTE.length];
      const tilt = TILTS[i % TILTS.length];

      const fill = h('span', { class: 'vn-bar-fill' });
      const time = h('span', { class: 'vn-time' });
      const count = h('span', { class: 'vn-count-n' }, '0');
      const main = h(
        'button',
        { class: 'vn', type: 'button', 'aria-pressed': 'false' },
        h('span', { class: 'vn-stk' }, R.stickers.render(n.sticker || 'heart')),
        h('span', { class: 'vn-count', title: 'Times played' }, h('span', { class: 'vn-count-i', html: ICON_HEART }), count),
        h('span', { class: 'vn-text' }, small ? h('span', { class: 'vn-small' }, small) : null, h('span', { class: 'vn-big' }, big)),
        h('span', { class: 'vn-soon' }, 'coming soon'),
        h('span', { class: 'vn-bar' }, fill)
      );
      const ctl = h(
        'button',
        { class: 'vn-ctl', type: 'button', 'aria-label': 'Play' },
        h('span', { class: 'vn-icon vn-icon-play', html: ICON_PLAY }),
        h('span', { class: 'vn-icon vn-icon-stop', html: ICON_STOP }),
        h('span', { class: 'vn-eq', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i')),
        time
      );
      const cell = h('div', { class: 'vn-cell' + (clips.length ? '' : ' missing'), style: { '--c1': c1, '--c2': c2, '--tilt': `${tilt}deg`, '--delay': `${i * 55}ms` } }, main, ctl);

      const card = { id, note: n, label: n.label || 'Voice note', cell, main, ctl, fill, time, count, tilt, bag: new R.shuffle.ShuffleBag(id, clips) };
      main.addEventListener('click', () => playNext(card));
      ctl.addEventListener('click', () => (current && current.card === card ? stop() : playNext(card)));
      byId[id] = card;
      grid.append(cell);
      setLabel(card);
      return card;
    });

    R.counter.onChange((id, n) => {
      const c = byId[id];
      if (!c) return;
      const before = c.shown || 0;
      c.shown = n;
      c.count.textContent = fmtCount(n);
      setLabel(c);
      if (n > before && before > 0) c.count.parentElement.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.22)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' });
    });
    R.counter.init();
  }

  function setLabel(card) {
    const n = R.counter.get(card.id);
    card.main.setAttribute('aria-label', `${card.label}. Played ${n} time${n === 1 ? '' : 's'}.`);
  }

  /* ───────── Playback ───────── */
  async function playNext(card) {
    if (!card.bag.items.length) return comingSoon(card);
    R.counter.hit(card.id);
    const my = ++token;

    // Cut whatever is playing right now, instantly.
    if (current) {
      current.a.pause();
      if (current.card !== card) showPlaying(current.card, false);
    }
    showPlaying(card, true);
    card.fill.style.transform = 'scaleX(0)';

    for (let tries = card.bag.items.length; tries > 0; tries--) {
      const url = card.bag.next();
      if (url == null) break;
      const a = audioFor(url);
      current = { card, a, url };
      try { a.currentTime = 0; } catch (e) {}
      try {
        await a.play();
      } catch (e) {
        if (my !== token) return; // a newer tap took over: fine
        if (e && e.name === 'NotAllowedError') { stop(); toast('Tap again to play ♡'); return; }
        console.info('[Roses] Skipping a clip that would not play:', url);
        card.bag.drop(url);
        pool.delete(url);
        continue;
      }
      // A newer tap took over while this one was starting. Silence this clip, unless the
      // newer tap is reusing the very same clip (it's what should be playing now).
      if (my !== token) { if (!current || current.a !== a) a.pause(); return; }
      const r = card.main.querySelector('.vn-stk').getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, { count: 8, spread: 70, size: 11 });
      keepAwake(true);
      tick();
      preloadNext(card);
      return;
    }
    // Nothing on this card could play.
    if (my !== token) return;
    current = null;
    showPlaying(card, false);
    card.cell.classList.add('missing');
    comingSoon(card);
  }

  function comingSoon(card) {
    toast("This one's still being recorded ♡");
    const r = `rotate(${card.tilt}deg)`;
    card.cell.animate([{ transform: `${r} translateX(0)` }, { transform: `${r} translateX(-6px)` }, { transform: `${r} translateX(6px)` }, { transform: `${r} translateX(0)` }], { duration: 320 });
  }

  function showPlaying(card, on) {
    card.cell.classList.toggle('playing', on);
    card.main.setAttribute('aria-pressed', on ? 'true' : 'false');
    card.ctl.setAttribute('aria-label', on ? 'Stop' : 'Play');
    if (!on) { card.fill.style.transform = 'scaleX(0)'; card.time.textContent = ''; }
  }

  function tick() {
    cancelAnimationFrame(raf);
    if (!current) return;
    const { a, card } = current;
    const d = a.duration;
    if (isFinite(d) && d > 0) {
      card.fill.style.transform = `scaleX(${Math.min(1, a.currentTime / d)})`;
      card.time.textContent = fmtTime(Math.max(0, d - a.currentTime));
    }
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    token++;
    cancelAnimationFrame(raf);
    if (!current) return;
    current.a.pause();
    showPlaying(current.card, false);
    current = null;
    keepAwake(false);
  }

  function finished() {
    const r = current.card.cell.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, { count: 16, spread: 150, size: 15 });
    stop();
  }

  R.voices = {
    init: build,
    enter() { cards.forEach((c) => { if (c.bag.items.length) preloadNext(c); }); },
    leave: stop,
  };
})();
