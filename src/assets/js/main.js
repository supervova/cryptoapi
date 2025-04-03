// Get external content, utilities
import initModals from './modal.js';

// Close popovers on Esc
import initpopovers from './popover.js';

// Drag to scroll
import initDragToScroll from './drag-scroll.js';

// Toggle password input visibility
import { initPasswordToggles } from './form.js';

// eslint-disable-next-line no-unused-vars
import { showToast /* , hideToast */ } from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
  initpopovers();
  initModals();
  initDragToScroll();
  initPasswordToggles();
});
