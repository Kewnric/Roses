/* Sticker library: small hand-drawn SVGs. A CSS filter gives them the white die-cut border.
   Roses.stickers.render(spec) accepts a sticker name, an emoji, or an image path. */
(function () {
  const R = (window.Roses = window.Roses || {});
  const LINE = '#4a2233';

  const face = (cx, cy, s = 1, { sleepy = false } = {}) => {
    const ex = 7 * s, ey = cy - 1 * s;
    const eyes = sleepy
      ? `<path d="M${cx - ex - 3 * s} ${ey} q${3 * s} ${3 * s} ${6 * s} 0 M${cx + ex - 3 * s} ${ey} q${3 * s} ${3 * s} ${6 * s} 0" stroke="${LINE}" stroke-width="${2.4 * s}" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="${cx - ex}" cy="${ey}" rx="${2.4 * s}" ry="${3 * s}" fill="${LINE}"/><ellipse cx="${cx + ex}" cy="${ey}" rx="${2.4 * s}" ry="${3 * s}" fill="${LINE}"/>` +
        `<circle cx="${cx - ex + 0.8 * s}" cy="${ey - 1.2 * s}" r="${0.9 * s}" fill="#fff"/><circle cx="${cx + ex + 0.8 * s}" cy="${ey - 1.2 * s}" r="${0.9 * s}" fill="#fff"/>`;
    const mouth = `<path d="M${cx - 3 * s} ${cy + 4 * s} q${3 * s} ${3 * s} ${6 * s} 0" stroke="${LINE}" stroke-width="${2.2 * s}" fill="none" stroke-linecap="round"/>`;
    const blush = `<ellipse cx="${cx - 12 * s}" cy="${cy + 4 * s}" rx="${4 * s}" ry="${2.4 * s}" fill="#ff7aa2" opacity=".55"/><ellipse cx="${cx + 12 * s}" cy="${cy + 4 * s}" rx="${4 * s}" ry="${2.4 * s}" fill="#ff7aa2" opacity=".55"/>`;
    return eyes + blush + mouth;
  };

  const HEART = 'M50 86 C24 70 8 54 8 34 C8 20 19 10 32 10 C41 10 47 15 50 22 C53 15 59 10 68 10 C81 10 92 20 92 34 C92 54 76 70 50 86Z';
  const sparkle = (cx, cy, r) => `M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r}Z`;
  const polar = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];

  const starPoints = (cx, cy, ro, ri) => {
    const pts = [];
    for (let k = 0; k < 10; k++) pts.push(polar(cx, cy, k % 2 ? ri : ro, -90 + k * 36).map((v) => v.toFixed(2)).join(','));
    return pts.join(' ');
  };

  const S = {
    heart: () => `
      <path d="${HEART}" fill="#ff4d6d"/>
      <path d="M22 32 C22 25 26 20 33 19" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/>`,

    hearts: () => `
      <g transform="translate(34 4) scale(.62) rotate(14 50 50)"><path d="${HEART}" fill="#ffafcc" vector-effect="non-scaling-stroke"/></g>
      <g transform="translate(2 28) scale(.7) rotate(-10 50 50)"><path d="${HEART}" fill="#ff4d6d" vector-effect="non-scaling-stroke"/>
        <path d="M22 32 C22 25 26 20 33 19" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".85" vector-effect="non-scaling-stroke"/></g>`,

    rose: () => `
      <path d="M50 62 C50 74 48 84 50 95" stroke="#3f7d3a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M49 80 C40 70 28 70 22 77 C30 86 42 86 49 80Z" fill="#6fbf5f"/>
      <path d="M51 74 C58 64 70 63 77 69 C70 78 58 79 51 74Z" fill="#6fbf5f"/>
      <path d="M22 38 C20 20 37 10 50 13 C64 10 81 20 78 38 C76 55 63 65 50 65 C37 65 24 55 22 38Z" fill="#e63950"/>
      <path d="M33 35 C35 24 45 20 52 22 C63 22 69 31 67 39 C63 50 52 53 45 51 C37 49 33 44 33 35Z" fill="#ff5c74"/>
      <path d="M50 29 C58 29 61 37 55 42 C49 46 42 41 45 35 C47 32 52 33 52 37" stroke="#a4133c" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M27 46 C33 55 43 59 50 59 M73 46 C67 55 57 59 50 59" stroke="#b61e3a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,

    star: () => `<polygon points="${starPoints(50, 54, 42, 20)}" fill="#ffd23f" stroke-linejoin="round" stroke-width="5"/>${face(50, 56, 0.95)}`,

    moon: () => `
      <path d="M64 10 C35 12 18 33 20 55 C22 78 43 92 67 90 C79 89 88 82 92 73 C72 77 51 66 47 47 C44 31 51 17 64 10Z" fill="#ffe08a"/>
      <circle cx="58" cy="78" r="3.5" fill="#f6c453" stroke="none"/><circle cx="30" cy="40" r="2.5" fill="#f6c453" stroke="none"/>
      ${face(36, 58, 0.8, { sleepy: true })}
      <path d="${sparkle(84, 22, 9)}" fill="#fff3b0"/>`,

    sun: () => {
      let rays = '';
      for (let k = 0; k < 8; k++) {
        const [x1, y1] = polar(50, 50, 32, k * 45 + 22.5), [x2, y2] = polar(50, 50, 44, k * 45 + 22.5);
        rays += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#ff9f1c" stroke-width="7" stroke-linecap="round"/>`;
      }
      return `${rays}<circle cx="50" cy="50" r="25" fill="#ffc94a"/>${face(50, 51, 0.9)}`;
    },

    sparkles: () => `
      <path d="${sparkle(42, 54, 32)}" fill="#ffd23f"/>
      <path d="${sparkle(77, 23, 15)}" fill="#fff0a8"/>
      <path d="${sparkle(78, 76, 11)}" fill="#ff8fab"/>`,

    cake: () => `
      <ellipse cx="50" cy="87" rx="42" ry="7" fill="#ffffff"/>
      <rect x="14" y="56" width="72" height="29" rx="7" fill="#ffb3c6"/>
      <path d="M14 63 Q14 56 21 56 L79 56 Q86 56 86 63 L86 66 Q82 71 78 66 Q74 61 69 68 Q65 74 61 67 Q57 61 52 68 Q47 75 43 67 Q39 61 34 68 Q29 74 25 66 Q21 61 18 67 Q15 70 14 66Z" fill="#fff"/>
      <rect x="26" y="34" width="48" height="24" rx="7" fill="#ff8fab"/>
      <path d="M26 41 Q26 34 33 34 L67 34 Q74 34 74 41 L74 44 Q70 49 67 44 Q64 40 60 46 Q57 51 54 45 Q51 41 47 45 Q43 50 40 44 Q37 40 33 46 Q29 50 26 44Z" fill="#fff"/>
      <rect x="45.5" y="15" width="9" height="20" rx="3" fill="#a0c4ff"/>
      <path d="M50 3 C55 9 56 13 50 15 C44 13 45 9 50 3Z" fill="#ffb703"/>
      <g stroke="none"><circle cx="30" cy="76" r="2.2" fill="#ffd23f"/><circle cx="46" cy="79" r="2.2" fill="#7bdff2"/><circle cx="62" cy="76" r="2.2" fill="#b892ff"/><circle cx="74" cy="80" r="2.2" fill="#ffd23f"/></g>`,

    kiss: () => `
      <path d="M8 52 C24 54 38 52 50 54 C62 52 76 54 92 52 C84 70 67 78 50 78 C33 78 16 70 8 52Z" fill="#ff4d6d"/>
      <path d="M8 52 C18 38 29 28 40 30 C45 31 48 34 50 37 C52 34 55 31 60 30 C71 28 82 38 92 52 C76 54 62 52 50 54 C38 52 24 54 8 52Z" fill="#d62246"/>
      <path d="M34 64 C40 68 46 69 52 68" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`,

    flower: () => {
      let petals = '';
      for (let k = 0; k < 8; k++) petals += `<ellipse cx="50" cy="27" rx="11" ry="19" fill="${k % 2 ? '#ffc8dd' : '#ffafcc'}" transform="rotate(${k * 45} 50 50)"/>`;
      return `${petals}<circle cx="50" cy="50" r="16" fill="#ffd23f"/>${face(50, 51, 0.62)}`;
    },

    cloud: () => `
      <path d="M26 74 C13 74 7 63 11 54 C14 47 21 44 28 46 C29 33 40 25 52 28 C60 30 65 36 66 42 C73 38 83 41 87 50 C93 53 95 62 91 68 C88 72 83 74 77 74Z" fill="#e3eeff"/>
      ${face(51, 58, 0.95)}`,

    letter: () => `
      <rect x="10" y="24" width="80" height="56" rx="7" fill="#fff4e0"/>
      <path d="M12 77 L40 54 M88 77 L60 54" stroke="${LINE}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M11 28 L50 58 L89 28" fill="#ffe3c2" stroke-linejoin="round"/>
      <g transform="translate(39 46) scale(.22)"><path d="${HEART}" fill="#ff4d6d" stroke-width="12"/></g>`,

    bow: () => `
      <path d="M46 54 L32 86 L41 83 L46 92 L54 57Z" fill="#ff6b9a" stroke-linejoin="round"/>
      <path d="M54 54 L68 86 L59 83 L54 92 L46 57Z" fill="#ff6b9a" stroke-linejoin="round"/>
      <path d="M50 49 C35 28 10 28 10 46 C10 64 35 64 50 52Z" fill="#ff8fb4"/>
      <path d="M50 49 C65 28 90 28 90 46 C90 64 65 64 50 52Z" fill="#ff8fb4"/>
      <path d="M44 48 C34 40 22 39 20 46 M56 48 C66 40 78 39 80 46" stroke="#e0457b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="42" y="40" width="16" height="19" rx="6" fill="#e0457b"/>`,

    bear: () => `
      <circle cx="24" cy="28" r="13" fill="#c68b59"/><circle cx="76" cy="28" r="13" fill="#c68b59"/>
      <circle cx="24" cy="28" r="6" fill="#eab88d" stroke="none"/><circle cx="76" cy="28" r="6" fill="#eab88d" stroke="none"/>
      <circle cx="50" cy="55" r="35" fill="#c68b59"/>
      <ellipse cx="50" cy="66" rx="16" ry="12" fill="#f3d5b5"/>
      <ellipse cx="50" cy="60" rx="5.5" ry="4" fill="${LINE}"/>
      <path d="M50 63 L50 67 M44 68 Q50 74 56 68" stroke="${LINE}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="49" r="3.8" fill="${LINE}" stroke="none"/><circle cx="63" cy="49" r="3.8" fill="${LINE}" stroke="none"/>
      <circle cx="38.2" cy="47.8" r="1.2" fill="#fff" stroke="none"/><circle cx="64.2" cy="47.8" r="1.2" fill="#fff" stroke="none"/>
      <ellipse cx="27" cy="62" rx="5" ry="3" fill="#ff7aa2" opacity=".55" stroke="none"/><ellipse cx="73" cy="62" rx="5" ry="3" fill="#ff7aa2" opacity=".55" stroke="none"/>`,

    balloon: () => `
      <path d="M50 76 C44 84 57 88 50 97" stroke="${LINE}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M46 78 L50 70 L54 78Z" fill="#e63950" stroke-linejoin="round"/>
      <ellipse cx="50" cy="40" rx="29" ry="33" fill="#ff5d8f"/>
      <path d="M33 30 C34 22 39 17 45 15" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`,

    butterfly: () => `
      <g>
        <path d="M50 50 C40 26 15 16 10 31 C6 46 27 55 50 53Z" fill="#c77dff"/>
        <path d="M50 54 C34 56 19 67 25 80 C31 90 46 74 50 58Z" fill="#ff8fab"/>
        <circle cx="26" cy="34" r="4" fill="#fff" stroke="none" opacity=".8"/><circle cx="33" cy="72" r="3" fill="#fff" stroke="none" opacity=".8"/>
      </g>
      <g transform="translate(100 0) scale(-1 1)">
        <path d="M50 50 C40 26 15 16 10 31 C6 46 27 55 50 53Z" fill="#c77dff"/>
        <path d="M50 54 C34 56 19 67 25 80 C31 90 46 74 50 58Z" fill="#ff8fab"/>
        <circle cx="26" cy="34" r="4" fill="#fff" stroke="none" opacity=".8"/><circle cx="33" cy="72" r="3" fill="#fff" stroke="none" opacity=".8"/>
      </g>
      <path d="M48 36 C44 26 40 20 34 17 M52 36 C56 26 60 20 66 17" stroke="${LINE}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="50" cy="55" rx="5" ry="20" fill="#5a2d4a"/>`,

    ring: () => `
      <circle cx="50" cy="64" r="25" fill="none" stroke="${LINE}" stroke-width="13"/>
      <circle cx="50" cy="64" r="25" fill="none" stroke="#f4c542" stroke-width="8" />
      <path d="M36 28 L43 18 L57 18 L64 28 L50 46Z" fill="#bde0fe" stroke-linejoin="round"/>
      <path d="M36 28 H64 M43 18 L47 28 L50 46 M57 18 L53 28 L50 46" stroke="${LINE}" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <path d="${sparkle(78, 18, 8)}" fill="#fff3b0"/>`,

    music: () => `
      <path d="M38 70 L38 26 L80 16 L80 60" stroke="${LINE}" stroke-width="12" fill="none" stroke-linejoin="round"/>
      <path d="M38 70 L38 26 L80 16 L80 60" stroke="#9d4edd" stroke-width="6" fill="none" stroke-linejoin="round"/>
      <path d="M38 26 L80 16 L80 28 L38 38Z" fill="#9d4edd" stroke-linejoin="round"/>
      <ellipse cx="29" cy="72" rx="12" ry="9" fill="#9d4edd" transform="rotate(-20 29 72)"/>
      <ellipse cx="71" cy="62" rx="12" ry="9" fill="#9d4edd" transform="rotate(-20 71 62)"/>`,

    bandaid: () => `
      <g transform="rotate(-35 50 50)">
        <rect x="8" y="33" width="84" height="34" rx="17" fill="#f6c8a4"/>
        <rect x="35" y="35" width="30" height="30" rx="5" fill="#fbe5d3"/>
        <g fill="#d9a27c" stroke="none"><circle cx="18" cy="44" r="1.8"/><circle cx="24" cy="54" r="1.8"/><circle cx="18" cy="58" r="1.8"/><circle cx="76" cy="44" r="1.8"/><circle cx="82" cy="54" r="1.8"/><circle cx="76" cy="58" r="1.8"/></g>
        <g transform="translate(40.5 40.5) scale(.19)"><path d="${HEART}" fill="#ff6b9a" stroke-width="13"/></g>
      </g>`,

    coffee: () => `
      <path d="M38 26 C34 20 42 16 38 9 M50 26 C46 20 54 16 50 9 M62 26 C58 20 66 16 62 9" stroke="#c9a0a0" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M72 46 C88 46 88 72 70 72" stroke="${LINE}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M72 46 C88 46 88 72 70 72" stroke="#ffc2d4" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M20 36 H76 V70 C76 81 67 88 56 88 H40 C29 88 20 81 20 70Z" fill="#ffc2d4"/>
      <ellipse cx="48" cy="37" rx="27" ry="5" fill="#8b5a3c"/>
      <g transform="translate(37 52) scale(.22)"><path d="${HEART}" fill="#ff4d6d" stroke-width="12"/></g>`,
  };

  const ALIASES = {
    love: 'heart', hearts2: 'hearts', roses: 'rose', stars: 'star', sparkle: 'sparkles', glitter: 'sparkles',
    lips: 'kiss', kisses: 'kiss', flowers: 'flower', daisy: 'flower', teddy: 'bear', teddybear: 'bear',
    envelope: 'letter', mail: 'letter', ribbon: 'bow', note: 'music', notes: 'music', bandage: 'bandaid',
    mug: 'coffee', cafe: 'coffee', birthday: 'cake',
  };

  const NAMES = Object.keys(S);
  const cache = {};
  const svgFor = (name) => (cache[name] ||= `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="${LINE}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${S[name]()}</svg>`);

  function resolve(spec) {
    const raw = String(spec == null ? '' : spec).trim();
    const key = raw.toLowerCase().replace(/[\s_-]+/g, '');
    if (S[key]) return { kind: 'svg', name: key };
    if (ALIASES[key]) return { kind: 'svg', name: ALIASES[key] };
    if (/[\/\\]|\.(png|jpe?g|gif|webp|svg|avif)$/i.test(raw)) return { kind: 'img', src: raw };
    if (raw && /[^\x00-\x7F]/.test(raw)) return { kind: 'emoji', text: raw };
    if (raw) console.warn(`[Roses] Unknown sticker "${raw}", using a heart instead. Options: ${NAMES.join(', ')}`);
    return { kind: 'svg', name: 'heart' };
  }

  /** Returns a <span class="stk ..."> element holding the sticker art. */
  function render(spec) {
    const r = resolve(spec);
    const el = document.createElement('span');
    el.className = 'stk stk-' + r.kind;
    if (r.kind === 'svg') el.innerHTML = svgFor(r.name);
    else if (r.kind === 'img') {
      const img = new Image();
      img.alt = '';
      img.decoding = 'async';
      img.src = r.src;
      el.appendChild(img);
    } else el.textContent = r.text;
    return el;
  }

  R.stickers = { render, resolve, names: NAMES, svg: (name) => svgFor(resolve(name).name) };
})();
