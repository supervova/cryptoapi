// assets/js/markets.js

import * as DOMElements from './markets/dom.js';
import * as marketState from './markets/state.js';
import t, { initTranslations } from './markets/translate.js';
import { IS_DEVELOPMENT, REFRESH_INTERVAL_MS } from './markets/config.js';
import {
  applyFiltersAndDraw,
  updateFilterCountBadge,
} from './table/sort-filter.js';

import { cleanup, throttle, announceUpdate } from './markets/utils.js';
import { fetchData } from './markets/api.js';
import { generateTableHeadHtml, patchTableBody } from './table/render.js';

import {
  populateColumnCheckboxes,
  ALL_COLUMNS_CONFIG,
} from './table/columns.js';

/**
 * Инициализация приложения "Рынки".
 * Настраивает начальное состояние, загружает данные, устанавливает обработчики событий для таблицы.
 * @async
 */
async function initializeApp() {
  try {
    initTranslations();

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

    await marketState.loadCryptoMeta();

    if (DOMElements.filtersForm) {
      DOMElements.filtersForm.addEventListener('submit', (event) => {
        event.preventDefault();
        applyFiltersAndDraw();
      });
    }

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
      ALL_COLUMNS_CONFIG.filter((c) => c.visible).length || // Используем ALL_COLUMNS_CONFIG для определения количества видимых по умолчанию
      7; // Запасное значение, если ALL_COLUMNS_CONFIG пуст или все невидимы

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
