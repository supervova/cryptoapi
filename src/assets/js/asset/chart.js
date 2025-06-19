// src/assets/js/asset/chart.js

/**
 * @file Модуль для управления отображением данных криптовалютного актива.
 * обновление заголовка страницы, обработка периодов и таймфреймов, и загрузка
 * данных для графика.
 */

import * as DOMElements from './dom.js';
import t from '../markets/translate.js';
import { VALID_TIMEFRAMES_FOR_PERIOD, IS_DEVELOPMENT } from './config.js';
import { fetchChartData } from '../markets/api.js';
import { formatPrice } from '../table/formatting.js';

import { renderCandlestickChart, destroyChartInstance } from '../chart.js'; // Рендеринг самого графика

import {
  state as assetState,
  setChartPeriod,
  setChartTimeframe,
  setChartIsLoading,
} from './state.js';

/**
 * Приводит массив свечей к единому формату, приемлемому для Chart.js:
 *  • x → объект Date (или ISO-строка с «T…Z»)
 *  • массив отсортирован по возрастанию времени
 * Возвращается новый массив, исходный не мутируется.
 */
export function normalizeCandles(candles = []) {
  const normalized = (candles || []).map((c) => {
    const copy = { ...c };
    if (copy && copy.x) {
      const raw = String(copy.x);

      const iso = raw.includes('T')
        ? raw // уже ISO-8601 (+00:00, +03:00 …) – оставляем
        : `${raw.replace(' ', 'T')}`; // «2025-06-09 07:01:00» → «2025-06-09T07:01:00»

      // «пробел» → «T», БЕЗ «Z»
      copy.x = new Date(iso);
    }
    return copy;
  });

  normalized.sort((a, b) => +a.x - +b.x);
  return normalized;
}

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
  DOMElements.assetHeader.name.forEach((el) => {
    if (el) {
      const elName = el;
      elName.textContent = name || '—';
    }
  });

  // Тикер
  if (DOMElements.assetHeader.symbol) {
    DOMElements.assetHeader.symbol.textContent = `${ticker}-USD`;
  }

  // Иконка и data-fallback (без fetch)
  if (DOMElements.assetHeader.icon) {
    DOMElements.assetHeader.icon.src = iconPath;
    DOMElements.assetHeader.icon.dataset.fallback = ticker
      .slice(0, 3)
      .toUpperCase();
  }

  // Цены
  if (DOMElements.assetHeader.open)
    DOMElements.assetHeader.open.textContent = formatPrice(open, {
      tick: 0.001,
    });

  if (DOMElements.assetHeader.high)
    DOMElements.assetHeader.high.textContent = formatPrice(high, {
      tick: 0.001,
    });

  if (DOMElements.assetHeader.low)
    DOMElements.assetHeader.low.textContent = formatPrice(low, { tick: 0.001 });

  if (DOMElements.assetHeader.price)
    DOMElements.assetHeader.price.textContent = formatPrice(current, {
      tick: 0.001,
    });
}

/**
 * Инициализация графика с переданными начальными данными.
 * Одновременно высчитывает O/H/L/Last и обновляет шапку актива.
 *
 * @param {Array} initialCandles - Массив начальных свечей [{x,o,h,l,c}, …].
 * @param {HTMLElement} chartContainer - DOM‑элемент контейнера для графика.
 */
export function initializeChartWithData(initialCandles, chartContainer) {
  const candles = normalizeCandles(initialCandles || []);

  if (!chartContainer) {
    console.error(
      '[Asset Chart] Chart container not provided for initialization.'
    );
    return;
  }

  // 1. Рисуем график или выводим сообщения об ошибке
  const container = chartContainer;
  if (candles.length > 0) {
    renderCandlestickChart(candles, container);
  } else if (initialCandles && initialCandles.length === 0) {
    container.innerHTML = `<p class="p-3 text-center">${t(
      'noDataToDisplayChart',
      'No data to display chart.'
    )}</p>`;
    destroyChartInstance();
  } else {
    container.innerHTML = `<p class="p-3 text-center">${t(
      'couldNotLoadInitialChartData',
      'Could not load initial chart data.'
    )}</p>`;
    destroyChartInstance();
  }
  setChartIsLoading(false);

  // 2. Если есть свечи — вычисляем статистику и обновляем шапку
  if (candles.length > 0) {
    const first = candles[0];
    const last = candles.at(-1);
    const high = Math.max(...candles.map((c) => +c.h));
    const low = Math.min(...candles.map((c) => +c.l));

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

  if (!validTimeframes.includes(newActiveTimeframe) && validTimeframes.length) {
    [newActiveTimeframe] = validTimeframes;
    setChartTimeframe(newActiveTimeframe);
  } else if (['1d', '1pd'].includes(selectedPeriod)) {
    newActiveTimeframe = '5m';
    setChartTimeframe('5m');
  } else if (!validTimeframes.length) {
    newActiveTimeframe = null;
    setChartTimeframe(null);
  }

  DOMElements.timeframeRadioButtons.forEach((input) => {
    const radioInput = input;
    const tfValue = radioInput.value;
    const labelAction = radioInput.closest('.e-menu__action');
    const isValid = validTimeframes.includes(tfValue);

    radioInput.disabled = !isValid;
    radioInput.checked = isValid && tfValue === newActiveTimeframe;
    if (labelAction) labelAction.classList.toggle('is-disabled', !isValid);
  });

  if (DOMElements.chartTimeframeMenu) {
    const summary = DOMElements.chartTimeframeMenu.querySelector('summary');
    const activeRadio = Array.from(DOMElements.timeframeRadioButtons).find(
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
        `Current TF: "${assetState.chart.currentTimeframe}"`
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
    if (DOMElements.assetChartContainer) {
      DOMElements.assetChartContainer.innerHTML = `<p class="p-3 text-center">${t(
        'errorTickerMissing',
        'Asset ticker is missing.'
      )}</p>`;
    }
    return;
  }

  if (!isSilent) {
    setChartIsLoading(true);
    if (DOMElements.assetChartContainer) {
      DOMElements.assetChartContainer.innerHTML = `<p class="is-loading-state p-3 text-center">${t(
        'loadingChartData',
        'Loading chart data...'
      )}</p>`;
    }
  }

  try {
    const candleData = await fetchChartData(ticker, period, timeframe);
    const candles = normalizeCandles(candleData || []);

    if (!DOMElements.assetChartContainer) return;

    if (candles.length > 0) {
      renderCandlestickChart(candles, DOMElements.assetChartContainer);

      const first = candles[0];
      const last = candles.at(-1);
      const high = Math.max(...candles.map((c) => +c.h));
      const low = Math.min(...candles.map((c) => +c.l));

      assetState.header = { open: +first.o, high, low, current: +last.c };

      updateAssetHeader({
        ticker: ticker.toUpperCase(),
        name: window.APP_CONFIG.assetName,
        iconPath: window.APP_CONFIG.assetIconPath,
        open: first.o,
        high,
        low,
        current: last.c,
      });
    } else {
      DOMElements.assetChartContainer.innerHTML = `<p class="p-3 text-center">${t(
        'noChartDataForPeriod',
        'No chart data available for the selected period.'
      )}</p>`;
      destroyChartInstance();
    }
  } catch (error) {
    console.error('[Asset Chart] Error refreshing chart data:', error);
    if (DOMElements.assetChartContainer) {
      DOMElements.assetChartContainer.innerHTML = `<p class="p-3 text-center">${t(
        'errorLoadingData',
        'Error loading data.'
      )}</p>`;
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
