// web/src/assets/js/ui/tabs.js
const initTabs = (root = document) => {
  const list = root.querySelector('[role="tablist"]');
  if (!list) return;
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[role="tab"]');
    if (!btn) return;
    const id = btn.getAttribute('data-target');
    list.querySelectorAll('[role="tab"]').forEach((b) => {
      const currentTab = b;
      currentTab.classList.toggle('is-active', b === btn);
      currentTab.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      currentTab.tabIndex = b === btn ? 0 : -1;
    });
    root.querySelectorAll('[role="tabpanel"]').forEach((p) => {
      const on = `#${p.id}` === id;
      p.toggleAttribute('hidden', !on);
      p.classList.toggle('is-hidden', !on);
    });
  });
};

export default initTabs;
