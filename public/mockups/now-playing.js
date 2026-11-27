// Mockup version of /now-playing.js. Same polling, but it renders the art
// and track into separate elements so the header can lay them out, and
// fades the track in when it changes.
const POLL_INTERVAL_MS = 15_000;

const root = document.getElementById('now-playing');
const art = root.querySelector('.playing__art');
const track = root.querySelector('.playing__track');
const calm = matchMedia('(prefers-reduced-motion: reduce)');
let last;

const render = (data) => {
  const playing = Boolean(data?.playing);
  const text = playing ? `${data.artist}, ${data.album}, ${data.track}` : 'Nothing right now...';
  const image = playing ? data.image : null;
  if (text === last) return;
  last = text;

  art.replaceChildren();
  if (image) {
    const img = document.createElement('img');
    img.src = image;
    img.alt = data.album;
    art.append(img);
  }
  root.classList.toggle('playing--art', Boolean(image));
  track.textContent = text;

  if (!calm.matches) {
    for (const el of [art, track]) {
      el.animate(
        [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }],
        { duration: 300, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      );
    }
  }
};

const update = async () => {
  try {
    const res = await fetch('/api/now-playing');
    render(res.ok ? await res.json() : null);
  } catch {
    render(null);
  }
};

update();

setInterval(() => {
  if (document.visibilityState === 'visible') {
    update();
  }
}, POLL_INTERVAL_MS);
