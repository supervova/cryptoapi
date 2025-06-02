// src/assets/js/asset.js

import t, { initTranslations } from './markets/translate.js';
import * as DOMElements from './asset/dom.js'; // DOM для страницы актива
import { IS_DEVELOPMENT } from './asset/config.js';
import { state as assetState } from './asset/state.js'; // Состояние страницы актива

// Импортируем логику управления графиком для страницы актива
import {
  initializeChartWithData,
  updateTimeframeOptionsForAssetPage,
  handleAssetPeriodChange,
  handleAssetTimeframeChange,
} from './asset/chart.js';

/**
 * Инициализация страницы детальной информации об активе.
 */
async function initializeAssetPage() {
  try {
    initTranslations();

    const appConfig = window.APP_CONFIG || {};
    const {
      assetTicker,
      initialCandleData,
      // initialChartPeriod и initialChartTimeframe уже установлены в assetState при его инициализации из APP_CONFIG
    } = appConfig;

    if (!assetTicker) {
      console.error('Asset ticker is missing in APP_CONFIG.');
      if (DOMElements.assetChartContainer) {
        DOMElements.assetChartContainer.innerHTML = `<p class="p-m text-center">${t('errorConfigMissing', 'Configuration data is missing.')}</p>`;
      }
      return;
    }

    // Обновляем доступность опций таймфрейма на основе начального периода из состояния
    // и устанавливаем активные радио-кнопки.
    // assetState.chart.currentPeriod должен быть уже инициализирован из APP_CONFIG.
    if (
      DOMElements.periodRadioButtons.length > 0 &&
      DOMElements.timeframeRadioButtons.length > 0
    ) {
      updateTimeframeOptionsForAssetPage(assetState.chart.currentPeriod);
    }

    // Инициализация и первая отрисовка графика с данными из APP_CONFIG
    if (DOMElements.assetChartContainer) {
      initializeChartWithData(
        initialCandleData,
        DOMElements.assetChartContainer
      );
    } else {
      console.error('Chart container #asset-chart not found.');
    }

    // Навешиваем обработчики на меню периода/таймфрейма
    DOMElements.periodRadioButtons.forEach((radio) => {
      radio.addEventListener('change', handleAssetPeriodChange);
    });

    DOMElements.timeframeRadioButtons.forEach((radio) => {
      radio.addEventListener('change', handleAssetTimeframeChange);
    });

    if (IS_DEVELOPMENT) {
      console.log(
        `Asset page initialized for: ${assetState.currentAsset.ticker}`
      ); // Берем тикер из состояния
      console.log('Initial APP_CONFIG used for state:', appConfig); // appConfig как он пришел
      console.log('Current asset page state:', assetState);
    }
  } catch (error) {
    console.error('Failed to initialize asset page:', error);
    if (DOMElements.assetChartContainer) {
      DOMElements.assetChartContainer.innerHTML = `<p class="p-m text-center">${t('errorPageInit', 'Error initializing page.')}</p>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', initializeAssetPage);
