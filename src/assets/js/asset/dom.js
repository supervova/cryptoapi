// src/assets/js/asset/dom.js

// Элементы заголовка актива
export const assetDetailsIcon = document.querySelector(
  '.e-asset-details__icon'
);
export const assetDetailsTitleElements = document.querySelectorAll(
  '.e-asset-details__title'
); // Их два (мобильный/десктоп)
export const assetDetailsSymbol = document.querySelector(
  '.e-asset-details__symbol'
);
export const assetDetailsPrice = document.querySelector(
  '.e-asset-details__price > *:first-child'
); // Текстовая нода цены
export const assetDetailsPriceChange = document.querySelector(
  '.e-asset-details__price-change'
);
export const assetDetailsOpen = document.querySelector(
  '.e-asset-details__stats [data-stat="open"]'
);
export const assetDetailsHigh = document.querySelector(
  '.e-asset-details__stats [data-stat="max"]'
);
export const assetDetailsLow = document.querySelector(
  '.e-asset-details__stats [data-stat="min"]'
);

// -----------------------------------------------------------------------------
// ВАЛЮТА
// -----------------------------------------------------------------------------

// «Шапка»
export const assetHeader = {
  name: document.querySelectorAll('[data-asset-name]'),
  symbol: document.querySelector('[data-asset-symbol]'),
  icon: document.querySelector('.e-asset-details__icon'),
  open: document.querySelector('[data-asset-open]'),
  high: document.querySelector('[data-asset-high]'),
  low: document.querySelector('[data-asset-low]'),
  priceValue: document.querySelector('[data-asset-price-value]'),
  priceChange: document.querySelector('[data-asset-price-change]'),
};

// Контейнер для графика
export const assetChartContainer = document.getElementById('asset-chart');

// Меню для графика
export const chartPeriodMenu = document.querySelector(
  '.e-asset-details__period details[data-role="popover"]:has(input[name="chart-period"])'
);
export const chartTimeframeMenu = document.querySelector(
  '.e-asset-details__period details[data-role="popover"]:has(input[name="chart-timeframe"])'
);

export const periodRadioButtons = chartPeriodMenu
  ? Array.from(chartPeriodMenu.querySelectorAll('input[name="chart-period"]'))
  : [];
export const timeframeRadioButtons = chartTimeframeMenu
  ? Array.from(
      chartTimeframeMenu.querySelectorAll('input[name="chart-timeframe"]')
    )
  : [];

// Строка статусов внизу страницы
export const statsBar = {
  trindx: document.querySelector('[data-asset-trindx]'),
  forecastMiddle: document.querySelectorAll('[data-asset-forecast-middle]'),
  forecastChange: document.querySelector('[data-asset-forecast-change]'),
  forecastMinMax: document.querySelector('[data-asset-forecast-min-max]'),
  rating: document.querySelector('[data-asset-rating]'),
};
