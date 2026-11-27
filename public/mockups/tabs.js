// Switches between the homepage tab panels, with arrow key support.
const tabs = [...document.querySelectorAll('[role="tab"]')];

const select = (tab) => {
  for (const t of tabs) {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).classList.toggle('is-active', on);
  }
};

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
