// src/assets/js/asset/chart.js

/* Модуль для управления отображением данных криптовалютного актива, включая
обновление заголовка страницы, обработку периодов и таймфреймов, и загрузку
данных для графика. */

import * as DOMElements from './dom.js';
import t from '../markets/translate.js';
import { VALID_TIMEFRAMES_FOR_PERIOD, IS_DEVELOPMENT } from './config.js';
import { fetchChartData } from '../markets/api.js';

import {
  renderCandlestickChart,
  destroyChartInstance,
} from '../chart/chart.js'; // Рендеринг самого графика

import {
  state as assetState,
  setChartPeriod,
  setChartTimeframe,
  setChartIsLoading,
} from './state.js';

/** Быстрое форматирование цены. При желании замените на Intl.NumberFormat */
export const formatPrice = (value) =>
  (+value).toLocaleString('en-US', { minimumFractionDigits: 2 });

/** Обновляем шапку страницы активом */
export function updateAssetHeader({
  name,
  ticker,
  iconPath,
  open,
  high,
  low,
  current,
}) {
  // Название валюты
  DOMElements.assetHeader.name.forEach((elem) => {
    if (elem) {
      const element = elem;
      element.textContent = name || '—';
    }
  });

  // Тикер
  if (DOMElements.assetHeader.symbol) {
    DOMElements.assetHeader.symbol.textContent = `${ticker}-USD`;
  }

  // Иконка и fallback
  if (DOMElements.assetHeader.icon && DOMElements.assetHeader.iconFallback) {
    const { icon } = DOMElements.assetHeader;
    const fallback = DOMElements.assetHeader.iconFallback;

    // Сразу проверяем существование файла
    fetch(iconPath)
      .then((response) => {
        if (response.ok) {
          icon.src = iconPath;
          icon.style.display = '';
          fallback.style.display = 'none';
        } else {
          throw new Error('Icon not found');
        }
      })
      .catch(() => {
        icon.style.display = 'none';
        fallback.textContent = ticker.slice(0, 3).toUpperCase();
        fallback.style.display = '';
      });
  }

  // Цены
  if (DOMElements.assetHeader.open)
    DOMElements.assetHeader.open.textContent = formatPrice(open);
  if (DOMElements.assetHeader.high)
    DOMElements.assetHeader.high.textContent = formatPrice(high);
  if (DOMElements.assetHeader.low)
    DOMElements.assetHeader.low.textContent = formatPrice(low);
  if (DOMElements.assetHeader.price)
    DOMElements.assetHeader.price.textContent = formatPrice(current);
}

/**
 * Инициализация графика с переданными начальными данными.
 * Одновременно высчитывает O/H/L/Last и обновляет шапку актива.
 *
 * @param {Array} initialCandles - Массив начальных свечей [{x,o,h,l,c}, …].
 * @param {HTMLElement} chartContainer - DOM‑элемент контейнера для графика.
 */
export function initializeChartWithData(initialCandles, chartContainer) {
  if (!chartContainer) {
    console.error(
      '[Asset Chart] Chart container not provided for initialization.'
    );
    return;
  }

  // 1. Рисуем график или выводим сообщения об ошибке
  if (initialCandles && initialCandles.length > 0) {
    renderCandlestickChart(initialCandles, chartContainer);
  } else if (initialCandles && initialCandles.length === 0) {
    const container = chartContainer;
    container.innerHTML = `<p class="p-3 text-center">${t(
      'noDataToDisplayChart',
      'No data to display chart.'
    )}</p>`;
    destroyChartInstance();
  } else {
    const container = chartContainer;
    container.innerHTML = `<p class="p-3 text-center">${t(
      'couldNotLoadInitialChartData',
      'Could not load initial chart data.'
    )}</p>`;
    destroyChartInstance();
  }
  setChartIsLoading(false);

  // 2. Если есть свечи — вычисляем статистику и обновляем шапку
  if (initialCandles && initialCandles.length > 0) {
    const first = initialCandles[0];
    const last = initialCandles.at(-1);
    const high = Math.max(...initialCandles.map((c) => +c.h));
    const low = Math.min(...initialCandles.map((c) => +c.l));

    assetState.header = { open: +first.o, high, low, current: +last.c };

    updateAssetHeader({
      ticker: window.APP_CONFIG.assetTicker?.toUpperCase() || '—',
      name: window.APP_CONFIG.assetName,
      iconPath: window.APP_CONFIG.assetIconPath,
      open: first.o,
      high,
      low,
      current: last.c,
    });
  }
}

/**
 * Обновляет доступные опции таймфрейма на основе выбранного периода.
 * Одновременно приводит состояние и summary-текст к актуальным значениям.
 * @param {string} selectedPeriod - Например, '1d'
 */
export function updateTimeframeOptionsForAssetPage(selectedPeriod) {
  const validTimeframes = VALID_TIMEFRAMES_FOR_PERIOD[selectedPeriod] || [];
  let newActiveTimeframe = assetState.chart.currentTimeframe;

  // Если текущий таймфрейм недопустим — берём первый валидный
  if (!validTimeframes.includes(newActiveTimeframe) && validTimeframes.length) {
    [newActiveTimeframe] = validTimeframes;
    setChartTimeframe(newActiveTimeframe);
  } else if (!validTimeframes.length) {
    newActiveTimeframe = null;
    setChartTimeframe(null);
  }

  // Перебираем радиокнопки и корректно выставляем свойства
  DOMElements.timeframeRadioButtons.forEach((radioInput) => {
    const tfValue = radioInput.value;
    const labelAction = radioInput.closest('.e-menu__action');
    const isValid = validTimeframes.includes(tfValue);

    const input = radioInput;
    input.disabled = !isValid; // ← свойство, не атрибут
    input.checked = isValid && tfValue === newActiveTimeframe;

    if (labelAction) {
      labelAction.classList.toggle('is-disabled', !isValid);
    }
  });

  /* Обновляем summary выпадашки */
  if (DOMElements.chartTimeframeMenu) {
    const summary = DOMElements.chartTimeframeMenu.querySelector('summary');
    const activeRadio = DOMElements.timeframeRadioButtons.find(
      (r) => r.checked
    );
    if (summary) {
      summary.childNodes[0].nodeValue = activeRadio
        ? `${activeRadio.dataset.shortcut || activeRadio.value} `
        : '--- ';
    }
  }

  if (IS_DEVELOPMENT) {
    console.log(
      `[Asset Chart] Timeframe options updated for "${selectedPeriod}". ` +
        `Current timeframe: "${assetState.chart.currentTimeframe}"`
    );
  }
}

/**
 * Загружает и отображает данные для графика на странице актива.
 *
 * Параметры можно передавать для явного обновления; если они
 * опущены, берутся текущие значения из assetState.
 *
 * @param {Object} [opts]
 * @param {string} [opts.ticker]       - Символ актива (BTC, ETH…)
 * @param {string} [opts.period]       - Период (1d, 7d…)
 * @param {string} [opts.timeframe]    - Тайм‑фрейм (1m, 1h…)
 * @param {boolean}[opts.isSilent]     - Если true, не показывать «Loading…»
 */
export async function refreshAssetChartData({
  ticker = assetState.currentAsset.ticker,
  period = assetState.chart.currentPeriod,
  timeframe = assetState.chart.currentTimeframe,
  isSilent = false,
} = {}) {
  if (!ticker) {
    if (IS_DEVELOPMENT) {
      console.warn('[Asset Chart] Ticker not set, cannot refresh chart.');
    }
    if (DOMElements.assetChartContainer) {
      DOMElements.assetChartContainer.innerHTML = `<p class="p-3 text-center">${t('errorTickerMissing', 'Asset ticker is missing.')}</p>`;
    }
    return;
  }

  if (!isSilent) {
    setChartIsLoading(true);
    if (DOMElements.assetChartContainer) {
      DOMElements.assetChartContainer.innerHTML = `<p class="is-loading-state p-3 text-center">${t('loadingChartData', 'Loading chart data...')}</p>`;
    }
  }

  try {
    const candleData = await fetchChartData(ticker, period, timeframe);

    if (!DOMElements.assetChartContainer) return;

    if (candleData && candleData.length > 0) {
      renderCandlestickChart(candleData, DOMElements.assetChartContainer);

      // ---- Обновляем O/H/L/Last в шапке ----
      const first = candleData[0];
      const last = candleData.at(-1);
      const high = Math.max(...candleData.map((c) => +c.h));
      const low = Math.min(...candleData.map((c) => +c.l));

      assetState.header = { open: +first.o, high, low, current: +last.c };

      updateAssetHeader({
        ticker: ticker.toUpperCase(),
        name: window.APP_CONFIG.assetName, // или assetState.currentAsset.name
        iconPath: window.APP_CONFIG.assetIconPath,
        open: first.o,
        high,
        low,
        current: last.c,
      });
    } else if (candleData && candleData.length === 0) {
      DOMElements.assetChartContainer.innerHTML = `<p class="p-3 text-center">${t('noChartDataForPeriod', 'No chart data available for the selected period.')}</p>`;
      destroyChartInstance();
    } else {
      DOMElements.assetChartContainer.innerHTML = `<p class="p-3 text-center">${t('couldNotLoadChartData', 'Could not load chart data.')}</p>`;
      destroyChartInstance();
    }
  } catch (error) {
    console.error('[Asset Chart] Error refreshing chart data:', error);
    if (DOMElements.assetChartContainer) {
      DOMElements.assetChartContainer.innerHTML = `<p class="p-3 text-center">${t('errorLoadingData', 'Error loading data.')}</p>`;
      destroyChartInstance();
    }
  } finally {
    if (!isSilent) setChartIsLoading(false);
  }
}

/**
 * Обработчик изменения периода на странице актива.
 * @param {Event} event - Событие изменения.
 */
export function handleAssetPeriodChange(event) {
  const selectedPeriod = event.target.value;
  const selectedShortcut = event.target.dataset.shortcut || selectedPeriod;

  if (assetState.chart.currentPeriod !== selectedPeriod) {
    setChartPeriod(selectedPeriod);
    if (IS_DEVELOPMENT) {
      console.log(
        `[Asset Chart] Period changed to: ${assetState.chart.currentPeriod}`
      );
    }

    if (DOMElements.chartPeriodMenu) {
      const summary = DOMElements.chartPeriodMenu.querySelector('summary');
      if (summary) summary.childNodes[0].nodeValue = `${selectedShortcut} `;
    }

    updateTimeframeOptionsForAssetPage(selectedPeriod); // Обновляем опции и состояние таймфрейма
    refreshAssetChartData(); // Загружаем новые данные для графика
  }
  // Закрываем popover меню, если оно было открыто
  if (DOMElements.chartPeriodMenu?.hasAttribute('open')) {
    DOMElements.chartPeriodMenu.removeAttribute('open');
  }
}

/**
 * Обработчик изменения таймфрейма на странице актива.
 * @param {Event} event - Событие изменения.
 */
export function handleAssetTimeframeChange(event) {
  const selectedTimeframe = event.target.value;
  const selectedShortcut = event.target.dataset.shortcut || selectedTimeframe;

  if (assetState.chart.currentTimeframe !== selectedTimeframe) {
    setChartTimeframe(selectedTimeframe);
    if (IS_DEVELOPMENT) {
      console.log(
        `[Asset Chart] Timeframe changed to: ${assetState.chart.currentTimeframe}`
      );
    }

    if (DOMElements.chartTimeframeMenu) {
      const summary = DOMElements.chartTimeframeMenu.querySelector('summary');
      if (summary) summary.childNodes[0].nodeValue = `${selectedShortcut} `;
    }
    refreshAssetChartData(); // Загружаем новые данные для графика
  }
  // Закрываем popover меню, если оно было открыто
  if (DOMElements.chartTimeframeMenu?.hasAttribute('open')) {
    DOMElements.chartTimeframeMenu.removeAttribute('open');
  }
}
