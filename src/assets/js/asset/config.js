// src/assets/js/asset/config.js

/**
 * @file Конфигурационный файл веб-приложения.
 * Определяет базовые настройки окружения, API-эндпоинты и параметры графика
 * для отображения криптовалютных данных.
 */

const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const IS_LOCALHOST_ENV =
  hostname === 'localhost' ||
  hostname.endsWith('.local') ||
  hostname === '127.0.0.1';

// Значения, которые могут прийти из window.APP_CONFIG, установленного в asset.twig
const APP_CONFIG = window.APP_CONFIG || {};

// Общие конфигурации
export const IS_DEVELOPMENT =
  APP_CONFIG.isDevelopment === true || IS_LOCALHOST_ENV;
export const ASSETS_PATH_PREFIX = APP_CONFIG.assetsBasePrefix || '';
export const CURRENT_LANG = APP_CONFIG.currentLang || 'en';

// URL для API (может использоваться, если JS делает дополнительные запросы, например, на фикстуры)
// Если все данные приходят из PHP или через APP_CONFIG.initialCandleData, это может не понадобиться.
export const API_URL_DEV_CHART_FIXTURE =
  APP_CONFIG.devApiUrl || '/assets/data/fixtures/crypto-data-candles.json'; // Используем devApiUrl из APP_CONFIG

// Конфигурации для графика
export const VALID_TIMEFRAMES_FOR_PERIOD = {
  '1d': ['5m', '1m', '15m', '1h'],
  '1pd': ['5m', '1m', '15m', '1h'],
  '1M': ['1h', '4h', '12h', '1d'],
  '1pM': ['1h', '4h', '12h', '1d'],
  '1Y': ['12h', '1d'],
  '1pY': ['12h', '1d'],
  // Можно добавить больше периодов/таймфреймов, если они поддерживаются API
};

// Начальные значения для графика (будут переопределены из APP_CONFIG в state.js или asset.js)
export const DEFAULT_CHART_PERIOD = APP_CONFIG.initialChartPeriod || '1d';
export const DEFAULT_CHART_TIMEFRAME = APP_CONFIG.initialChartTimeframe || '5m'; // Должен быть валидным для DEFAULT_CHART_PERIOD

// Если есть другие специфичные для страницы актива конфигурации, их можно добавить сюда.
// Например, интервалы обновления для графика, если он должен обновляться "вживую" (пока не реализуем).
// export const CHART_REFRESH_INTERVAL_MS = 30000;
