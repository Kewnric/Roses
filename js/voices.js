/* Voice notes: a grid of buttons, each plays one recording. */
(function () {
  const R = window.Roses;
  const { $, h, fmtTime, toast, resolveAudio, burst, keepAwake } = R.util;

  const PALETTE = [
    ['#ffe0e8', '#ffb3c8'], ['#ede0ff', '#cfb3ff'], ['#ffe9d6', '#ffc8a2'], ['#dcf5e3', '#b4e2c3'],
    ['#dcefff', '#b3d5ff'], ['#fff5c9', '#ffe08a'], ['#ffd3e4', '#ff9fc2'], ['#e6e4ff', '#c4c0ff'],
  ];
  const TILTS = [-1.4, 1.1, -0.7, 1.6, -1.1, 0.8, -1.6, 1.3];

  const audio = new Audio();
  audio.preload = 'auto';
  let items = [];
  let current = null;
  let token = 0;
  let raf = 0;

  const splitLabel = (label) => {
    const m = String(label).match(/^(.*?\bwhen)\s+(.+)$/i);
    return m ? [m[1], m[2]] : ['', String(label)];
  };

  const playIcon = () => h('span', { class: 'vn-icon', html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.2-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>' });
  const eq = () => h('span', { class: 'vn-eq', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i'));

  function build() {
    const grid = $('#vn-grid');
    const notes = Array.isArray(window.VOICE_NOTES) ? window.VOICE_NOTES : [];
    grid.innerHTML = '';
    items = notes.map((n, i) => {
      const [small, big] = splitLabel(n.label || 'Click me');
      const [c1, c2] = Array.isArray(n.colors) ? n.colors : PALETTE[i % PALETTE.length];
      const fill = h('span', { class: 'vn-bar-fill' });
      const time = h('span', { class: 'vn-time' });
      const btn = h(
        'button',
        { class: 'vn', type: 'button', 'aria-pressed': 'false', 'aria-label': n.label, style: { '--c1': c1, '--c2': c2, '--tilt': `${TILTS[i % TILTS.length]}deg`, '--delay': `${i * 55}ms` } },
        h('span', { class: 'vn-stk' }, R.stickers.render(n.sticker || 'heart')),
        h('span', { class: 'vn-state' }, playIcon(), eq(), time),
        h('span', { class: 'vn-text' }, small ? h('span', { class: 'vn-small' }, small) : null, h('span', { class: 'vn-big' }, big)),
        h('span', { class: 'vn-soon' }, 'coming soon'),
        h('span', { class: 'vn-bar' }, fill)
      );
      const item = { note: n, btn, fill, time, tilt: TILTS[i % TILTS.length], url: undefined };
      btn.addEventListener('click', () => (current === item ? stop() : play(item)));
      grid.append(btn);
      resolveAudio(n.file).then((url) => {
        item.url = url;
        btn.classList.toggle('missing', !url);
        if (!url) console.info(`[Roses] Voice note not found yet: ${n.file}`);
      });
      return item;
    });
  }

  async function play(item) {
    stop();
    const my = ++token;
    const url = item.url !== undefined ? item.url : await resolveAudio(item.note.file);
    if (my !== token) return;
    if (!url) {
      toast("This one's still being recorded ♡");
      const r = `rotate(${item.tilt}deg)`;
      item.btn.animate([{ transform: `${r} translateX(0)` }, { transform: `${r} translateX(-6px)` }, { transform: `${r} translateX(6px)` }, { transform: `${r} translateX(0)` }], { duration: 320 });
      return;
    }
    current = item;
    item.btn.classList.add('playing');
    item.btn.setAttribute('aria-pressed', 'true');
    audio.src = url;
    try {
      await audio.play();
    } catch (e) {
      if (my !== token) return;
      stop();
      toast("Hmm, that one didn't play. Try again?");
      return;
    }
    if (my !== token) return;
    const r = item.btn.querySelector('.vn-stk').getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, { count: 10, spread: 90, size: 12 });
    keepAwake(true);
    tick();
  }

  function tick() {
    cancelAnimationFrame(raf);
    if (!current) return;
    const d = audio.duration;
    if (isFinite(d) && d > 0) {
      current.fill.style.transform = `scaleX(${Math.min(1, audio.currentTime / d)})`;
      current.time.textContent = fmtTime(d - audio.currentTime);
    }
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    token++;
    cancelAnimationFrame(raf);
    if (!current) return;
    audio.pause();
    const { btn, fill, time } = current;
    btn.classList.remove('playing');
    btn.setAttribute('aria-pressed', 'false');
    fill.style.transform = 'scaleX(0)';
    time.textContent = '';
    current = null;
    keepAwake(false);
  }

  audio.addEventListener('ended', () => {
    if (!current) return;
    const r = current.btn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, { count: 18, spread: 160, size: 16 });
    stop();
  });

  R.voices = { init: build, enter() {}, leave: stop };
})();
