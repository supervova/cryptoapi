// assets/js/markets/state.js
import {
  ASSETS_PATH_PREFIX,
  IS_DEVELOPMENT,
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

  // обновляем ранее загруженные активы
  state.allAssets = state.allAssets.map((a) => {
    const m = data[a.symbol] || {};
    return {
      ...a,
      name: m.name || a.name || a.symbol,
      icon: m.icon
        ? `${ASSETS_PATH_PREFIX}/assets/img/cryptologos/${m.icon}`
        : a.icon,
    };
  });
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

/**
 * Загрузка метаданных криптовалют из файла
 * При ошибке устанавливает fallback данные.
 */
export async function loadCryptoMeta() {
  try {
    const response = await fetch(
      `${ASSETS_PATH_PREFIX}/assets/data/crypto-meta.json`
    );
    if (!response.ok) {
      // Добавлена проверка ответа
      throw new Error(`Failed to fetch crypto-meta.json: ${response.status}`);
    }
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
