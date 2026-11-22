// Pairs a writing link on the home page with the title of the post it
// opens, so the browser's page transition animates one into the other.
// The post's title carries the name in CSS. This script gives the same
// name to the matching link: on the way out to a post, and on the way
// back from one. It loads without defer, because pagereveal fires before
// the first render.

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

// Arriving back on the home page from a post.
window.addEventListener('pagereveal', (event) => {
  const from = window.navigation?.activation?.from?.url;

  if (!event.viewTransition || !from || !isPost(from)) {
    return;
  }

  const link = linkTo(from);

  if (link) {
    nameUntilDone(link, event.viewTransition);
  }
});
