// assets/js/table/columns.js

import * as DOMElements from '../markets/dom.js';
import * as marketState from '../markets/state.js';
import t from '../markets/translate.js';
import { applySortAndFilter, updateFilterCountBadge } from './sort-filter.js';
import {
  formatPrice,
  formatChange24h,
  formatRisk,
  formatNullable,
} from './formatting.js';
import { generateTableHeadHtml } from './render.js';

export const ALL_COLUMNS_CONFIG = [
  {
    key: 'watchlist',
    type: 'action',
    get label() {
      return t('watchlist', 'Watchlist');
    },
    sortable: false,
    visible: false,
    canHide: false,
    apiField: 'watchlist',
  },
  {
    key: 'asset',
    type: 'text',
    get label() {
      return t('asset', 'Asset');
    },
    sortable: true,
    apiField: 'symbol',
    visible: true,
    canHide: false,
  },
  {
    key: 'price',
    type: 'num',
    get label() {
      return t('price', 'Price, $');
    },
    sortable: true,
    apiField: 'price.current',
    formatter: formatPrice,
    visible: true,
    canHide: false,
  },
  {
    key: 'change_24h',
    type: 'num',
    get label() {
      return t('change_24h', 'Chg (24H), %');
    },
    sortable: true,
    apiField: 'price',
    formatter: formatChange24h,
    visible: true,
    canHide: true,
  },
  {
    key: 'rating',
    type: 'num',
    get label() {
      return t('rating', 'Rating');
    },
    sortable: true,
    apiField: 'rating',
    formatter: formatNullable,
    visible: true,
    canHide: true,
  },
  {
    key: 'risk',
    type: 'icon',
    get label() {
      return t('risk', 'Risk');
    },
    sortable: false,
    apiField: 'risk',
    formatter: formatRisk,
    visible: true,
    canHide: true,
  },
  {
    key: 'trindex',
    type: 'num',
    get label() {
      return t('trindex', 'TRIndex');
    },
    sortable: true,
    apiField: 'TRINDX',
    formatter: formatNullable,
    visible: true,
    canHide: true,
  },
  {
    key: 'rsi_7d',
    type: 'num',
    get label() {
      return t('rsi_7d', 'RSI (7D)');
    },
    sortable: true,
    apiField: 'RSI7',
    formatter: formatNullable,
    visible: true,
    canHide: true,
  },
  {
    key: 'rsi_30d',
    type: 'num',
    get label() {
      return t('rsi_30d', 'RSI (30D)');
    },
    sortable: true,
    apiField: 'RSI30',
    formatter: formatNullable,
    visible: false,
    canHide: true,
  },
  {
    key: 'rsi_91d',
    type: 'num',
    get label() {
      return t('rsi_91d', 'RSI (91D)');
    },
    sortable: true,
    apiField: 'RSI91',
    formatter: formatNullable,
    visible: false,
    canHide: true,
  },
  {
    key: 'rsi_182d',
    type: 'num',
    get label() {
      return t('rsi_182d', 'RSI (182D)');
    },
    sortable: true,
    apiField: 'RSI182',
    formatter: formatNullable,
    visible: false,
    canHide: true,
  },
  {
    key: 'rsi_365d',
    type: 'num',
    get label() {
      return t('rsi_365d', 'RSI (365D)');
    },
    sortable: true,
    apiField: 'RSI365',
    formatter: formatNullable,
    visible: false,
    canHide: true,
  },
  {
    key: 'rsi_1000d',
    type: 'num',
    get label() {
      return t('rsi_1000d', 'RSI (1000D)');
    },
    sortable: true,
    apiField: 'RSI1000',
    formatter: formatNullable,
    visible: false,
    canHide: true,
  },
  {
    key: 'market',
    type: 'text',
    get label() {
      return t('market', 'Market');
    },
    sortable: true,
    apiField: 'market',
    formatter: formatNullable,
    visible: false,
    canHide: true,
  },
];

export const columnsConfig = ALL_COLUMNS_CONFIG.map((col) => ({ ...col }));

let visibleColumnsInternal = columnsConfig.filter((c) => c.visible);
let visibleColumnsCountInternal = visibleColumnsInternal.length;

export function getVisibleColumns() {
  return visibleColumnsInternal;
}

export function getVisibleColumnsCount() {
  return visibleColumnsCountInternal;
}

marketState.currentFilterState.visibleColumnKeys = visibleColumnsInternal.map(
  (c) => c.key
);

function updateDerivedColumnState() {
  visibleColumnsInternal = columnsConfig.filter((c) => c.visible);
  visibleColumnsCountInternal = visibleColumnsInternal.length;
  marketState.currentFilterState.visibleColumnKeys = visibleColumnsInternal.map(
    (c) => c.key
  );
}

export function handleColumnVisibilityChange(event) {
  const changedKey = event.target.value;
  const isVisible = event.target.checked;

  const columnIndex = columnsConfig.findIndex((c) => c.key === changedKey);
  if (columnIndex > -1) {
    columnsConfig[columnIndex].visible = isVisible;
  }

  updateDerivedColumnState();

  generateTableHeadHtml();
  applySortAndFilter(false);
  updateFilterCountBadge();
}

export function populateColumnCheckboxes() {
  if (!DOMElements.filterColumnsList) return;
  DOMElements.filterColumnsList.innerHTML = '';

  columnsConfig.forEach((col) => {
    // Колонка watchlist временно скрыта из «шапки» таблицы и фильтров
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

    // Колонки, которые нельзя скрыть (canHide: false), будут иметь disabled чекбокс.
    // К ним относятся 'asset', 'price', и 'watchlist' (согласно текущей конфигурации).
    if (!col.canHide) {
      checkbox.disabled = true;
    }
    checkbox.addEventListener('change', handleColumnVisibilityChange);

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${col.label}`)); // .label - это геттер
    listItem.appendChild(label);
    DOMElements.filterColumnsList.appendChild(listItem);
  });
}
