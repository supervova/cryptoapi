// src/assets/js/asset.js

import * as DOMElements from './asset/dom.js';
import t, { initTranslations } from './markets/translate.js';
import { IS_DEVELOPMENT } from './asset/config.js';
import { formatPrice } from './table/formatting.js';

// Импортируем логику управления графиком для страницы актива
import {
  handleAssetPeriodChange,
  handleAssetTimeframeChange,
  updateTimeframeOptionsForAssetPage,
  updateAssetHeader,
  refreshAssetChartData,
} from './asset/chart.js';

import { state as assetState } from './asset/state.js';

const DASH = '—';

const formatPriceSafe = (value, options) => {
  const formatted = formatPrice(value, options);
  return formatted === '–' ? DASH : formatted;
};

const parseNumeric = (value) => {
  if (value === null || value === undefined) return NaN;
  if (typeof value === 'number') return value;
  const raw = String(value).replace(/\s/g, '');
  const normalized =
    raw.includes(',') && raw.includes('.')
      ? raw.replace(/,/g, '')
      : raw.replace(',', '.');
  const num = Number(normalized);
  return Number.isFinite(num) ? num : NaN;
};

function updateStatsBar({
  forecastMiddle,
  forecastMin,
  forecastMax,
  forecastChangePct,
  trindx,
  rsi30,
  // currentPrice,
}) {
  if (DOMElements.statsBar.trindx && trindx !== undefined && trindx !== null) {
    const numericTrindx = Number(trindx);
    if (Number.isFinite(numericTrindx)) {
      DOMElements.statsBar.trindx.textContent = numericTrindx.toFixed(2);
    }
  }

  if (DOMElements.statsBar.rsi30 && rsi30 !== undefined && rsi30 !== null) {
    const numericRsi = Number(rsi30);
    if (Number.isFinite(numericRsi)) {
      DOMElements.statsBar.rsi30.textContent = numericRsi.toFixed(0);
    }
  }

  if (
    DOMElements.statsBar.forecastMiddle?.length &&
    forecastMiddle !== undefined &&
    forecastMiddle !== null
  ) {
    const formattedForecast = formatPriceSafe(forecastMiddle);

    if (formattedForecast !== DASH) {
      DOMElements.statsBar.forecastMiddle.forEach((el) => {
        if (!el) return;
        const needsCurrency = Boolean(el.closest('summary'));
        el.textContent = `${needsCurrency ? '$' : ''}${formattedForecast}`;
        el.classList.remove('is-success', 'is-error');
      });
    }
  }

  if (
    DOMElements.statsBar.forecastChange &&
    forecastChangePct !== undefined &&
    forecastChangePct !== null
  ) {
    const numericChange = parseNumeric(forecastChangePct);
    const isNumber = Number.isFinite(numericChange);
    const isNegative = isNumber && numericChange < 0;
    const isPositive = isNumber && numericChange > 0;

    if (isNumber) {
      DOMElements.statsBar.forecastChange.textContent = `${isPositive ? '+' : ''}${numericChange.toFixed(2)}%`;
      DOMElements.statsBar.forecastChange.classList.toggle(
        'is-error',
        isNegative
      );
      DOMElements.statsBar.forecastChange.classList.toggle(
        'is-success',
        isPositive
      );

      if (DOMElements.statsBar.forecastMiddle?.length) {
        DOMElements.statsBar.forecastMiddle.forEach((el) => {
          if (!el) return;
          el.classList.toggle('is-error', isNegative);
          el.classList.toggle('is-success', isPositive);
        });
      }
    }
  }

  if (
    DOMElements.statsBar.forecastMinMax &&
    forecastMin !== undefined &&
    forecastMin !== null &&
    forecastMax !== undefined &&
    forecastMax !== null
  ) {
    const label =
      DOMElements.statsBar.forecastMinMax.dataset.label || 'Min–max:';
    const minText = formatPriceSafe(forecastMin, { tick: 0.001 });
    const maxText = formatPriceSafe(forecastMax, { tick: 0.001 });
    if (minText !== DASH || maxText !== DASH) {
      DOMElements.statsBar.forecastMinMax.textContent = `${label} ${minText}—${maxText}`;
    }
  }
}

/**
 * Инициализация страницы детальной информации об активе.
 */
async function initializeAssetPage() {
  try {
    initTranslations();

    const appConfig = window.APP_CONFIG || {};
    const {
      assetTicker,
      assetName,
      assetIconPath,
      assetOpenPrice,
      assetHighPrice,
      assetLowPrice,
      assetCurrentPrice,
      assetPriceChange,
      assetPriceDayAgo,
      assetPriceTomorrowMiddle,
      assetPriceTomorrowMin,
      assetPriceTomorrowMax,
      assetTomorrowChangePct,
      assetTrindx,
      assetRsi30,
    } = appConfig;

    if (!assetTicker) {
      console.error('Asset ticker is missing in APP_CONFIG.');
      if (DOMElements.assetChartContainer) {
        DOMElements.assetChartContainer.innerHTML = `<p class="p-3 text-center">${t('errorConfigMissing', 'Configuration data is missing.')}</p>`;
      }
      return;
    }

    updateAssetHeader({
      ticker: assetTicker.toUpperCase(),
      name: assetName,
      iconPath: assetIconPath,
      open: assetOpenPrice,
      high: assetHighPrice,
      low: assetLowPrice,
      current: assetCurrentPrice,
      priceDayAgo: assetPriceDayAgo,
    });

    updateStatsBar({
      forecastMiddle: assetPriceTomorrowMiddle,
      forecastMin: assetPriceTomorrowMin,
      forecastMax: assetPriceTomorrowMax,
      forecastChangePct: assetTomorrowChangePct,
      trindx: assetTrindx,
      rsi30: assetRsi30,
      currentPrice: assetCurrentPrice,
    });

    if (
      DOMElements.periodRadioButtons.length > 0 &&
      DOMElements.timeframeRadioButtons.length > 0
    ) {
      updateTimeframeOptionsForAssetPage(assetState.chart.currentPeriod);
    }

    // Лишний запрос данных при загрузке, который скрывал проблему
    await refreshAssetChartData({
      ticker: assetState.currentAsset.ticker,
      period: assetState.chart.currentPeriod,
      timeframe: assetState.chart.currentTimeframe,
      container: DOMElements.assetChartContainer,
    });

    // Навешиваем обработчики на смену периода и таймфрейма
    DOMElements.periodRadioButtons.forEach((radio) => {
      radio.addEventListener('change', handleAssetPeriodChange);
    });

    DOMElements.timeframeRadioButtons.forEach((radio) => {
      radio.addEventListener('change', handleAssetTimeframeChange);
    });

    if (IS_DEVELOPMENT) {
      console.log('Asset page initialized:', {
        ticker: assetState.currentAsset.ticker,
        appConfig,
        state: assetState,
        domElements: {
          name: DOMElements.assetHeader.name,
          symbol: DOMElements.assetHeader.symbol,
          icon: DOMElements.assetHeader.icon,
        },
      });
    }
  } catch (error) {
    console.error('Failed to initialize asset page:', error);
    if (DOMElements.assetChartContainer) {
      DOMElements.assetChartContainer.innerHTML = `<p class="p-3 text-center">${t('errorPageInit', 'Error initializing page.')}</p>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeAssetPage();
});
