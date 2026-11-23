// Lays a patchwork of squares, cut from the home page's photo, across the
// top of a post. Columns behind the text stay light and always stop above
// the title. Columns out toward the page's edges run deeper, to a little
// over two-fifths of the way down the screen, turning grayer and then darker toward
// their bottoms, and the bottom edge frays into stray squares and gaps.
// The squares appear one by one, roughly row by row from the top, each
// at its final color in a single step.
//
// The layout is seeded from the post's address, so a post looks the same
// on every visit. The tiles come from /patchwork.webp, which
// scripts/make-patchwork.py makes; the groups below must match it.

const SHEET = '/patchwork.webp';
const SHEET_COLUMNS = 12;
const SHEET_TILE = 128;
const GROUPS = { light: [0, 48], mid: [48, 24], dark: [72, 12] }; // First tile, count.

const ROW_DELAY = 40; // Milliseconds between rows starting to appear.
const JITTER = 160; // Up to this much extra delay per square, at random.
// A very short fade softens each square's arrival. Longer fades show a
// square lighter, while it's partly see-through, before its true color.
const FADE = 70;

const canvas = document.querySelector('.patchwork');
const page = canvas?.parentElement;
const text = document.querySelector('.post');
const title = document.querySelector('.post__title');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// A small seeded random number generator, so layouts are repeatable.
const seededRandom = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const hash = (string) => [...string].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);

const pick = (random, [first, count]) => first + Math.floor(random() * count);

// Works out every square's place, tile and fade-in delay for the page's
// current width.
const layout = () => {
  const seed = hash(location.pathname);
  const width = page.clientWidth;
  const size = width < 600 ? 28 : 40;
  const pageBox = page.getBoundingClientRect();
  const textBox = text.getBoundingClientRect();
  const textLeft = textBox.left - pageBox.left - 12;
  const textRight = textBox.right - pageBox.left + 12;
  const sideWidth = Math.max(1, textLeft);
  const screen = window.innerHeight;
  // Behind the text, nothing reaches the title. At the sides, nothing goes
  // lower than a little over two-fifths of the way down the screen.
  const titleTop = title.getBoundingClientRect().top - pageBox.top;
  const lastRowBehindText = Math.floor((titleTop - 8) / size) - 1;
  const lastRowAtSides = Math.max(2, Math.floor((screen * 0.43) / size) - 1);

  // Columns are laid out from the page's center, so the grid is symmetric.
  const columns = Math.ceil(width / size / 2) * 2 + 2;
  const firstX = width / 2 - (columns / 2) * size;
  const squares = [];

  for (let column = 0; column < columns; column++) {
    // Each column draws from its own sequence, keyed to its place relative
    // to the page's center, so a small change in width only nudges the
    // patchwork instead of reshuffling it.
    const random = seededRandom(seed + Math.imul(column - columns / 2, 2654435761));
    const x = firstX + column * size;
    if (x + size <= 0 || x >= width) {
      continue;
    }
    const behindText = x + size > textLeft && x < textRight;
    // How far out toward the page's edge this column sits, from 0 at the
    // text to 1 at the edge.
    const out = behindText
      ? 0
      : Math.min(1, (x + size <= textLeft ? textLeft - (x + size) : x - textRight) / sideWidth);

    // The depth stays level across the middle, so the text doesn't look
    // fenced off, and only drops away near the page's edges.
    let depth;
    if (behindText) {
      depth = 1 + Math.floor(random() * 3);
    } else {
      const reach = (0.1 + 0.2 * out ** 2) * screen * (0.8 + random() * 0.4);
      depth = Math.max(2, Math.round(reach / size));
    }

    const rows = new Set();
    for (let row = 0; row < depth; row++) {
      rows.add(row);
    }

    // A ragged edge: stray squares below, each less likely than the last,
    // and the odd gap just above the edge.
    const strays = behindText ? 1 : 2;
    for (let k = 0, chance = behindText ? 0.3 : 0.6; k < strays; k++, chance *= 0.55) {
      if (random() < chance) {
        rows.add(depth + k + (random() < 0.3 ? 1 : 0));
      }
    }
    if (!behindText) {
      for (let row = Math.max(1, depth - 3); row < depth; row++) {
        if (random() < 0.18) {
          rows.delete(row);
        }
      }
    }

    for (const row of rows) {
      if (row > (behindText ? lastRowBehindText : lastRowAtSides)) {
        continue;
      }
      // Grayer and darker squares gather toward the bottom of the side
      // columns, darkest toward the page's edges. The top rows stay light.
      const down = row / depth;
      const dark = Math.min(0.6, Math.max(0, down - 0.5) * 1.4) * out;
      const mid = Math.min(0.8, Math.max(0, down - 0.15) * 0.9 + out * 0.25);
      const roll = random();
      const group = behindText ? 'light' : roll < dark ? 'dark' : roll < dark + mid ? 'mid' : 'light';

      squares.push({
        x,
        y: row * size,
        size,
        tile: pick(random, GROUPS[group]),
        delay: row * ROW_DELAY + random() * JITTER,
      });
    }
  }

  return squares;
};

const draw = (sheet, squares, elapsed) => {
  const ratio = window.devicePixelRatio || 1;
  const height = Math.max(...squares.map((s) => s.y + s.size));
  const width = page.clientWidth;

  if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.height = `${height}px`;
  }

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  let done = true;

  for (const square of squares) {
    const alpha = Math.min(1, Math.max(0, (elapsed - square.delay) / FADE));
    if (alpha < 1) {
      done = false;
    }
    if (alpha === 0) {
      continue;
    }
    // Snap to whole device pixels so neighboring squares meet without
    // hairline gaps.
    const left = Math.round(square.x * ratio);
    const top = Math.round(square.y * ratio);
    const right = Math.round((square.x + square.size) * ratio);
    const bottom = Math.round((square.y + square.size) * ratio);
    const column = square.tile % SHEET_COLUMNS;
    const row = Math.floor(square.tile / SHEET_COLUMNS);

    context.globalAlpha = alpha;
    context.drawImage(
      sheet,
      column * SHEET_TILE,
      row * SHEET_TILE,
      SHEET_TILE,
      SHEET_TILE,
      left,
      top,
      right - left,
      bottom - top,
    );
  }

  return done;
};

const start = async () => {
  const sheet = new Image();
  sheet.src = SHEET;
  await sheet.decode();

  let squares = layout();
  let animating = !reduceMotion.matches;

  if (animating) {
    const began = performance.now();
    const frame = (now) => {
      if (draw(sheet, squares, now - began)) {
        animating = false;
      } else {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  } else {
    draw(sheet, squares, Infinity);
  }

  // When the page's width changes, lay the squares out again. During the
  // animation, the next frame picks up the new layout, so nothing is drawn
  // twice; afterwards, it's redrawn at once.
  let lastWidth = page.clientWidth;
  new ResizeObserver(() => {
    if (page.clientWidth !== lastWidth) {
      lastWidth = page.clientWidth;
      squares = layout();
      if (!animating) {
        draw(sheet, squares, Infinity);
      }
    }
  }).observe(page);
};

if (canvas && text && title) {
  start().catch(() => {
    // Without the tiles, the page is simply plain.
  });
}
