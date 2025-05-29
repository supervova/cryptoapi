// assets/js/markets/config.js

// Значения устанавливаются в markets.twig
const APP_CONFIG = window.APP_CONFIG || {};

export const API_URL_DEV =
  APP_CONFIG.devApiUrl || '/assets/data/fixtures/crypto-data.json';
export const IS_DEVELOPMENT = APP_CONFIG.isDevelopment || false;
export const ASSETS_PATH_PREFIX = APP_CONFIG.assetsBasePrefix || '';
export const CURRENT_LANG = APP_CONFIG.currentLang || 'en';

export const REFRESH_INTERVAL_MS = 10000;
export const ROW_HEIGHT_ESTIMATE = 56;
export const VISIBLE_BUFFER = 5;

export const VALID_TIMEFRAMES_FOR_PERIOD = {
  '1d': ['1m', '5m', '15m', '1h'],
  '1pd': ['1m', '5m', '15m', '1h'],
  '1M': ['1h', '4h', '12h', '1d'],
  '1pM': ['1h', '4h', '12h', '1d'],
  '1Y': ['12h', '1d'],
  '1pY': ['12h', '1d'],
};

// Начальное состояние сортировки (значения из Twig, читаются один раз)
// Задаются в основном файле markets.js init из атрибутов таблицы или APP_CONFIG
export const initialSortField = APP_CONFIG.initialSortField || 'rating';
export const initialSortDirection = APP_CONFIG.initialSortDirection || 'asc';

export const initialFilterState = {
  priceMin: null,
  priceMax: null,
  rsiMin: null,
  rsiMax: null,
  ratingMax: null,
  risk: '',
  visibleColumnKeys: [],
};
