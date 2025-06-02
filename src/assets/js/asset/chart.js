// src/assets/js/asset/chart.js

import t from '../markets/translate.js'; // Общие переводы
import { fetchChartData } from '../markets/api.js'; // API для запроса данных графика
import {
  renderCandlestickChart,
  destroyChartInstance,
} from '../chart/chart.js'; // Рендеринг самого графика

import * as DOMElements from './dom.js'; // DOM элементы со страницы актива
import {
  state as assetState,
  setChartPeriod,
  setChartTimeframe,
  setChartIsLoading,
} from './state.js'; // Состояние страницы актива
import { VALID_TIMEFRAMES_FOR_PERIOD, IS_DEVELOPMENT } from './config.js'; // Конфигурация страницы актива

/**
 * Инициализация графика с переданными начальными данными.
 * @param {Array} initialCandles - Массив начальных свечей.
 * @param {HTMLElement} chartContainer - DOM-элемент контейнера для графика.
 */
export function initializeChartWithData(initialCandles, chartContainer) {
  if (!chartContainer) {
    console.error(
      '[Asset Chart] Chart container not provided for initialization.'
    );
    return;
  }
  if (initialCandles && initialCandles.length > 0) {
    renderCandlestickChart(initialCandles, chartContainer);
    setChartIsLoading(false);
  } else if (initialCandles && initialCandles.length === 0) {
    chartContainer.innerHTML = `<p class="p-m text-center">${t('noDataToDisplayChart', 'No data to display chart.')}</p>`;
    destroyChartInstance(); // Убедимся, что предыдущий инстанс удален
    setChartIsLoading(false);
  } else {
    chartContainer.innerHTML = `<p class="p-m text-center">${t('couldNotLoadInitialChartData', 'Could not load initial chart data.')}</p>`;
    destroyChartInstance();
    setChartIsLoading(false);
  }
}

/**
 * Обновляет доступные опции таймфрейма на основе выбранного периода для страницы актива.
 * Также устанавливает выбранные радио-кнопки.
 * @param {string} selectedPeriod - Текущий выбранный период (например, '1d').
 */
export function updateTimeframeOptionsForAssetPage(selectedPeriod) {
  const validTimeframes = VALID_TIMEFRAMES_FOR_PERIOD[selectedPeriod] || [];
  let newActiveTimeframe = assetState.chart.currentTimeframe;

  // Если текущий таймфрейм невалиден для нового периода, выбираем первый валидный
  if (
    !validTimeframes.includes(newActiveTimeframe) &&
    validTimeframes.length > 0
  ) {
    [newActiveTimeframe] = validTimeframes;
    setChartTimeframe(newActiveTimeframe); // Обновляем состояние
  } else if (validTimeframes.length === 0) {
    newActiveTimeframe = null; // Нет валидных таймфреймов
    setChartTimeframe(null);
  }

  // Обновляем DOM радио-кнопок
  DOMElements.timeframeRadioButtons.forEach((radio) => {
    const timeframeValue = radio.value;
    const labelAction = radio.closest('.e-menu__action'); // Если используется такой класс для стилизации
    const isValid = validTimeframes.includes(timeframeValue);

    radio.disabled = !isValid;
    if (labelAction) {
      labelAction.classList.toggle('is-disabled', !isValid);
    }
    radio.checked = isValid && timeframeValue === newActiveTimeframe;
  });

  // Обновляем текст в summary для меню таймфреймов
  if (DOMElements.chartTimeframeMenu) {
    const summary = DOMElements.chartTimeframeMenu.querySelector('summary');
    const activeRadio = DOMElements.timeframeRadioButtons.find(
      (r) => r.checked
    );
    if (summary && activeRadio) {
      summary.childNodes[0].nodeValue = `${activeRadio.dataset.shortcut || activeRadio.value} `;
    } else if (summary) {
      summary.childNodes[0].nodeValue = '--- '; // Если нет активного/валидного
    }
  }

  if (IS_DEVELOPMENT) {
    console.log(
      `[Asset Chart] Timeframe options updated for period "${selectedPeriod}". New current timeframe: "${assetState.chart.currentTimeframe}"`
    );
  }
}

/**
 * Загружает и отображает данные для графика на странице актива.
 */
async function refreshAssetChartData() {
  if (!assetState.currentAsset.ticker) {
    if (IS_DEVELOPMENT)
      console.warn('[Asset Chart] Ticker not set, cannot refresh chart.');
    if (DOMElements.assetChartContainer) {
      DOMElements.assetChartContainer.innerHTML = `<p class="p-m text-center">${t('errorTickerMissing', 'Asset ticker is missing.')}</p>`;
    }
    return;
  }

  setChartIsLoading(true);
  if (DOMElements.assetChartContainer) {
    // Показываем состояние загрузки
    DOMElements.assetChartContainer.innerHTML = `<p class="is-loading-state p-m text-center">${t('loadingChartData', 'Loading chart data...')}</p>`;
  }
  // Обновление OHL в заголовке можно сделать здесь, если это требуется
  // Например, установить в DOMElements.assetDetailsOpen.textContent = '...';

  try {
    const candleData = await fetchChartData(
      assetState.currentAsset.ticker,
      assetState.chart.currentPeriod,
      assetState.chart.currentTimeframe
    );

    if (DOMElements.assetChartContainer) {
      if (candleData && candleData.length > 0) {
        renderCandlestickChart(candleData, DOMElements.assetChartContainer);
        // После успешной загрузки можно обновить OHL в заголовке на основе новых свечей
        // updateAssetHeaderOHL(candleData);
      } else if (candleData && candleData.length === 0) {
        DOMElements.assetChartContainer.innerHTML = `<p class="p-m text-center">${t('noChartDataForPeriod', 'No chart data available for the selected period.')}</p>`;
        destroyChartInstance();
      } else {
        // null или undefined candleData (ошибка в fetchChartData)
        DOMElements.assetChartContainer.innerHTML = `<p class="p-m text-center">${t('couldNotLoadChartData', 'Could not load chart data.')}</p>`;
        destroyChartInstance();
      }
    }
  } catch (error) {
    console.error('[Asset Chart] Error refreshing chart data:', error);
    if (DOMElements.assetChartContainer) {
      DOMElements.assetChartContainer.innerHTML = `<p class="p-m text-center">${t('errorLoadingData', 'Error loading data.')}</p>`;
      destroyChartInstance();
    }
  } finally {
    setChartIsLoading(false);
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

// Функция для обновления OHL в заголовке (если потребуется)
// function updateAssetHeaderOHL(candleData) {
//   if (!candleData || candleData.length === 0) return;
//   const openPrice = candleData[0].o;
//   const highs = candleData.map(c => parseFloat(c.h)).filter(h => !isNaN(h));
//   const lows = candleData.map(c => parseFloat(c.l)).filter(l => !isNaN(l));
//   const highPrice = highs.length > 0 ? Math.max(...highs) : 'N/A';
//   const lowPrice = lows.length > 0 ? Math.min(...lows) : 'N/A';

//   if (DOMElements.assetDetailsOpen) DOMElements.assetDetailsOpen.textContent = formatPrice(openPrice); // Нужен formatPrice
//   if (DOMElements.assetDetailsHigh) DOMElements.assetDetailsHigh.textContent = formatPrice(highPrice);
//   if (DOMElements.assetDetailsLow) DOMElements.assetDetailsLow.textContent = formatPrice(lowPrice);
//   // Текущую цену и изменение % лучше брать из более часто обновляемого источника, если он есть,
//   // а не только из данных графика, которые могут быть для длинного периода.
// }
