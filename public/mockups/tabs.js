// Switches between the homepage tab panels, with arrow key support. The
// underline slides to the selected tab, and the panel area eases to the
// new panel's height so the tabs glide instead of jumping.
const list = document.querySelector('[role="tablist"]');
const tabs = [...list.querySelectorAll('[role="tab"]')];
const indicator = list.querySelector('.tabs__indicator');
const panels = document.querySelector('.panels');
const panelFor = (tab) => document.getElementById(tab.getAttribute('aria-controls'));

const place = (tab) => {
  indicator.style.width = `${tab.offsetWidth}px`;
  indicator.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop + tab.offsetHeight}px)`;
  panels.style.height = `${panelFor(tab).offsetHeight}px`;
};

const select = (tab) => {
  for (const t of tabs) {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    panelFor(t).classList.toggle('is-active', on);
  }
  place(tab);
};

const current = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true');

for (const tab of tabs) {
  tab.addEventListener('click', () => select(tab));
  tab.addEventListener('keydown', (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    const next = tabs[(tabs.indexOf(tab) + step + tabs.length) % tabs.length];
    select(next);
    next.focus();
  });
}

// Place everything once without animating, then turn transitions on.
place(current());
document.fonts.ready.then(() => place(current()));
addEventListener('resize', () => place(current()));
requestAnimationFrame(() => requestAnimationFrame(() => list.parentElement.classList.add('is-ready')));
