// assets/js/markets/state.js
import {
  initialSortField,
  initialSortDirection,
  initialFilterState,
} from './config.js';

const META_UPDATED_EVENT = 'meta:updated';

// Централизованное реактивное состояние – экспортируется как единственная неизменяемая привязка.
export const state = {
  cryptoMeta: {},

  allAssets: [],
  sortedFilteredAssets: [],

  updateIntervalId: null,
  isLoading: true,
  currentRequestController: null,
};

// Состояние сортировки (остается, так как относится к таблице)
export const sortState = {
  field: initialSortField,
  direction: initialSortDirection,
};

// Текущее состояние фильтра (остается, так как относится к таблице)
export const currentFilterState = {
  ...JSON.parse(JSON.stringify(initialFilterState)),
  /** строка live-поиска в таблице */
  searchTerm: null,
};
// visibleColumnKeys будет установлен после инициализации columnsConfig

/**
 * Установка метаданных криптовалют
 * @param {Object} data - Данные метаинформации
 */
export function setCryptoMeta(data) {
  state.cryptoMeta = data;
  document.dispatchEvent(new Event(META_UPDATED_EVENT));
}

/**
 * Установка всех активов
 * @param {Array} data - Массив всех активов
 */
export function setAllAssets(data) {
  state.allAssets = data;
}

/**
 * Установка отсортированных и отфильтрованных активов
 * @param {Array} data - Массив отфильтрованных активов
 */
export function setSortedFilteredAssets(data) {
  state.sortedFilteredAssets = data;
}

/**
 * Установка состояния загрузки
 * @param {boolean} loading - Состояние загрузки
 */
export function setIsLoading(loading) {
  state.isLoading = loading;
}

/**
 * Установка контроллера текущего запроса
 * @param {AbortController|null} controller - Контроллер для отмены запроса или null
 */
export function setCurrentRequestController(controller) {
  state.currentRequestController = controller;
}

/**
 * Установка идентификатора интервала обновления
 * @param {number|null} id - ID интервала или null
 */
export function setUpdateIntervalId(id) {
  state.updateIntervalId = id;
}
