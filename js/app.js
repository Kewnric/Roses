/* App shell: envelope intro, home page, and moving between pages (#/, #/voices, #/letter). */
(function () {
  const R = window.Roses;
  const { $, $$, ordinal, burst } = R.util;
  const S = Object.assign({ herName: 'My Love', yourName: 'Me', togetherSince: null, envelopeNote: 'tap to open', theme: 'blush' }, window.SETTINGS || {});

  const VIEWS = { home: null, voices: R.voices, letter: R.letter };
  let currentView = null;

  /* ── Text from settings ── */
  function fillText() {
    $$('[data-her-name]').forEach((el) => (el.textContent = S.herName));
    $$('[data-your-name]').forEach((el) => (el.textContent = S.yourName));
    $$('[data-envelope-note]').forEach((el) => (el.textContent = S.envelopeNote));
    $$('[data-stk]').forEach((el) => el.replaceChildren(R.stickers.render(el.dataset.stk)));
    document.title = `For ${S.herName} ♡`;

    const title = $('#home-title');
    const sub = $('[data-together]');
    const since = parseDate(S.togetherSince);
    if (since) {
      const now = new Date();
      const months = monthsBetween(since, now);
      const days = Math.floor((startOfDay(now) - startOfDay(since)) / 86400000);
      if (months >= 1) {
        title.innerHTML = '';
        title.append('Happy ', Object.assign(document.createElement('em'), { textContent: ordinal(months) }), ' Monthsary');
        $('.env-card-title').textContent = `Happy ${ordinal(months)} Monthsary`;
      } else title.textContent = 'Happy Monthsary';
      const years = months / 12;
      const extra = months >= 12 && months % 12 === 0 ? ` · that's ${years} year${years > 1 ? 's' : ''}!` : '';
      sub.textContent = `${days.toLocaleString()} days of us · since ${since.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}${extra}`;
    } else {
      title.textContent = 'Happy Monthsary';
      sub.textContent = 'I made you a little something.';
    }
  }

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  function parseDate(v) {
    if (!v) return null;
    const m = String(v).match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!m) { console.warn('[Roses] togetherSince should look like "2025-01-23"'); return null; }
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }
  function monthsBetween(a, b) {
    let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    if (b.getDate() < a.getDate()) m--;
    return Math.max(0, m);
  }

  /* ── Routing ── */
  function route() {
    const name = (location.hash.replace(/^#\/?/, '') || 'home').toLowerCase();
    show(name in VIEWS ? name : 'home');
  }

  function show(name) {
    if (name === currentView) return;
    if (currentView && VIEWS[currentView] && VIEWS[currentView].leave) VIEWS[currentView].leave();
    $$('.view').forEach((v) => v.classList.toggle('active', v.dataset.view === name));
    document.body.dataset.view = name;
    currentView = name;
    scrollTo(0, 0);
    if (name !== 'letter') R.themes.apply(S.theme);
    if (VIEWS[name] && VIEWS[name].enter) VIEWS[name].enter();
    const heading = $(`.view[data-view="${name}"] h1, .view[data-view="${name}"] h2`);
    if (heading && openedOnce) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  }

  /* ── Envelope ── */
  let openedOnce = false;
  function openApp(skipAnimation) {
    const intro = $('#intro');
    const app = $('#app');
    const reveal = () => {
      intro.remove();
      app.hidden = false;
      route();
      openedOnce = true;
    };
    try { sessionStorage.setItem('roses-opened', '1'); } catch (e) {}
    if (skipAnimation || R.util.reduceMotion()) return reveal();
    const env = $('.envelope');
    env.disabled = true;
    intro.classList.add('opening');
    const r = env.getBoundingClientRect();
    setTimeout(() => burst(r.left + r.width / 2, r.top + r.height * 0.4, { count: 22, spread: Math.max(160, r.width * 0.55), size: 18 }), 1150);
    setTimeout(() => intro.classList.add('leaving'), 2300);
    setTimeout(reveal, 2950);
  }

  function initIntro() {
    let opened = false;
    try { opened = sessionStorage.getItem('roses-opened') === '1'; } catch (e) {}
    if (opened || /[?&]skip\b/.test(location.search)) return openApp(true);
    $('.envelope').addEventListener('click', () => openApp(false), { once: true });
  }

  function start() {
    R.themes.init();
    R.themes.apply(S.theme);
    fillText();
    R.voices.init();
    R.letter.init();
    addEventListener('hashchange', route);
    initIntro();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
