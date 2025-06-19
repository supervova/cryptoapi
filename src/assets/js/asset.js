// src/assets/js/asset.js

import * as DOMElements from './asset/dom.js';
import t, { initTranslations } from './markets/translate.js';
import { IS_DEVELOPMENT } from './asset/config.js';

// Импортируем логику управления графиком для страницы актива
import {
  handleAssetPeriodChange,
  handleAssetTimeframeChange,
  updateTimeframeOptionsForAssetPage,
  updateAssetHeader,
  refreshAssetChartData,
} from './asset/chart.js';

import { state as assetState } from './asset/state.js';

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
