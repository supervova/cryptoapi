// src/assets/js/asset/state.js

import { DEFAULT_CHART_PERIOD, DEFAULT_CHART_TIMEFRAME } from './config.js'; // Импортируем дефолтные значения

// Начальные данные, которые приходят из window.APP_CONFIG
const APP_CONFIG = window.APP_CONFIG || {};

// Централизованное состояние для страницы актива
export const state = {
  // Данные текущего отображаемого актива (могут обновляться, если будет такая логика)
  currentAsset: {
    ticker: APP_CONFIG.assetTicker || null,
    name: APP_CONFIG.assetName || null,
    iconPath: APP_CONFIG.assetIconPath || null,
    openPrice: APP_CONFIG.assetOpenPrice || 'N/A',
    highPrice: APP_CONFIG.assetHighPrice || 'N/A',
    lowPrice: APP_CONFIG.assetLowPrice || 'N/A',
    currentPrice: APP_CONFIG.assetCurrentPrice || 'N/A',
    change24hPercent: APP_CONFIG.assetChange24hPercent || 'N/A',
  },

  // Состояние графика
  chart: {
    currentPeriod: APP_CONFIG.initialChartPeriod || DEFAULT_CHART_PERIOD,
    currentTimeframe:
      APP_CONFIG.initialChartTimeframe || DEFAULT_CHART_TIMEFRAME,
    // initialCandleData будет загружено в asset.js и передано для первой отрисовки,
    // здесь его хранить не обязательно, если только не для каких-то сравнений.
    // candleData: APP_CONFIG.initialCandleData || [], // Можно хранить текущие свечи здесь
    isLoading: true, // Состояние загрузки данных для графика
  },

  // Данные для шапки (обновляются после каждой загрузки свечей)
  header: {
    open: null,
    high: null,
    low: null,
    current: null,
  },

  // Если будут другие состояния, например, для новостей или AI-советов, они добавятся сюда.
  // news: {
  //   items: [],
  //   isLoading: false,
  // },
  // aiAdvice: {
  //   text: null,
  //   isLoading: false,
  // }
};

// Обновление данных текущего актива (если понадобится динамическое обновление без перезагрузки)
export function setCurrentAssetData(data) {
  if (data.ticker) state.currentAsset.ticker = data.ticker;
  if (data.name) state.currentAsset.name = data.name;
  if (data.iconPath) state.currentAsset.iconPath = data.iconPath;
  if (data.openPrice) state.currentAsset.openPrice = data.openPrice;
  if (data.highPrice) state.currentAsset.highPrice = data.highPrice;
  if (data.lowPrice) state.currentAsset.lowPrice = data.lowPrice;
  if (data.currentPrice) state.currentAsset.currentPrice = data.currentPrice;
  if (data.change24hPercent)
    state.currentAsset.change24hPercent = data.change24hPercent;
}

// Обновление O/H/L/Last для шапки
export function setHeaderData({ open, high, low, current }) {
  if (open !== undefined) state.header.open = open;
  if (high !== undefined) state.header.high = high;
  if (low !== undefined) state.header.low = low;
  if (current !== undefined) state.header.current = current;
}

// Сеттеры для состояния графика
export function setChartPeriod(period) {
  state.chart.currentPeriod = period;
}

export function setChartTimeframe(timeframe) {
  state.chart.currentTimeframe = timeframe;
}

export function setChartIsLoading(loading) {
  state.chart.isLoading = loading;
}
