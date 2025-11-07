// assets/js/table/sort-filter.js
import * as DOMElements from '../markets/dom.js';
import * as marketState from '../markets/state.js'; // Contains 'state' object, 'sortState', 'currentFilterState' and setters
import { calcChange, generateTableHeadHtml, patchTableBody } from './render.js';

import t from '../markets/translate.js';
import { ALL_COLUMNS_CONFIG, columnsConfig } from './columns.js'; // columnsConfig is used here
import { IS_DEVELOPMENT } from '../markets/config.js';
import { getNestedValue, announceUpdate } from '../markets/utils.js';

/**
 * Применение текущих фильтров и сортировки к данным активов.
 * Обновляет `sortedFilteredAssets` (через `marketState.setSortedFilteredAssets`) и перерисовывает тело таблицы.
 * @param {boolean} [isInitialLoadOrManualSortAction=true] - Флаг, указывающий на начальную загрузку или ручное действие сортировки (для сброса прокрутки).
 */
export function applySortAndFilter(isInitialLoadOrManualSortAction = true) {
  // Используем marketState.state.allAssets
  if (!Array.isArray(marketState.state.allAssets)) {
    if (IS_DEVELOPMENT)
      console.error(
        'marketState.state.allAssets is not an array. Value:',
        marketState.state.allAssets
      );
    // Если allAssets не массив, возможно, стоит инициализировать его как пустой массив или показать ошибку.
    // Для предотвращения дальнейших ошибок, можно вернуть, но это скроет проблему.
    // marketState.setAllAssets([]); // Осторожно: это может скрыть реальную проблему инициализации
    return;
  }

  // Используем marketState.state.allAssets
  const filteredData = marketState.state.allAssets.filter((asset) => {
    // marketState.currentFilterState используется напрямую, т.к. это отдельный экспорт
    if (
      marketState.currentFilterState.priceMin !== null &&
      (asset.price?.current === null ||
        parseFloat(asset.price.current) <
          marketState.currentFilterState.priceMin)
    ) {
      return false;
    }
    if (
      marketState.currentFilterState.priceMax !== null &&
      (asset.price?.current === null ||
        parseFloat(asset.price.current) >
          marketState.currentFilterState.priceMax)
    ) {
      return false;
    }

    const rsi7dConfig = ALL_COLUMNS_CONFIG.find((c) => c.key === 'rsi_7d');
    const rsiValue = rsi7dConfig
      ? getNestedValue(asset, rsi7dConfig.apiField)
      : null;
    if (
      marketState.currentFilterState.rsiMin !== null &&
      (rsiValue === null ||
        parseFloat(rsiValue) < marketState.currentFilterState.rsiMin)
    ) {
      return false;
    }
    if (
      marketState.currentFilterState.rsiMax !== null &&
      (rsiValue === null ||
        parseFloat(rsiValue) > marketState.currentFilterState.rsiMax)
    ) {
      return false;
    }

    if (
      marketState.currentFilterState.ratingMax !== null &&
      (asset.rating === null ||
        asset.rating > marketState.currentFilterState.ratingMax)
    ) {
      return false;
    }

    if (marketState.currentFilterState.risk) {
      let assetRisk = (asset.risk || '').toLowerCase();
      if (assetRisk === 'neutral') assetRisk = 'medium';
      if (assetRisk !== marketState.currentFilterState.risk) return false;
    }

    // ⇢ поиск по live-строке
    if (marketState.currentFilterState.searchTerm) {
      const term = marketState.currentFilterState.searchTerm;
      if (!`${asset.symbol} ${asset.name ?? ''}`.toLowerCase().includes(term)) {
        // ` // HACK: закрывающая обратная кавычка в литерале шаблона парсится, как открывающая
        return false;
      }
    }
    return true;
  });

  const dataToSort = [...filteredData];
  // marketState.sortState используется напрямую
  const sortConfig = columnsConfig.find(
    (c) => c.key === marketState.sortState.field
  );

  if (sortConfig && !sortConfig.visible) {
    marketState.sortState.field = 'asset'; // sortState - отдельный экспорт
    marketState.sortState.direction = 'asc';
    generateTableHeadHtml();
  }

  const currentSortConfig = columnsConfig.find(
    (c) => c.key === marketState.sortState.field // sortState - отдельный экспорт
  );
  const apiField = currentSortConfig?.apiField || marketState.sortState.field; // sortState - отдельный экспорт

  dataToSort.sort((a, b) => {
    let valA = getNestedValue(a, apiField);
    let valB = getNestedValue(b, apiField);

    // marketState.sortState используется напрямую
    if (marketState.sortState.field === 'asset') {
      valA = a.name?.toLowerCase() || '';
      valB = b.name?.toLowerCase() || '';
    } else if (marketState.sortState.field === 'change_24h') {
      const changeA = calcChange(a.price);
      const changeB = calcChange(b.price);
      valA =
        changeA ??
        (marketState.sortState.direction === 'asc' ? Infinity : -Infinity);
      valB =
        changeB ??
        (marketState.sortState.direction === 'asc' ? Infinity : -Infinity);
    } else {
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);
      if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
        valA = numA;
        valB = numB;
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
    }

    const aIsNull =
      valA === null ||
      valA === undefined ||
      valA === Infinity ||
      valA === -Infinity;
    const bIsNull =
      valB === null ||
      valB === undefined ||
      valB === Infinity ||
      valB === -Infinity;

    if (aIsNull && bIsNull) return 0;
    if (
      typeof valA === 'number' ||
      typeof valB === 'number' ||
      valA === Infinity ||
      valA === -Infinity ||
      valB === Infinity ||
      valB === -Infinity
    ) {
      // marketState.sortState используется напрямую
      if (aIsNull || Number.isNaN(valA))
        return marketState.sortState.direction === 'asc' ? 1 : -1;
      if (bIsNull || Number.isNaN(valB))
        return marketState.sortState.direction === 'asc' ? -1 : 1;
    }
    // marketState.sortState используется напрямую
    if (valA < valB) return marketState.sortState.direction === 'asc' ? -1 : 1;
    if (valA > valB) return marketState.sortState.direction === 'asc' ? 1 : -1;
    return 0;
  });

  marketState.setSortedFilteredAssets(dataToSort); // Setter

  if (isInitialLoadOrManualSortAction && DOMElements.scrollContainer) {
    DOMElements.scrollContainer.scrollTop = 0;
  }

  // The patchTableBody function is smart enough to handle loading/empty states.
  // We wrap it in requestAnimationFrame to ensure that any pending DOM updates,
  // like setting scrollTop, are processed before we attempt to render the table.
  // This prevents race conditions and rendering artifacts.
  requestAnimationFrame(patchTableBody);
}

export function handleSortClick(event) {
  const button = event.currentTarget;
  const field = button.dataset.sortField;

  let direction = 'asc';
  // marketState.sortState используется напрямую
  if (
    marketState.sortState.field === field &&
    marketState.sortState.direction === 'asc'
  ) {
    direction = 'desc';
  }

  marketState.sortState.field = field; // sortState - отдельный экспорт
  marketState.sortState.direction = direction;

  DOMElements.sortButtons.forEach((btn) => {
    const btnField = btn.dataset.sortField;
    if (btnField === field) {
      btn.classList.add('is-active');
      btn.classList.toggle('is-desc', direction === 'desc');
      btn.setAttribute(
        'aria-sort',
        direction === 'asc' ? 'ascending' : 'descending'
      );
    } else {
      btn.classList.remove('is-active', 'is-desc');
      btn.setAttribute('aria-sort', 'none');
    }
  });

  applySortAndFilter();
  const columnConfigItem = columnsConfig.find((c) => c.key === field); // columnsConfig is local module const
  const columnLabel = columnConfigItem ? columnConfigItem.label : field; // .label will call getter
  const directionLabel =
    direction === 'asc'
      ? t('ascending', 'ascending')
      : t('descending', 'descending');
  announceUpdate(
    `${t('tableSortedBy', 'Table sorted by')} ${columnLabel} ${directionLabel}`
  );
}

export function updateFilterCountBadge() {
  if (!DOMElements.filterToggleButton) return;
  let count = 0;
  // marketState.currentFilterState используется напрямую
  if (
    marketState.currentFilterState.priceMin !== null ||
    marketState.currentFilterState.priceMax !== null
  ) {
    count += 1;
  }
  if (
    marketState.currentFilterState.rsiMin !== null ||
    marketState.currentFilterState.rsiMax !== null
  ) {
    count += 1;
  }
  if (marketState.currentFilterState.ratingMax !== null) count += 1;
  if (marketState.currentFilterState.risk) count += 1;

  const defaultVisibleKeys = ALL_COLUMNS_CONFIG.filter((c) => c.visible).map(
    (c) => c.key
  );
  const currentVisibleKeys = columnsConfig // local module const
    .filter((c) => c.visible)
    .map((c) => c.key);
  if (
    JSON.stringify(defaultVisibleKeys.sort()) !==
    JSON.stringify(currentVisibleKeys.sort())
  ) {
    count += 1;
  }

  const iconHtml = DOMElements.filterToggleButton.querySelector('svg')
    ? DOMElements.filterToggleButton.querySelector('svg').outerHTML
    : '';
  DOMElements.filterToggleButton.innerHTML = `${iconHtml} ${t('Filters', 'Filters')} ${count > 0 ? count : ''}`;
}

export function applyFiltersAndDraw() {
  if (!DOMElements.filtersForm) return;
  // marketState.currentFilterState используется напрямую
  marketState.currentFilterState.priceMin =
    parseFloat(DOMElements.filtersForm.elements['filter-price-min'].value) ||
    null;
  marketState.currentFilterState.priceMax =
    parseFloat(DOMElements.filtersForm.elements['filter-price-max'].value) ||
    null;
  marketState.currentFilterState.rsiMin =
    parseFloat(DOMElements.filtersForm.elements['filter-rsi-min'].value) ||
    null;
  marketState.currentFilterState.rsiMax =
    parseFloat(DOMElements.filtersForm.elements['filter-rsi-max'].value) ||
    null;
  marketState.currentFilterState.ratingMax =
    parseFloat(DOMElements.filtersForm.elements['filter-rating-max'].value) ||
    null;
  marketState.currentFilterState.risk =
    DOMElements.filtersForm.elements['filter-risk'].value || '';

  if (
    marketState.currentFilterState.priceMin !== null &&
    marketState.currentFilterState.priceMax !== null &&
    marketState.currentFilterState.priceMin >
      marketState.currentFilterState.priceMax
  ) {
    [
      marketState.currentFilterState.priceMin,
      marketState.currentFilterState.priceMax,
    ] = [
      marketState.currentFilterState.priceMax,
      marketState.currentFilterState.priceMin,
    ];
    DOMElements.filtersForm.elements['filter-price-min'].value =
      marketState.currentFilterState.priceMin;
    DOMElements.filtersForm.elements['filter-price-max'].value =
      marketState.currentFilterState.priceMax;
  }
  if (
    marketState.currentFilterState.rsiMin !== null &&
    marketState.currentFilterState.rsiMax !== null &&
    marketState.currentFilterState.rsiMin >
      marketState.currentFilterState.rsiMax
  ) {
    [
      marketState.currentFilterState.rsiMin,
      marketState.currentFilterState.rsiMax,
    ] = [
      marketState.currentFilterState.rsiMax,
      marketState.currentFilterState.rsiMin,
    ];
    DOMElements.filtersForm.elements['filter-rsi-min'].value =
      marketState.currentFilterState.rsiMin;
    DOMElements.filtersForm.elements['filter-rsi-max'].value =
      marketState.currentFilterState.rsiMax;
  }

  applySortAndFilter(true);
  updateFilterCountBadge();
  if (DOMElements.drawerFilter && DOMElements.drawerFilter.close) {
    DOMElements.drawerFilter.close();
  }
}
