// assets/js/chart/ui.js
import t from '../markets/translate.js';
import * as marketState from '../markets/state.js';
import * as DOMElements from '../markets/dom.js';
import {
  IS_DEVELOPMENT,
  VALID_TIMEFRAMES_FOR_PERIOD,
} from '../markets/config.js';
import { fetchChartData } from '../markets/api.js';
import { renderCandlestickChart, destroyChartInstance } from './chart.js';
import { formatPrice } from '../table/formatting.js';
import { calculateChange24hValue } from '../table/sort-filter.js';

/**
 * Подготовка и загрузка данных графика для выбранного актива
 * @param {HTMLElement} chartButton - DOM-элемент кнопки графика с dataset.assetSymbol
 */
export async function prepareAndFetchChartData(chartButton) {
  const { assetSymbol } = chartButton.dataset;
  marketState.setCurrentChartTicker(assetSymbol); // Setter is fine

  // Используем marketState.state.allAssets
  const assetData = marketState.state.allAssets.find(
    (a) => a.symbol === assetSymbol
  );

  if (!assetData) {
    if (IS_DEVELOPMENT) {
      console.error(`[Chart] Asset data for ${assetSymbol} not found.`);
    }
    if (DOMElements.assetChartContainer) {
      DOMElements.assetChartContainer.innerHTML = `<p class="text-center">${t('assetDataNotFound', 'Asset data not found.')}</p>`;
    }
    [
      DOMElements.drawerChartSymbol,
      DOMElements.drawerChartPrice,
      DOMElements.drawerChartPriceChange,
      DOMElements.drawerChartOpen,
      DOMElements.drawerChartHigh,
      DOMElements.drawerChartLow,
    ].forEach((element) => {
      if (element) {
        // eslint-disable-next-line no-param-reassign
        element.textContent = '---';
      }
    });
    return;
  }

  const assetName = assetData.name || assetSymbol;

  if (DOMElements.drawerChart) {
    if (DOMElements.drawerChartIcon && DOMElements.drawerChartIconFallback) {
      if (assetData.icon) {
        DOMElements.drawerChartIcon.src = assetData.icon;
        DOMElements.drawerChartIcon.alt = assetName;
        DOMElements.drawerChartIcon.style.display = '';
        DOMElements.drawerChartIconFallback.style.display = 'none';
        DOMElements.drawerChartIcon.onerror = () => {
          DOMElements.drawerChartIcon.style.display = 'none';
          DOMElements.drawerChartIconFallback.textContent = assetSymbol
            .substring(0, 3)
            .toUpperCase();
          DOMElements.drawerChartIconFallback.style.display = 'inline-flex';
          DOMElements.drawerChartIcon.onerror = null;
        };
      } else {
        DOMElements.drawerChartIcon.style.display = 'none';
        DOMElements.drawerChartIconFallback.textContent = assetSymbol
          .substring(0, 3)
          .toUpperCase();
        DOMElements.drawerChartIconFallback.style.display = 'inline-flex';
      }
    }
    if (DOMElements.drawerChartTitleElements) {
      DOMElements.drawerChartTitleElements.forEach((element) => {
        // eslint-disable-next-line no-param-reassign
        element.textContent = assetName;
      });
    }
    if (DOMElements.drawerChartSymbol) {
      DOMElements.drawerChartSymbol.textContent = `${assetSymbol}-USD`;
    }
    if (DOMElements.drawerChartPrice) {
      DOMElements.drawerChartPrice.childNodes[0].nodeValue = `${formatPrice(assetData.price?.current)} `;
    }
    if (DOMElements.drawerChartPriceChange && assetData.price) {
      const change24h = calculateChange24hValue(assetData.price);
      if (change24h !== null && !Number.isNaN(change24h)) {
        DOMElements.drawerChartPriceChange.textContent = `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%`;
        DOMElements.drawerChartPriceChange.classList.toggle(
          'is-positive',
          change24h > 0
        );
        DOMElements.drawerChartPriceChange.classList.toggle(
          'is-negative',
          change24h < 0
        );
        DOMElements.drawerChartPriceChange.style.display = '';
      } else {
        DOMElements.drawerChartPriceChange.textContent = '–';
        DOMElements.drawerChartPriceChange.className =
          'e-asset-details__price-change'; // Reset classes
        DOMElements.drawerChartPriceChange.style.display = 'none';
      }
    }
    const todayPrice = assetData.price?.today;
    if (DOMElements.drawerChartHigh) {
      DOMElements.drawerChartHigh.textContent =
        todayPrice?.max !== undefined ? formatPrice(todayPrice.max) : '–';
    }
    if (DOMElements.drawerChartLow) {
      DOMElements.drawerChartLow.textContent =
        todayPrice?.min !== undefined ? formatPrice(todayPrice.min) : '–';
    }
    if (DOMElements.drawerChartOpen) {
      DOMElements.drawerChartOpen.textContent = '...';
    }
  }

  if (DOMElements.assetChartContainer) {
    DOMElements.assetChartContainer.innerHTML = `<p class="is-loading-state p-2 text-center">${t('loadingChartData', 'Loading chart data...')}</p>`;
  }

  const initialPeriodRadio = DOMElements.periodRadioButtons.find(
    (r) => r.checked
  );
  if (initialPeriodRadio) {
    marketState.setCurrentChartPeriod(initialPeriodRadio.value); // Setter is fine
  }

  // Используем marketState.state.currentChartPeriod и marketState.state.currentChartTimeframe
  const chartCandleData = await fetchChartData(
    assetSymbol, // This is local const assetSymbol from chartButton.dataset
    marketState.state.currentChartPeriod,
    marketState.state.currentChartTimeframe
  );

  if (DOMElements.drawerChartOpen) {
    DOMElements.drawerChartOpen.textContent =
      chartCandleData &&
      chartCandleData.length > 0 &&
      chartCandleData[0]?.o !== undefined
        ? formatPrice(chartCandleData[0].o)
        : '–';
  }

  if (DOMElements.assetChartContainer) {
    if (chartCandleData && chartCandleData.length > 0) {
      renderCandlestickChart(chartCandleData, DOMElements.assetChartContainer);
    } else if (chartCandleData && chartCandleData.length === 0) {
      DOMElements.assetChartContainer.innerHTML = `<p class="p-2 text-center">${t('noChartDataForPeriod', 'No chart data available for the selected period.')}</p>`;
      destroyChartInstance();
    } else {
      // null or undefined chartCandleData
      DOMElements.assetChartContainer.innerHTML = `<p class="p-2 text-center">${t('unableToLoadChartData', 'Unable to load chart data. Please go to the ‘Contact Us’ section and report the issue to support.')}</p>`;
      destroyChartInstance();
    }
  }
}

/**
 * Обновление доступных временных интервалов для выбранного периода
 * @param {string} selectedPeriodValue - Строковое значение выбранного периода
 */
export function updateTimeframeOptions(selectedPeriodValue) {
  const validTimeframes =
    VALID_TIMEFRAMES_FOR_PERIOD[selectedPeriodValue] || [];
  // Используем marketState.state.currentChartTimeframe для чтения
  let newActiveTimeframeValue = marketState.state.currentChartTimeframe;

  if (
    !validTimeframes.includes(marketState.state.currentChartTimeframe) &&
    validTimeframes.length > 0
  ) {
    [newActiveTimeframeValue] = validTimeframes;
  } else if (validTimeframes.length === 0) {
    newActiveTimeframeValue = null;
  }
  marketState.setCurrentChartTimeframe(newActiveTimeframeValue); // Setter is fine

  DOMElements.timeframeRadioButtons.forEach((radioElement) => {
    const timeframeValue = radioElement.value;
    const labelAction = radioElement.closest('.e-menu__action');
    const isValid = validTimeframes.includes(timeframeValue);

    // eslint-disable-next-line no-param-reassign
    radioElement.disabled = !isValid;
    if (labelAction) {
      labelAction.classList.toggle('is-disabled', !isValid);
    }
    // Используем marketState.state.currentChartTimeframe для сравнения
    // eslint-disable-next-line no-param-reassign
    radioElement.checked =
      isValid && timeframeValue === marketState.state.currentChartTimeframe;
  });

  if (DOMElements.drawerChartTimeframeMenu) {
    const summary =
      DOMElements.drawerChartTimeframeMenu.querySelector('summary');
    const activeRadio = DOMElements.timeframeRadioButtons.find(
      (r) => r.checked
    );
    if (summary && activeRadio) {
      summary.childNodes[0].nodeValue = `${activeRadio.dataset.shortcut || activeRadio.value} `;
    } else if (summary) {
      summary.childNodes[0].nodeValue = '--- ';
    }
  }
  if (IS_DEVELOPMENT) {
    // Используем marketState.state.currentChartTimeframe для лога
    console.log(
      `[Chart] Timeframe options updated for period "${selectedPeriodValue}". New current timeframe: "${marketState.state.currentChartTimeframe}"`
    );
  }
}

/**
 * Обновление данных графика с текущими параметрами
 */
export async function refreshChartData() {
  // Используем marketState.state.* для чтения
  if (IS_DEVELOPMENT) {
    console.log(
      `[Chart Debug] refreshChartData. Ticker: ${marketState.state.currentChartTicker}, Period: ${marketState.state.currentChartPeriod}, Timeframe: ${marketState.state.currentChartTimeframe}`
    );
  }
  if (!marketState.state.currentChartTicker) {
    if (IS_DEVELOPMENT) {
      console.warn('[Chart] Ticker not set, cannot refresh chart.');
    }
    return;
  }

  if (DOMElements.assetChartContainer) {
    DOMElements.assetChartContainer.innerHTML = `<p class="is-loading-state p-2 text-center">${t('loadingChartData', 'Loading chart data...')}</p>`;
  }
  if (DOMElements.drawerChartOpen) {
    DOMElements.drawerChartOpen.textContent = '...';
  }

  // Используем marketState.state.* для чтения при вызове fetchChartData
  const chartCandleData = await fetchChartData(
    marketState.state.currentChartTicker,
    marketState.state.currentChartPeriod,
    marketState.state.currentChartTimeframe
  );

  if (DOMElements.drawerChartOpen) {
    DOMElements.drawerChartOpen.textContent =
      chartCandleData &&
      chartCandleData.length > 0 &&
      chartCandleData[0]?.o !== undefined
        ? formatPrice(chartCandleData[0].o)
        : '–';
  }

  if (DOMElements.assetChartContainer) {
    if (chartCandleData && chartCandleData.length > 0) {
      renderCandlestickChart(chartCandleData, DOMElements.assetChartContainer);
    } else if (chartCandleData && chartCandleData.length === 0) {
      DOMElements.assetChartContainer.innerHTML = `<p class="p-2 text-center">${t('noChartDataForPeriod', 'No chart data available for the selected period.')}</p>`;
      destroyChartInstance();
    } else {
      // null or undefined chartCandleData
      DOMElements.assetChartContainer.innerHTML = `<p class="p-2 text-center">${t('couldNotLoadChartData', 'Could not load chart data.')}</p>`;
      destroyChartInstance();
    }
  }
}

/**
 * Обработка изменения периода графика
 * @param {Event} event - Событие изменения значения радиокнопки
 */
export function handlePeriodChange(event) {
  const selectedPeriod = event.target.value;
  const selectedShortcut = event.target.dataset.shortcut || selectedPeriod;

  // Используем marketState.state.currentChartPeriod для чтения
  if (marketState.state.currentChartPeriod !== selectedPeriod) {
    marketState.setCurrentChartPeriod(selectedPeriod); // Setter is fine
    if (IS_DEVELOPMENT) {
      // Используем marketState.state.currentChartPeriod для лога
      console.log(
        `[Chart] Period changed to: ${marketState.state.currentChartPeriod}`
      );
    }

    if (DOMElements.drawerChartPeriodMenu) {
      const summary =
        DOMElements.drawerChartPeriodMenu.querySelector('summary');
      if (summary) {
        summary.childNodes[0].nodeValue = `${selectedShortcut} `;
      }
    }
    // Используем marketState.state.currentChartPeriod для передачи в updateTimeframeOptions
    updateTimeframeOptions(marketState.state.currentChartPeriod);
    refreshChartData();
  }
  if (DOMElements.drawerChartPeriodMenu?.hasAttribute('open')) {
    DOMElements.drawerChartPeriodMenu.removeAttribute('open');
  }
}

/**
 * Обработка изменения временного интервала графика
 * @param {Event} event - Событие изменения значения радиокнопки
 */
export function handleTimeframeChange(event) {
  const selectedTimeframe = event.target.value;
  const selectedShortcut = event.target.dataset.shortcut || selectedTimeframe;

  // Используем marketState.state.currentChartTimeframe для чтения
  if (marketState.state.currentChartTimeframe !== selectedTimeframe) {
    marketState.setCurrentChartTimeframe(selectedTimeframe); // Setter is fine
    if (IS_DEVELOPMENT) {
      // Используем marketState.state.currentChartTimeframe для лога
      console.log(
        `[Chart] Timeframe changed to: ${marketState.state.currentChartTimeframe}`
      );
    }

    if (DOMElements.drawerChartTimeframeMenu) {
      const summary =
        DOMElements.drawerChartTimeframeMenu.querySelector('summary');
      if (summary) {
        summary.childNodes[0].nodeValue = `${selectedShortcut} `;
      }
    }
    refreshChartData();
  }
  if (DOMElements.drawerChartTimeframeMenu?.hasAttribute('open')) {
    DOMElements.drawerChartTimeframeMenu.removeAttribute('open');
  }
}
