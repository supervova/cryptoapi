// assets/js/markets/dom.js

// Таблица
export const loadingRow = document.getElementById('loading-row');
export const scrollContainer = document.getElementById(
  'virtual-scroll-container'
);
export const table = document.getElementById('crypto-table');
export const tableBody = document.getElementById('crypto-table-body');
export const tableHead = table?.querySelector('thead');

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

// График
export const assetChartContainer = document.getElementById('asset-chart');
export const drawerChart = document.getElementById('drawer-chart');

// Заголовок графика
export const drawerChartIcon = drawerChart?.querySelector(
  '.e-asset-details__icon'
);
export const drawerChartIconFallback = drawerChart?.querySelector(
  '.e-asset-details__icon-fallback'
);
export const drawerChartTitleElements = drawerChart?.querySelectorAll(
  '.e-asset-details__title'
);
export const drawerChartSymbol = drawerChart?.querySelector(
  '.e-asset-details__symbol'
);
export const drawerChartPrice = drawerChart?.querySelector(
  '.e-asset-details__price'
);
export const drawerChartPriceChange = drawerChart?.querySelector(
  '.e-asset-details__price-change'
);
export const drawerChartOpen = drawerChart?.querySelector(
  '.e-asset-details__stats [data-stat="open"]'
);
export const drawerChartHigh = drawerChart?.querySelector(
  '.e-asset-details__stats [data-stat="max"]'
);
export const drawerChartLow = drawerChart?.querySelector(
  '.e-asset-details__stats [data-stat="min"]'
);

// Меню графика
export const drawerChartPeriodMenu = document.querySelector(
  '.e-asset-details__period details[data-role="popover"]:has(input[name="chart-period"])'
);
export const drawerChartTimeframeMenu = document.querySelector(
  '.e-asset-details__period details[data-role="popover"]:has(input[name="chart-timeframe"])'
);

export const periodRadioButtons = drawerChartPeriodMenu
  ? Array.from(
      drawerChartPeriodMenu.querySelectorAll('input[name="chart-period"]')
    )
  : [];
export const timeframeRadioButtons = drawerChartTimeframeMenu
  ? Array.from(
      drawerChartTimeframeMenu.querySelectorAll('input[name="chart-timeframe"]')
    )
  : [];

// Массив кнопок сортировки, заполняется через generateTableHeadHtml и используется в handleSortClick
export const sortButtons = [];

/**
 * Установка кнопок сортировки
 * Заменяет содержимое массива sortButtons новыми кнопками.
 * @param {HTMLElement[]} buttons - Массив элементов кнопок сортировки
 */
export function setSortButtons(buttons) {
  sortButtons.splice(0, sortButtons.length, ...buttons);
}
