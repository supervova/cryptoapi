// assets/js/markets/dom.js

// Таблица
export const loadingRow = document.getElementById('loading-row');
export const scrollContainer = document.getElementById(
  'virtual-scroll-container'
);
export const table = document.getElementById('crypto-table');
export const tableBody = document.getElementById('crypto-table-body');
export const tableColGroup = table?.querySelector('colgroup');
export const tableHead = table?.querySelector('thead'); // table может быть null, если DOM не загружен

// Экранный диктор
export const screenReaderAnnouncer = document.getElementById(
  'screen-reader-announcement'
);

// Фильтры
export const drawerFilter = document.getElementById('drawer-filter');
export const filtersForm = document.getElementById('filters-form');
export const filterColumnsList = document.getElementById('filter-columns-list');
export const filterToggleButton = document.querySelector(
  '[data-target="drawer-filter"]'
);

// Массив кнопок сортировки, заполняется через generateTableHeadHtml и используется в handleSortClick
export const sortButtons = []; // Это нормально, мутируем содержимое, а не ссылку

/**
 * Установка кнопок сортировки.
 * Заменяет содержимое массива sortButtons новыми кнопками.
 * @param {HTMLElement[]} buttons - Массив элементов кнопок сортировки.
 */
export function setSortButtons(buttons) {
  // Очищаем массив и добавляем новые кнопки, сохраняя ссылку на исходный массив.
  sortButtons.length = 0;
  sortButtons.push(...buttons);
}
