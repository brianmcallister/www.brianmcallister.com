// Pairs a writing link on the home page with the title of the post it
// opens, so the browser's page transition animates the link into the
// title. The post's title carries the name in CSS, and this script gives
// the same name to the clicked link as the home page is left. Coming
// back, nothing is paired, so the title simply fades with the page.

const TITLE = 'post-title';

const isPost = (url) => new URL(url).pathname.startsWith('/writing/');

const linkTo = (url) => {
  const { pathname } = new URL(url);

  return [...document.querySelectorAll('a[href^="/writing/"]')].find(
    (link) => new URL(link.href).pathname === pathname,
  );
};

const nameUntilDone = (link, transition) => {
  link.style.viewTransitionName = TITLE;
  transition.finished.finally(() => {
    link.style.viewTransitionName = '';
  });
};

// Leaving the home page for a post.
window.addEventListener('pageswap', (event) => {
  const to = event.activation?.entry?.url;

  if (!event.viewTransition || !to || !isPost(to)) {
    return;
  }

  const link = linkTo(to);

  if (link) {
    nameUntilDone(link, event.viewTransition);
  }
});
