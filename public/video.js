// Swaps a video's still for YouTube's player when the still is pressed.
// The player loads hidden over the still and fades in once it's ready,
// so nothing flashes or jumps. Without this script, the still is a
// plain link to the video on YouTube.

for (const poster of document.querySelectorAll('.video__poster')) {
  poster.addEventListener('click', (event) => {
    event.preventDefault();

    if (poster.classList.contains('video__poster--loading')) {
      return;
    }

    const { videoId, videoTitle } = poster.dataset;
    const player = document.createElement('iframe');

    player.className = 'video__player';
    player.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
    player.title = videoTitle;
    player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    player.allowFullscreen = true;
    player.referrerPolicy = 'strict-origin-when-cross-origin';

    player.addEventListener(
      'load',
      () => {
        player.classList.add('video__player--ready');
        // The still is now covered, so take it out of the tab order and
        // move focus into the player for keyboard users.
        poster.tabIndex = -1;
        poster.setAttribute('aria-hidden', 'true');
        player.focus();
      },
      { once: true },
    );

    poster.classList.add('video__poster--loading');
    poster.after(player);
  });
}
