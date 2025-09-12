// assets/js/table/columns.js
import * as DOMElements from '../markets/dom.js';
import {
  formatPrice,
  formatChange24h,
  formatRisk,
  formatNullable,
} from './formatting.js';

export const ALL_COLUMNS_CONFIG = [
  {
    key: 'watchlist',
    label: 'Watchlist',
    type: 'action',
    sortable: false,
    visible: false,
    canHide: false,
    apiField: 'watchlist',
  },
  {
    key: 'asset',
    label: 'Asset',
    type: 'text',
    sortable: true,
    apiField: 'symbol',
    visible: true,
    canHide: false,
  },
  {
    key: 'price',
    label: 'Price, $',
    type: 'num',
    sortable: true,
    apiField: 'price.current',
    formatter: formatPrice,
    visible: true,
    canHide: false,
  },
  {
    key: 'change_24h',
    label: 'Chg (24H), %',
    type: 'num',
    sortable: true,
    apiField: 'price',
    formatter: formatChange24h,
    visible: true,
    canHide: true,
  },
  {
    key: 'rating',
    label: 'Rating',
    type: 'num',
    sortable: true,
    apiField: 'rating',
    formatter: formatNullable,
    visible: true,
    canHide: true,
  },
  {
    key: 'risk',
    label: 'Risk',
    type: 'icon',
    sortable: false,
    apiField: 'risk',
    formatter: formatRisk,
    visible: true,
    canHide: true,
  },
  {
    key: 'trindx',
    label: 'TRINDX',
    type: 'num',
    sortable: true,
    apiField: 'TRINDX',
    formatter: formatNullable,
    visible: true,
    canHide: true,
  },
  {
    key: 'rsi_7d',
    label: 'RSI (7D)',
    type: 'num',
    sortable: true,
    apiField: 'RSI7',
    formatter: formatNullable,
    visible: true,
    canHide: true,
  },
  {
    key: 'rsi_30d',
    label: 'RSI (30D)',
    type: 'num',
    sortable: true,
    apiField: 'RSI30',
    formatter: formatNullable,
    visible: false,
    canHide: true,
  },
  {
    key: 'rsi_91d',
    label: 'RSI (91D)',
    type: 'num',
    sortable: true,
    apiField: 'RSI91',
    formatter: formatNullable,
    visible: false,
    canHide: true,
  },
  {
    key: 'rsi_182d',
    label: 'RSI (182D)',
    type: 'num',
    sortable: true,
    apiField: 'RSI182',
    formatter: formatNullable,
    visible: false,
    canHide: true,
  },
  {
    key: 'rsi_365d',
    label: 'RSI (365D)',
    type: 'num',
    sortable: true,
    apiField: 'RSI365',
    formatter: formatNullable,
    visible: false,
    canHide: true,
  },
  {
    key: 'rsi_1000d',
    label: 'RSI (1000D)',
    type: 'num',
    sortable: true,
    apiField: 'RSI1000',
    formatter: formatNullable,
    visible: false,
    canHide: true,
  },
  {
    key: 'market',
    label: 'Market',
    type: 'text',
    sortable: true,
    apiField: 'market',
    formatter: formatNullable,
    visible: false,
    canHide: true,
  },
];

export const columnsConfig = ALL_COLUMNS_CONFIG.map((col) => ({ ...col }));

/**
 * Инициализирует переведенные названия колонок после загрузки словаря.
 * @param {Function} t - Функция-переводчик.
 */
export function translateColumnHeaders(t) {
  columnsConfig.forEach((col) => {
    // Используем col.key для поиска перевода, а текущий col.label как fallback
    col.label = t(col.key, col.label);
  });
}

let visibleColumnsInternal = columnsConfig.filter((c) => c.visible);
let visibleColumnsCountInternal = visibleColumnsInternal.length;

export function getVisibleColumns() {
  return visibleColumnsInternal;
}

export function getVisibleColumnsCount() {
  return visibleColumnsCountInternal;
}

function dispatchVisibleColumnsChanged() {
  const keys = visibleColumnsInternal.map((c) => c.key);
  document.dispatchEvent(
    new CustomEvent('table:visible-columns-changed', { detail: keys })
  );
}

dispatchVisibleColumnsChanged();

function updateDerivedColumnState() {
  visibleColumnsInternal = columnsConfig.filter((c) => c.visible);
  visibleColumnsCountInternal = visibleColumnsInternal.length;
  dispatchVisibleColumnsChanged();
}

export function handleColumnVisibilityChange(event) {
  const changedKey = event.target.value;
  const isVisible = event.target.checked;

  const columnIndex = columnsConfig.findIndex((c) => c.key === changedKey);
  if (columnIndex > -1) {
    columnsConfig[columnIndex].visible = isVisible;
  }

  updateDerivedColumnState();

  document.dispatchEvent(new CustomEvent('table:columns-updated'));
}

export function populateColumnCheckboxes() {
  if (!DOMElements.filterColumnsList) return;
  DOMElements.filterColumnsList.innerHTML = '';

  columnsConfig.forEach((col) => {
    if (col.key === 'watchlist') {
      return;
    }

    const listItem = document.createElement('li');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'column-filter';
    checkbox.value = col.key;
    checkbox.checked = col.visible;

    if (!col.canHide) {
      checkbox.disabled = true;
    }
    checkbox.addEventListener('change', handleColumnVisibilityChange);

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${col.label}`));
    listItem.appendChild(label);
    DOMElements.filterColumnsList.appendChild(listItem);
  });
}
