// assets/js/markets/config.js

const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const IS_LOCALHOST_ENV =
  hostname === 'localhost' ||
  hostname.endsWith('.local') ||
  hostname === '127.0.0.1';

// Значения устанавливаются в markets.twig
const APP_CONFIG = window.APP_CONFIG || {};

export const API_URL_DEV =
  APP_CONFIG.devApiUrl || '/assets/data/fixtures/crypto-data.json';
export const IS_DEVELOPMENT =
  APP_CONFIG.isDevelopment === true || IS_LOCALHOST_ENV;
export const ASSETS_PATH_PREFIX = APP_CONFIG.assetsBasePrefix || '';
export const CURRENT_LANG = APP_CONFIG.currentLang || 'en';

export const REFRESH_INTERVAL_MS = 10000;
export const ROW_HEIGHT_ESTIMATE = 56;
export const VISIBLE_BUFFER = 5;

// Начальное состояние сортировки (значения из Twig, читаются один раз)
// Задаются в основном файле markets.js init из атрибутов таблицы или APP_CONFIG
export const initialSortField = APP_CONFIG.initialSortField || 'rating';
export const initialSortDirection = APP_CONFIG.initialSortDirection || 'asc';

// Начальное состояние фильтра
export const initialFilterState = {
  priceMin: null,
  priceMax: null,
  rsiMin: null,
  rsiMax: null,
  ratingMax: null,
  risk: '',
  // Будет заполнено из columnsConfig
  visibleColumnKeys: [],
};
