// assets/js/markets.js

import * as DOMElements from './markets/dom.js';
import * as marketState from './markets/state.js'; // Contains 'state' object, 'currentFilterState', setters, etc.
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
  ALL_COLUMNS_CONFIG, // Used for default colspan in error case
} from './table/columns.js';

import {
  prepareAndFetchChartData,
  updateTimeframeOptions,
  handlePeriodChange,
  handleTimeframeChange,
} from './chart/ui.js';

/**
 * Инициализация приложения "Рынки".
 * Настраивает начальное состояние, загружает данные, устанавливает обработчики событий.
 * @async
 */
async function initializeApp() {
  try {
    initTranslations();

    // marketState.currentFilterState is a direct export, this is correct.
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

    await marketState.loadCryptoMeta(); // loadCryptoMeta is a direct export and handles internal state.

    const initialCheckedPeriod = DOMElements.periodRadioButtons.find(
      (r) => r.checked
    );
    if (initialCheckedPeriod) {
      marketState.setCurrentChartPeriod(initialCheckedPeriod.value); // Setter is fine
    } else if (DOMElements.periodRadioButtons.length > 0) {
      DOMElements.periodRadioButtons[0].checked = true;
      marketState.setCurrentChartPeriod(
        // Setter is fine
        DOMElements.periodRadioButtons[0].value
      );
    }
    // updateTimeframeOptions expects the period value.
    // Reading marketState.state.currentChartPeriod to pass to updateTimeframeOptions.
    updateTimeframeOptions(marketState.state.currentChartPeriod);

    const initialCheckedTimeframe = DOMElements.timeframeRadioButtons.find(
      (r) => r.checked
    );
    if (initialCheckedTimeframe) {
      marketState.setCurrentChartTimeframe(initialCheckedTimeframe.value); // Setter is fine
    }
    // updateTimeframeOptions should handle the state if current selection is invalid.

    DOMElements.periodRadioButtons.forEach((radio) =>
      radio.addEventListener('change', handlePeriodChange)
    );
    DOMElements.timeframeRadioButtons.forEach((radio) =>
      radio.addEventListener('change', handleTimeframeChange)
    );

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
    // marketState.setUpdateIntervalId is a setter, this is fine.
    marketState.setUpdateIntervalId(
      setInterval(fetchData, REFRESH_INTERVAL_MS)
    );

    updateFilterCountBadge();
    announceUpdate(t('tableLoading', 'Table loading.'));

    if (DOMElements.tableBody) {
      DOMElements.tableBody.addEventListener('click', (event) => {
        const chartButton = event.target.closest(
          '[data-role="drawer-toggle"][data-target="drawer-chart"]'
        );
        if (chartButton) {
          prepareAndFetchChartData(chartButton);
        }
      });
    }

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
    marketState.setIsLoading(false); // Setter is fine
  }
}

document.addEventListener('DOMContentLoaded', initializeApp);
