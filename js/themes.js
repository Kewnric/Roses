/* Themes + the animated background (petals, stars, bubbles, …).
   Roses.themes.apply("night") cross-fades the whole site to that look. */
(function () {
  const R = (window.Roses = window.Roses || {});

  const THEMES = {
    blush: {
      label: 'Blush',
      bg: 'radial-gradient(circle at 18% 12%, #fff4f6 0, transparent 42%), radial-gradient(circle at 88% 85%, #ffc9d9 0, transparent 48%), linear-gradient(160deg, #ffe6ec 0%, #fbd0de 52%, #f5b6ca 100%)',
      meta: '#fbd0de',
      vars: { 'accent-ink': '#ffffff', ink: '#5a1e33', 'ink-soft': '#9a5168', accent: '#e0457b', 'accent-2': '#ff8fab', paper: '#fffaf7', 'paper-ink': '#4b1c2c', card: 'rgba(255,255,255,.62)', 'card-ink': '#4b1c2c', glow: 'rgba(255,143,171,.55)' },
      fx: { type: 'petal', colors: ['#ffb3c6', '#ff8fab', '#ffc2d1', '#ffd6e0'], density: 1 },
    },
    roses: {
      label: 'Roses',
      bg: 'radial-gradient(circle at 80% 10%, rgba(255,120,150,.35) 0, transparent 40%), radial-gradient(circle at 10% 90%, rgba(255,77,109,.25) 0, transparent 45%), linear-gradient(165deg, #4d0718 0%, #7c1530 50%, #a52a48 100%)',
      meta: '#7c1530',
      vars: { 'accent-ink': '#ffffff', ink: '#fff0f3', 'ink-soft': '#ffbfcf', accent: '#c9184a', 'accent-2': '#ff4d6d', paper: '#fff6f4', 'paper-ink': '#4a0d1e', card: 'rgba(255,255,255,.13)', 'card-ink': '#fff0f3', glow: 'rgba(255,77,109,.6)' },
      fx: { type: 'petal', colors: ['#c9184a', '#e63950', '#ff4d6d', '#a4133c'], density: 1.15 },
    },
    sunset: {
      label: 'Sunset',
      bg: 'radial-gradient(circle at 50% 108%, #ffd29d 0, transparent 50%), linear-gradient(175deg, #ffd5b8 0%, #ffb4a2 35%, #e5989b 68%, #a9788f 100%)',
      meta: '#ffb4a2',
      vars: { 'accent-ink': '#ffffff', ink: '#4a2030', 'ink-soft': '#7d4651', accent: '#e76f51', 'accent-2': '#f4a261', paper: '#fff8f0', 'paper-ink': '#4a2430', card: 'rgba(255,255,255,.55)', 'card-ink': '#4a2030', glow: 'rgba(255,190,120,.6)' },
      fx: { type: 'sparkle', colors: ['#fff1c1', '#ffd166', '#ffffff'], density: 1 },
    },
    night: {
      label: 'Starry night',
      bg: 'radial-gradient(circle at 82% 12%, rgba(255,236,190,.28) 0, rgba(255,236,190,.06) 9%, transparent 22%), radial-gradient(ellipse at 20% 100%, rgba(120,80,200,.35) 0, transparent 55%), linear-gradient(180deg, #080c22 0%, #161a44 55%, #33285f 100%)',
      meta: '#161a44',
      vars: { ink: '#f4f1ff', 'ink-soft': '#b9b4e6', accent: '#ffd08a', 'accent-ink': '#231a4a', 'accent-2': '#c3b5ff', paper: 'rgba(24,28,68,.86)', 'paper-ink': '#f2ecff', card: 'rgba(255,255,255,.1)', 'card-ink': '#f4f1ff', glow: 'rgba(255,214,150,.45)' },
      fx: { type: 'star', colors: ['#ffffff', '#fff3cf', '#d9d4ff'], density: 1 },
    },
    garden: {
      label: 'Garden',
      bg: 'radial-gradient(circle at 15% 15%, #fbfff2 0, transparent 45%), radial-gradient(circle at 90% 90%, #a7c88a 0, transparent 50%), linear-gradient(165deg, #eef7e0 0%, #d3e6bd 50%, #b5cf98 100%)',
      meta: '#d3e6bd',
      vars: { 'accent-ink': '#ffffff', ink: '#2f3e1f', 'ink-soft': '#5d7346', accent: '#e05780', 'accent-2': '#ffb3c6', paper: '#fffdf5', 'paper-ink': '#33401f', card: 'rgba(255,255,255,.6)', 'card-ink': '#2f3e1f', glow: 'rgba(255,240,150,.6)' },
      fx: { type: 'blossom', colors: ['#ffffff', '#ffd6e0', '#fff1a8', '#ffc8dd'], density: 0.9 },
    },
    ocean: {
      label: 'Ocean',
      bg: 'radial-gradient(circle at 50% -10%, #f2fcff 0, transparent 50%), linear-gradient(180deg, #d4f3fa 0%, #93dff0 50%, #4cc3e0 100%)',
      meta: '#93dff0',
      vars: { 'accent-ink': '#ffffff', ink: '#063a52', 'ink-soft': '#2e6b85', accent: '#0a8fc2', 'accent-2': '#48cae4', paper: '#f8fdff', 'paper-ink': '#0b3a4f', card: 'rgba(255,255,255,.58)', 'card-ink': '#063a52', glow: 'rgba(255,255,255,.7)' },
      fx: { type: 'bubble', colors: ['#ffffff', '#e0fbff'], density: 1 },
    },
    golden: {
      label: 'Golden',
      bg: 'radial-gradient(circle at 50% 28%, #fffbea 0, transparent 58%), linear-gradient(160deg, #fff4d6 0%, #f6d89c 58%, #e7b867 100%)',
      meta: '#f6d89c',
      vars: { 'accent-ink': '#ffffff', ink: '#4a3410', 'ink-soft': '#80612c', accent: '#c4861a', 'accent-2': '#f2c14e', paper: '#fffcf3', 'paper-ink': '#4a3412', card: 'rgba(255,255,255,.6)', 'card-ink': '#4a3410', glow: 'rgba(255,215,120,.7)' },
      fx: { type: 'sparkle', colors: ['#fff6d5', '#ffd166', '#f2c14e', '#ffffff'], density: 1.3 },
    },
    lavender: {
      label: 'Lavender',
      bg: 'radial-gradient(circle at 85% 15%, #fbf6ff 0, transparent 45%), radial-gradient(circle at 10% 85%, #d7b8ff 0, transparent 50%), linear-gradient(165deg, #f4eaff 0%, #e2c8fc 50%, #c9b8ff 100%)',
      meta: '#e2c8fc',
      vars: { 'accent-ink': '#ffffff', ink: '#3c1f5c', 'ink-soft': '#6e4f93', accent: '#9d4edd', 'accent-2': '#e0aaff', paper: '#fdfaff', 'paper-ink': '#3a1f55', card: 'rgba(255,255,255,.58)', 'card-ink': '#3c1f5c', glow: 'rgba(224,170,255,.65)' },
      fx: { type: 'heart', colors: ['#c77dff', '#e0aaff', '#ff8fab', '#ffffff'], density: 1 },
    },
    snow: {
      label: 'Snow',
      bg: 'radial-gradient(circle at 50% 0%, #ffffff 0, transparent 55%), linear-gradient(180deg, #edf4fc 0%, #d2e0f3 60%, #b6c9e6 100%)',
      meta: '#d2e0f3',
      vars: { 'accent-ink': '#ffffff', ink: '#1f2f4a', 'ink-soft': '#4d6285', accent: '#d94f70', 'accent-2': '#8fb3e8', paper: '#ffffff', 'paper-ink': '#22324d', card: 'rgba(255,255,255,.62)', 'card-ink': '#1f2f4a', glow: 'rgba(255,255,255,.8)' },
      fx: { type: 'snow', colors: ['#ffffff'], density: 1 },
    },
    party: {
      label: 'Party',
      bg: 'radial-gradient(circle at 15% 20%, #fff 0, transparent 40%), radial-gradient(circle at 85% 80%, #ffd6a5 0, transparent 50%), linear-gradient(155deg, #fff0f6 0%, #ffe0ec 45%, #ffe3c4 100%)',
      meta: '#ffe0ec',
      vars: { 'accent-ink': '#ffffff', ink: '#4a1f3d', 'ink-soft': '#8a4f73', accent: '#f72585', 'accent-2': '#7209b7', paper: '#fffdfb', 'paper-ink': '#45203a', card: 'rgba(255,255,255,.62)', 'card-ink': '#4a1f3d', glow: 'rgba(247,37,133,.4)' },
      fx: { type: 'confetti', colors: ['#f72585', '#ffd166', '#06d6a0', '#4cc9f0', '#b5179e', '#ff8fab'], density: 1 },
    },
  };

  /* ───────── Ambient particles ───────── */
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BASE = { petal: 26, heart: 16, star: 120, sparkle: 34, blossom: 22, bubble: 22, snow: 80, confetti: 46 };
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  const Ambient = {
    canvas: null, ctx: null, w: 0, h: 0, dpr: 1, parts: [], fx: null, last: 0, running: false,

    init(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.resize();
      addEventListener('resize', () => this.resize());
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.kick(); });
      this.kick();
    },
    resize() {
      this.dpr = Math.min(devicePixelRatio || 1, 2);
      this.w = innerWidth; this.h = innerHeight;
      this.canvas.width = Math.round(this.w * this.dpr);
      this.canvas.height = Math.round(this.h * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    },
    target() {
      if (!this.fx) return 0;
      const area = Math.min(1.6, (this.w * this.h) / (1280 * 800));
      const n = BASE[this.fx.type] * (this.fx.density || 1) * Math.max(0.45, area);
      return Math.round(reduceMotion ? n * 0.35 : n);
    },
    set(fx) {
      this.parts.forEach((p) => { if (p.type !== fx.type || p.colors !== fx.colors) p.dying = true; });
      this.fx = fx;
      const want = this.target();
      for (let k = 0; k < want; k++) this.parts.push(this.spawn(true));
      this.kick();
    },
    spawn(initial) {
      const { type, colors } = this.fx;
      const w = this.w, h = this.h;
      const p = { type, colors, color: pick(colors), a: 0, fade: rand(0.4, 1), born: performance.now() + (initial ? rand(0, 1800) : 0) };
      switch (type) {
        case 'petal': case 'blossom':
          Object.assign(p, { x: rand(-20, w + 20), y: initial ? rand(-h * 0.2, h) : rand(-60, -20), s: type === 'petal' ? rand(7, 15) : rand(5, 10), vy: rand(18, 42), vx: rand(-10, 14), rot: rand(0, 6.28), vr: rand(-1.4, 1.4), sway: rand(0, 6.28), swayAmp: rand(10, 30), flip: rand(0, 6.28) });
          break;
        case 'heart':
          Object.assign(p, { x: rand(0, w), y: initial ? rand(0, h) : h + rand(10, 60), s: rand(6, 14), vy: -rand(14, 30), vx: 0, sway: rand(0, 6.28), swayAmp: rand(8, 22), rot: rand(-0.4, 0.4) });
          break;
        case 'star':
          Object.assign(p, { x: rand(0, w), y: rand(0, h * 0.92), s: Math.random() < 0.12 ? rand(1.6, 2.6) : rand(0.5, 1.5), tw: rand(0, 6.28), tws: rand(0.6, 2.2), fade: 1 });
          break;
        case 'sparkle':
          Object.assign(p, { x: rand(0, w), y: rand(0, h), s: rand(3, 9), life: rand(2.5, 6), t: initial ? rand(0, 4) : 0, vy: -rand(2, 8), rot: rand(0, 1) });
          break;
        case 'bubble':
          Object.assign(p, { x: rand(0, w), y: initial ? rand(0, h) : h + rand(10, 80), s: rand(4, 16), vy: -rand(16, 40), sway: rand(0, 6.28), swayAmp: rand(6, 18) });
          break;
        case 'snow':
          Object.assign(p, { x: rand(0, w), y: initial ? rand(-h * 0.1, h) : rand(-30, -8), s: rand(1.5, 4.5), vy: rand(14, 36), vx: rand(-6, 6), sway: rand(0, 6.28), swayAmp: rand(6, 20) });
          break;
        case 'confetti':
          Object.assign(p, { x: rand(0, w), y: initial ? rand(-h * 0.3, h) : rand(-40, -10), s: rand(5, 10), vy: rand(30, 70), vx: rand(-14, 14), rot: rand(0, 6.28), vr: rand(-4, 4), flip: rand(0, 6.28), vf: rand(3, 8) });
          break;
      }
      return p;
    },
    kick() {
      if (this.running) return;
      this.running = true;
      this.last = performance.now();
      requestAnimationFrame((t) => this.frame(t));
    },
    frame(now) {
      if (document.hidden) { this.running = false; return; }
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      const ctx = this.ctx, w = this.w, h = this.h;
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      const want = this.target();
      const t = now / 1000;
      for (let k = this.parts.length - 1; k >= 0; k--) {
        const p = this.parts[k];
        if (now < p.born) { if (!p.dying) alive++; else this.parts.splice(k, 1); continue; }
        p.a = p.dying ? p.a - dt * 0.9 : Math.min(1, p.a + dt * 0.8);
        if (p.dying && p.a <= 0) { this.parts.splice(k, 1); continue; }
        const out = this.step(p, dt, t, w, h);
        if (out) {
          if (p.dying || alive >= want) { this.parts.splice(k, 1); continue; }
          this.parts[k] = this.spawn(false);
          continue;
        }
        if (!p.dying) alive++;
        this.draw(ctx, p, t);
      }
      if (this.parts.length) requestAnimationFrame((tt) => this.frame(tt));
      else this.running = false;
    },
    step(p, dt, t, w, h) {
      switch (p.type) {
        case 'petal': case 'blossom': case 'snow':
          p.y += p.vy * dt; p.x += (p.vx + Math.sin(t * 0.9 + p.sway) * p.swayAmp * 0.6) * dt;
          if (p.vr) p.rot += p.vr * dt;
          return p.y > h + 30 || p.x < -60 || p.x > w + 60;
        case 'heart': case 'bubble':
          p.y += p.vy * dt; p.x += Math.sin(t * 1.3 + p.sway) * p.swayAmp * dt;
          return p.y < -30;
        case 'star':
          return false;
        case 'sparkle':
          p.t += dt; p.y += p.vy * dt;
          return p.t > p.life;
        case 'confetti':
          p.y += p.vy * dt; p.x += p.vx * dt; p.rot += p.vr * dt; p.flip += p.vf * dt;
          return p.y > h + 20;
      }
      return true;
    },
    draw(ctx, p, t) {
      ctx.save();
      switch (p.type) {
        case 'petal': {
          ctx.globalAlpha = p.a * 0.85 * p.fade + 0.1;
          ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(t * 1.2 + p.flip)));
          const s = p.s;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.bezierCurveTo(s * 0.95, -s * 0.7, s * 0.8, s * 0.7, 0, s);
          ctx.bezierCurveTo(-s * 0.8, s * 0.7, -s * 0.95, -s * 0.7, 0, -s);
          ctx.fill();
          ctx.globalAlpha *= 0.35; ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.ellipse(-s * 0.2, -s * 0.3, s * 0.18, s * 0.45, 0.3, 0, 6.28); ctx.fill();
          break;
        }
        case 'blossom': {
          ctx.globalAlpha = p.a * 0.9;
          ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          for (let k = 0; k < 5; k++) { ctx.rotate(1.2566); ctx.beginPath(); ctx.ellipse(0, -p.s * 0.55, p.s * 0.36, p.s * 0.55, 0, 0, 6.28); ctx.fill(); }
          ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(0, 0, p.s * 0.25, 0, 6.28); ctx.fill();
          break;
        }
        case 'heart': {
          const life = Math.min(1, p.y / (this.h * 0.35));
          ctx.globalAlpha = p.a * 0.75 * Math.max(0, life);
          ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          const s = p.s / 10;
          ctx.scale(s, s);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, 7);
          ctx.bezierCurveTo(-7, 2, -10, -2, -10, -5); ctx.bezierCurveTo(-10, -9, -6, -11, -3.5, -11);
          ctx.bezierCurveTo(-1.6, -11, -0.4, -9.8, 0, -8.2); ctx.bezierCurveTo(0.4, -9.8, 1.6, -11, 3.5, -11);
          ctx.bezierCurveTo(6, -11, 10, -9, 10, -5); ctx.bezierCurveTo(10, -2, 7, 2, 0, 7);
          ctx.fill();
          break;
        }
        case 'star': {
          const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * p.tws + p.tw));
          ctx.globalAlpha = p.a * tw;
          ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.28); ctx.fill();
          if (p.s > 1.5) {
            ctx.globalAlpha *= 0.5; ctx.strokeStyle = p.color; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(p.x - p.s * 4, p.y); ctx.lineTo(p.x + p.s * 4, p.y); ctx.moveTo(p.x, p.y - p.s * 4); ctx.lineTo(p.x, p.y + p.s * 4); ctx.stroke();
          }
          break;
        }
        case 'sparkle': {
          const k = p.t / p.life;
          const env = Math.sin(Math.PI * Math.min(1, Math.max(0, k)));
          ctx.globalAlpha = p.a * env;
          ctx.translate(p.x, p.y); ctx.rotate(p.rot + t * 0.3);
          const s = p.s * (0.6 + 0.4 * env);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -s); ctx.quadraticCurveTo(0, 0, s, 0); ctx.quadraticCurveTo(0, 0, 0, s); ctx.quadraticCurveTo(0, 0, -s, 0); ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();
          break;
        }
        case 'bubble': {
          ctx.globalAlpha = p.a * 0.7;
          ctx.strokeStyle = p.color; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.28); ctx.stroke();
          ctx.globalAlpha *= 0.35; ctx.fillStyle = p.color; ctx.fill();
          ctx.globalAlpha = p.a * 0.9; ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(p.x - p.s * 0.35, p.y - p.s * 0.35, p.s * 0.22, 0, 6.28); ctx.fill();
          break;
        }
        case 'snow': {
          ctx.globalAlpha = p.a * 0.9;
          ctx.fillStyle = p.color;
          ctx.shadowColor = 'rgba(255,255,255,.9)'; ctx.shadowBlur = p.s * 2;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.28); ctx.fill();
          break;
        }
        case 'confetti': {
          ctx.globalAlpha = p.a * 0.95;
          ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(Math.cos(p.flip), 1);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.s / 2, -p.s * 0.3, p.s, p.s * 0.6);
          break;
        }
      }
      ctx.restore();
    },
  };

  /* ───────── Theme switching ───────── */
  let current = null;
  let layers = [];
  let active = 0;

  function apply(name) {
    const key = String(name || '').trim().toLowerCase();
    const t = THEMES[key] || THEMES.blush;
    if (!THEMES[key]) console.warn(`[Roses] Unknown theme "${name}". Options: ${Object.keys(THEMES).join(', ')}`);
    const resolved = THEMES[key] ? key : 'blush';
    if (resolved === current) return;
    current = resolved;
    const root = document.documentElement;
    root.dataset.theme = resolved;
    for (const [k, v] of Object.entries(t.vars)) root.style.setProperty('--' + k, v);
    if (layers.length) {
      const next = layers[active ^ 1];
      next.style.background = t.bg;
      next.classList.add('on');
      layers[active].classList.remove('on');
      active ^= 1;
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = t.meta;
    if (Ambient.canvas) Ambient.set(t.fx);
  }

  function init() {
    layers = [...document.querySelectorAll('.scene-bg')];
    const canvas = document.querySelector('.ambient');
    if (canvas) Ambient.init(canvas);
  }

  R.themes = { list: THEMES, names: Object.keys(THEMES), apply, init, get current() { return current; } };
})();
