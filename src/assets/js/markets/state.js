// assets/js/markets/state.js
import {
  ASSETS_PATH_PREFIX,
  IS_DEVELOPMENT,
  initialSortField,
  initialSortDirection,
  initialFilterState,
} from './config.js';

// Централизованное реактивное состояние – экспортируется как единственная неизменяемая привязка.
export const state = {
  currentChartTicker: null,
  currentChartPeriod: '1d', // Будет обновлен из DOM
  currentChartTimeframe: '1m', // Будет обновлен из DOM
  cryptoMeta: {},

  allAssets: [],
  sortedFilteredAssets: [],

  updateIntervalId: null,
  isLoading: true,
  currentRequestController: null,
};

export const sortState = {
  field: initialSortField,
  direction: initialSortDirection,
};

export const currentFilterState = JSON.parse(
  JSON.stringify(initialFilterState)
);
// visibleColumnKeys будет установлен после инициализации columnsConfig

/**
 * Установка метаданных криптовалют
 * @param {Object} data - Данные метаинформации
 */
export function setCryptoMeta(data) {
  state.cryptoMeta = data;
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
 * @param {AbortController} controller - Контроллер для отмены запроса
 */
export function setCurrentRequestController(controller) {
  state.currentRequestController = controller;
}

/**
 * Установка идентификатора интервала обновления
 * @param {number} id - ID интервала
 */
export function setUpdateIntervalId(id) {
  state.updateIntervalId = id;
}

/**
 * Установка тикера для текущего графика
 * @param {string} ticker - Тикер криптовалюты
 */
export function setCurrentChartTicker(ticker) {
  state.currentChartTicker = ticker;
}

/**
 * Установка периода для текущего графика
 * @param {string} period - Период графика
 */
export function setCurrentChartPeriod(period) {
  state.currentChartPeriod = period;
}

/**
 * Установка таймфрейма для текущего графика
 * @param {string} timeframe - Таймфрейм графика
 */
export function setCurrentChartTimeframe(timeframe) {
  state.currentChartTimeframe = timeframe;
}

/**
 * Загрузка метаданных криптовалют из файла
 * При ошибке устанавливает fallback данные.
 */
export async function loadCryptoMeta() {
  try {
    const response = await fetch(
      `${ASSETS_PATH_PREFIX}/assets/data/crypto-meta.json`
    );
    const data = await response.json();
    setCryptoMeta(data);
  } catch (error) {
    if (IS_DEVELOPMENT) {
      console.error('Failed to load crypto metadata:', error);
    }
    // Fallback метаданные
    setCryptoMeta({
      BTC: { name: 'Bitcoin', icon: 'btc.svg' },
      ETH: { name: 'Ethereum', icon: 'eth.svg' },
      SOL: { name: 'Solana', icon: 'sol.svg' },
      AVAX: { name: 'Avalanche', icon: 'avax.svg' },
      BONK: { name: 'Bonk', icon: 'bonk.svg' },
      DOGE: { name: 'Dogecoin', icon: 'doge.svg' },
      BNB: { name: 'BNB', icon: 'bnb.svg' },
    });
  }
}
