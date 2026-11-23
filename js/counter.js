/* Click counters for the voice-note cards.

   • With Firebase set up (SETTINGS.firebase in content/settings.js): counts are shared by
     everyone who opens the link, update live, and need no sign-in. Each click is an atomic
     "+1" on the server, so two people clicking at once never overwrite each other.
   • Without it: counts are kept on this device only, so the site still works.

   Fast repeated clicks are bundled into one write every ~0.4 s. The number on screen updates
   instantly either way. */
(function () {
  const R = window.Roses;
  const cfg = (window.SETTINGS && window.SETTINGS.firebase) || null;
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const LOCAL_KEY = 'roses-clicks';

  const counts = {};   // last known total per card
  const pending = {};  // clicks not yet sent
  const listeners = new Set();
  let mode = 'local';
  let ref = null;
  let flushTimer = 0, retryDelay = 1000;

  const get = (id) => (counts[id] || 0) + (pending[id] || 0);
  const emit = (id) => listeners.forEach((fn) => fn(id, get(id)));
  const emitAll = () => Object.keys({ ...counts, ...pending }).forEach(emit);

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Could not load ' + src));
      document.head.appendChild(s);
    });
  }

  async function startShared() {
    await loadScript(SDK + 'firebase-app-compat.js');
    await loadScript(SDK + 'firebase-database-compat.js');
    const app = window.firebase.apps.length ? window.firebase.app() : window.firebase.initializeApp(cfg);
    ref = app.database().ref('clicks');
    mode = 'shared';
    ref.on(
      'value',
      (snap) => {
        const v = snap.val() || {};
        for (const k of Object.keys(v)) counts[k] = Number(v[k]) || 0;
        emitAll();
      },
      (err) => console.warn('[Roses] Click counter read failed. Check the database rules.', err)
    );
  }

  function startLocal() {
    mode = 'local';
    try { Object.assign(counts, JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')); } catch (e) {}
    emitAll();
  }

  function schedule(ms = 400) {
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, ms);
  }

  function flush() {
    const ids = Object.keys(pending).filter((id) => pending[id] > 0);
    if (!ids.length) return;
    if (mode === 'local') {
      ids.forEach((id) => { counts[id] = (counts[id] || 0) + pending[id]; delete pending[id]; });
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(counts)); } catch (e) {}
      return;
    }
    ids.forEach((id) => {
      const n = pending[id];
      delete pending[id];
      counts[id] = (counts[id] || 0) + n; // shown right away; the live listener confirms it
      ref.child(id).set(window.firebase.database.ServerValue.increment(n)).then(
        () => { retryDelay = 1000; },
        (err) => {
          console.warn('[Roses] Click counter write failed, will retry.', err);
          counts[id] -= n;
          pending[id] = (pending[id] || 0) + n;
          emit(id);
          retryDelay = Math.min(30000, retryDelay * 2);
          schedule(retryDelay);
        }
      );
    });
  }

  /** Count one click on a card. */
  function hit(id) {
    pending[id] = (pending[id] || 0) + 1;
    emit(id);
    schedule();
  }

  function init() {
    if (cfg && cfg.databaseURL) {
      startShared().catch((e) => {
        console.warn('[Roses] Firebase unavailable, counting on this device only.', e);
        startLocal();
      });
    } else {
      console.info('[Roses] Click counters are per-device until SETTINGS.firebase is filled in (see README).');
      startLocal();
    }
    addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  }

  R.counter = { init, hit, get, onChange: (fn) => listeners.add(fn), get mode() { return mode; } };
})();
