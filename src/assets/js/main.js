// Get external content, utilities
import initModals from './ui/modal.js';

// Close popovers on Esc
import initPopovers from './ui/popover.js';

// Drag to scroll
import initDragToScroll from './ui/drag-scroll.js';

// Toggle password input visibility
import { initPasswordToggles } from './ui/form.js';

// Toggle search input in header
import initSearchToggleHeader from './ui/search-toggle.js';

import initDrawer from './ui/drawer.js';

import initTabs from './ui/tabs.js';
import initTooltipsDelay from './ui/tooltip.js';
import initProfilePage from './pages/profile.js';

document.addEventListener('DOMContentLoaded', () => {
  initDragToScroll();
  initDrawer();
  initModals();
  initPasswordToggles();
  initSearchToggleHeader();
  initTabs();
  initPopovers();
  initTooltipsDelay();
  initProfilePage();
});
