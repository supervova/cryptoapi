// assets/js/markets.js
import * as DOMElements from './markets/dom.js';
import * as marketState from './markets/state.js';
import t, { initTranslations } from './markets/translate.js';
import { IS_DEVELOPMENT, REFRESH_INTERVAL_MS } from './markets/config.js';
import {
  applyFiltersAndDraw,
  applySortAndFilter,
  handleSortClick,
  updateFilterCountBadge,
} from './table/sort-filter.js';

import { cleanup, throttle, announceUpdate } from './markets/utils.js';
import { fetchData } from './markets/api.js';
import { generateTableHeadHtml, patchTableBody } from './table/render.js';

import {
  populateColumnCheckboxes,
  ALL_COLUMNS_CONFIG,
  translateColumnHeaders,
} from './table/columns.js';

/**
 * Обрабатывает клик по строке таблицы для перехода на страницу актива.
 * @param {MouseEvent} event
 */
function handleRowClick(event) {
  const row = event.target.closest('tr.is-clickable');
  if (row && row.dataset.url) {
    window.location.href = row.dataset.url;
  }
}

/**
 * Обрабатывает нажатие клавиши Enter на строке для перехода.
 * @param {KeyboardEvent} event
 */
function handleRowKeydown(event) {
  if (event.key !== 'Enter') {
    return;
  }
  const row = event.target.closest('tr.is-clickable');
  if (row && row.dataset.url) {
    window.location.href = row.dataset.url;
  }
}

/**
 * Инициализация приложения "Рынки".
 * @async
 */
async function initializeApp() {
  try {
    // 1. Загружаем переводы
    initTranslations();

    // 2. Явно переводим заголовки колонок, используя загруженный словарь
    translateColumnHeaders(t);

    marketState.currentFilterState.visibleColumnKeys =
      ALL_COLUMNS_CONFIG.filter((c) => c.visible).map((c) => c.key);

    if (
      !DOMElements.table ||
      !DOMElements.scrollContainer ||
      !DOMElements.tableBody ||
      !DOMElements.tableHead
    ) {
      throw new Error('Required table DOM elements not found');
    }

    DOMElements.tableBody.addEventListener('click', handleRowClick);
    DOMElements.tableBody.addEventListener('keydown', handleRowKeydown);

    await marketState.loadCryptoMeta();

    if (DOMElements.filtersForm) {
      DOMElements.filtersForm.addEventListener('submit', (event) => {
        event.preventDefault();
        applyFiltersAndDraw();
      });
    }

    // 3. Теперь, когда заголовки переведены, генерируем элементы интерфейса
    populateColumnCheckboxes();
    generateTableHeadHtml();

    const throttledPatch = throttle(patchTableBody, 100);
    if (DOMElements.scrollContainer) {
      DOMElements.scrollContainer.addEventListener('scroll', throttledPatch);
    }

    fetchData();
    marketState.setUpdateIntervalId(
      setInterval(fetchData, REFRESH_INTERVAL_MS)
    );

    updateFilterCountBadge();
    announceUpdate(t('tableLoading', 'Table loading.'));

    window.addEventListener('unload', cleanup);
  } catch (error) {
    if (IS_DEVELOPMENT) console.error('Initialization failed:', error);

    const initialVisibleCols =
      ALL_COLUMNS_CONFIG.filter((c) => c.visible).length || 7;

    if (DOMElements.tableBody) {
      DOMElements.tableBody.innerHTML = `
        <tr><td class="table__cell is-empty-state is-error-state" colspan="${initialVisibleCols}">
          <p>${t('tableInitError', 'We couldn’t show the table. Something went wrong during setup.')} ${error.message}</p>
          <button class="e-btn is-text" onclick="location.reload()">${t('retry', 'Retry')}</button>
        </td></tr>`;
    } else {
      console.error(
        'Critical error: tableBody not found. Cannot display error state in table.',
        error
      );
    }
    if (DOMElements.table) DOMElements.table.setAttribute('aria-busy', 'false');
    marketState.setIsLoading(false);
  }
}

document.addEventListener('DOMContentLoaded', initializeApp);

document.addEventListener('meta:updated', () => applySortAndFilter(false));

document.addEventListener('table:sort-click', (e) => {
  handleSortClick(e.detail);
});

document.addEventListener('table:columns-updated', () => {
  generateTableHeadHtml();
  applySortAndFilter(false);
  updateFilterCountBadge();
});

document.addEventListener('table:visible-columns-changed', (e) => {
  marketState.currentFilterState.visibleColumnKeys = e.detail;
});
