// Get external content, utilities
import initModals from './modal.js';

// Close popovers on Esc
import initpopovers from './popover.js';

// Drag to scroll
import initDragToScroll from './drag-scroll.js';

// Toggle password input visibility
import { initPasswordToggles } from './form.js';

// Toggle search input in header
import initSearchToggleHeader from './search-toggle.js';

import initDrawer from './drawer.js';

document.addEventListener('DOMContentLoaded', () => {
  initpopovers();
  initDrawer();
  initModals();
  initDragToScroll();
  initPasswordToggles();
  initSearchToggleHeader();
});
