// Get external content, utilities
import initModals from './modal.js';

// Close popovers on Esc
import initpopovers from './popover.js';

// Horizontal scroll with wheel
import { initHorizontalScroll } from './scroller-row.js';

document.addEventListener('DOMContentLoaded', () => {
  initpopovers();
  initModals();
  initHorizontalScroll('.e-section__scroller', {
    wheelScroll: true, // Включаем прокрутку колесиком мыши
    showIndicators: false, // Показываем индикаторы прокрутки
    scrollAmount: 300, // Величина прокрутки в пикселях
  });
});
