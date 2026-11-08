// Polls /api/now-playing and renders the current Spotify track.
// The API response is cached at the edge, so polling more often
// than this would just return the same answer.
const POLL_INTERVAL_MS = 15_000;

const root = document.getElementById('now-playing');
const output = root.querySelector('.now-playing__rendered');

const render = (data) => {
  output.replaceChildren();

  const playing = Boolean(data?.playing);

  root.classList.add('now-playing--loaded');
  root.classList.toggle('now-playing--song-playing', playing);

  if (!playing) {
    output.textContent = 'Nothing right now...';
    return;
  }

  if (data.image) {
    const img = document.createElement('img');
    img.className = 'now-playing__img';
    img.src = data.image;
    img.alt = data.album;
    output.append(img);
  }

  output.append(`${data.artist}, ${data.album}, ${data.track}`);
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
