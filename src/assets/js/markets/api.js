// assets/js/markets/api.js
import * as DOMElements from './dom.js';
import * as marketState from './state.js';
import displayErrorState from '../table/error-state.js';
import { patchTableBody } from '../table/render.js';
import t from './translate.js';
import {
  API_URL_DEV,
  ASSETS_PATH_PREFIX,
  CURRENT_LANG,
  IS_DEVELOPMENT,
} from './config.js';

import { applySortAndFilter } from '../table/sort-filter.js';
import { getTimezoneOffset, cleanup, announceUpdate } from './utils.js';

export const testExport = () => 'ok';

/**
 * Обработка полученных данных с API
 * Извлекает данные из ответа API, обновляет состояние активов и применяет сортировку/фильтрацию.
 * @param {any} responseData - Данные, полученные от API
 * @param {object} cryptoData - Метаданные криптовалют
 */
function processData(responseData, cryptoData) {
  let actualCryptoDataObject;

  if (IS_DEVELOPMENT) {
    if (
      Array.isArray(responseData) &&
      responseData.length === 2 &&
      responseData[0] === 'OK' &&
      typeof responseData[1] === 'object'
    ) {
      [, actualCryptoDataObject] = responseData;
    } else if (
      typeof responseData === 'object' &&
      !Array.isArray(responseData)
    ) {
      actualCryptoDataObject = responseData;
    } else {
      if (IS_DEVELOPMENT)
        console.error(
          'Unexpected format for development data in crypto-data.json:',
          responseData
        );
      displayErrorState(
        t('invalidDevData', 'Invalid development data format.')
      );
      marketState.setIsLoading(false); // Uses setter
      if (DOMElements.table)
        DOMElements.table.setAttribute('aria-busy', 'false');
      return;
    }
  } else {
    // Production data validation
    if (
      !Array.isArray(responseData) ||
      responseData.length < 2 ||
      responseData[0] !== 'OK' ||
      typeof responseData[1] !== 'object' ||
      responseData[1] === null
    ) {
      if (IS_DEVELOPMENT)
        console.error(
          'Production API response format error or status not OK:',
          responseData
        );
      displayErrorState(
        t(
          'serverFormatError',
          'Server sent data in an unexpected format or an error status.'
        )
      );
      marketState.setIsLoading(false); // Uses setter
      if (DOMElements.table)
        DOMElements.table.setAttribute('aria-busy', 'false');
      return;
    }
    [, actualCryptoDataObject] = responseData;
  }

  if (
    !actualCryptoDataObject ||
    typeof actualCryptoDataObject !== 'object' ||
    Array.isArray(actualCryptoDataObject)
  ) {
    if (IS_DEVELOPMENT)
      console.error(
        'actualCryptoDataObject is not a valid object:',
        actualCryptoDataObject
      );
    displayErrorState(t('noValidAssetData', 'No valid asset data available.'));
    marketState.setIsLoading(false); // Uses setter
    if (DOMElements.table) DOMElements.table.setAttribute('aria-busy', 'false');
    return;
  }

  const newApiSymbols = Object.keys(actualCryptoDataObject).map((s) =>
    s.toUpperCase()
  );
  const nextAllAssets = [];
  const processedSymbols = new Set();

  // Используем marketState.state.allAssets
  const currentAssets = Array.isArray(marketState.state.allAssets)
    ? marketState.state.allAssets
    : [];

  currentAssets.forEach((existingAsset) => {
    const upperSymbol = existingAsset.symbol.toUpperCase();
    if (newApiSymbols.includes(upperSymbol)) {
      // Используем переданный cryptoData
      const meta = (cryptoData && cryptoData[upperSymbol]) || {
        name: upperSymbol,
        icon: null,
      };
      const newAssetDataForSymbol =
        actualCryptoDataObject[upperSymbol] ||
        actualCryptoDataObject[existingAsset.symbol];

      if (
        typeof newAssetDataForSymbol === 'object' &&
        newAssetDataForSymbol !== null
      ) {
        Object.assign(existingAsset, newAssetDataForSymbol, {
          name: meta.name || upperSymbol,
          icon: meta.icon
            ? `${ASSETS_PATH_PREFIX}/assets/img/cryptologos/${meta.icon}`
            : null,
          symbol: upperSymbol,
        });
        nextAllAssets.push(existingAsset);
      } else if (IS_DEVELOPMENT) {
        console.warn(
          `Incorrect or missing new data for existing symbol ${upperSymbol}. Asset data:`,
          newAssetDataForSymbol
        );
      }
      processedSymbols.add(upperSymbol);
    } else if (IS_DEVELOPMENT) {
      console.log(
        `Asset ${upperSymbol} no longer in API response, will be removed.`
      );
    }
  });

  newApiSymbols.forEach((upperSymbol) => {
    if (!processedSymbols.has(upperSymbol)) {
      // Используем переданный cryptoData
      const meta = (cryptoData && cryptoData[upperSymbol]) || {
        name: upperSymbol,
        icon: null,
      };
      const assetApiData =
        actualCryptoDataObject[upperSymbol] ||
        actualCryptoDataObject[upperSymbol.toLowerCase()];

      if (typeof assetApiData === 'object' && assetApiData !== null) {
        nextAllAssets.push({
          symbol: upperSymbol,
          name: meta.name || upperSymbol,
          id: upperSymbol,
          icon: meta.icon
            ? `${ASSETS_PATH_PREFIX}/assets/img/cryptologos/${meta.icon}`
            : null,
          watchlist: false,
          chart_data: [],
          ...assetApiData,
        });
      } else {
        if (IS_DEVELOPMENT)
          console.warn(
            `Data for new symbol ${upperSymbol} is not an object or is null:`,
            assetApiData
          );
        nextAllAssets.push({
          symbol: upperSymbol,
          name: meta.name || upperSymbol,
          id: upperSymbol,
          icon: meta.icon
            ? `${ASSETS_PATH_PREFIX}/assets/img/cryptologos/${meta.icon}`
            : null,
          price: {
            current: null,
            yesterday: { middle: null },
            today: { min: null, max: null, middle: null },
          },
          rating: null,
          risk: null,
          TRANDX: null,
          RSI7: null,
          watchlist: false,
          chart_data: [],
        });
      }
    }
  });

  marketState.setAllAssets(nextAllAssets); // Setter correctly updates marketState.state.allAssets
  applySortAndFilter(marketState.state.isLoading); // Pass isLoading from marketState.state
}

export async function fetchData(cryptoData) {
  // Используем marketState.state.currentRequestController
  if (marketState.state.currentRequestController) {
    marketState.state.currentRequestController.abort();
  }
  const controller = new AbortController();
  marketState.setCurrentRequestController(controller); // Setter updates marketState.state.currentRequestController

  const params = new URLSearchParams();
  params.append('jsonfather', 'true');

  try {
    const options = IS_DEVELOPMENT
      ? { method: 'GET', signal: controller.signal }
      : {
          method: 'POST',
          body: params.toString(),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          credentials: 'include',
          signal: controller.signal,
        };

    const fullApiUrl = IS_DEVELOPMENT
      ? API_URL_DEV
      : `${window.location.origin}/${CURRENT_LANG ? `${CURRENT_LANG}/` : ''}json/trindxrating`;

    const response = await fetch(fullApiUrl, options);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html') && !IS_DEVELOPMENT) {
        window.location.href = `/auth?returl=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      throw new Error(
        `${t('somethingWentWrong', 'Something went wrong while loading the page.')} status: ${response.status}`
      );
    }

    const data = await response.json();
    const wasLoading = marketState.state.isLoading; // Access isLoading from marketState.state

    processData(data, cryptoData);

    if (wasLoading) {
      marketState.setIsLoading(false); // Uses setter
      if (DOMElements.table)
        DOMElements.table.setAttribute('aria-busy', 'false');
      patchTableBody();
      announceUpdate(
        t('allDataLoaded', 'All data has been successfully loaded.')
      );
    } else {
      announceUpdate(t('dataUpdated', 'The data has been updated.'));
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      if (IS_DEVELOPMENT) console.log('Fetch aborted');
      return;
    }

    cleanup(); // cleanup likely uses marketState.setUpdateIntervalId which is fine
    if (IS_DEVELOPMENT) console.error('Failed to fetch crypto data:', error);

    // Access isLoading from marketState.state
    if (marketState.state.isLoading) {
      marketState.setIsLoading(false); // Uses setter
      if (DOMElements.table)
        DOMElements.table.setAttribute('aria-busy', 'false');
      const currentLoadingRow = document.getElementById('loading-row');
      if (currentLoadingRow) currentLoadingRow.remove();
    }
    displayErrorState(
      `${t('dataLoadError', 'Data couldn’t be loaded. Try again soon.')} ${error.message}`
    );
  } finally {
    // Access currentRequestController from marketState.state
    if (marketState.state.currentRequestController === controller) {
      marketState.setCurrentRequestController(null); // Uses setter
    }
  }
}

export async function fetchChartData(ticker, period = '1d', timeframe = '1m') {
  if (!ticker) {
    if (IS_DEVELOPMENT)
      console.error('[Chart] Ticker is required to fetch chart data.');
    return null;
  }

  let chartCandleData = null;

  const timezoneoffset = getTimezoneOffset();

  if (IS_DEVELOPMENT) {
    const devFixtureUrl = `${ASSETS_PATH_PREFIX}/assets/data/fixtures/crypto-data-candles.json`;
    try {
      const response = await fetch(devFixtureUrl);
      if (!response.ok)
        throw new Error(
          `Failed to load dev chart data fixture (${devFixtureUrl}), status: ${response.status}`
        );
      const responseData = await response.json();

      if (
        Array.isArray(responseData) &&
        responseData.length === 2 &&
        Array.isArray(responseData[0]) &&
        responseData[0][0] === 'OK' &&
        Array.isArray(responseData[1])
      ) {
        [, chartCandleData] = responseData;
      } else if (
        Array.isArray(responseData) &&
        responseData.every((item) => typeof item === 'object' && 'x' in item)
      ) {
        chartCandleData = responseData;
      } else {
        console.warn(
          `[Chart] Dev chart data fixture (${devFixtureUrl}) has unexpected format for ticker ${ticker}. Received:`,
          responseData
        );
        chartCandleData = [];
      }
    } catch (error) {
      console.error(
        '[Chart] Error fetching or parsing dev chart data fixture:',
        error
      );
      chartCandleData = null;
    }
  } else {
    const currentAppLang =
      CURRENT_LANG ||
      (window.location.pathname.split('/')[1]?.match(/^[a-z]{2}$/)
        ? window.location.pathname.split('/')[1]
        : '');
    const fullProdApiUrl = `${window.location.origin}/${currentAppLang ? `${currentAppLang}/` : ''}json/pricechart`;

    const chartParams = new URLSearchParams();
    chartParams.append('ticker', ticker.toUpperCase());
    chartParams.append('period', period);
    chartParams.append('timeframe', timeframe);
    chartParams.append('timezoneoffset', timezoneoffset.toString());
    chartParams.append('jsonfather', 'true');

    try {
      const response = await fetch(fullProdApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: chartParams.toString(),
      });

      if (!response.ok) {
        let errorDetail = `Request failed with status: ${response.status}`;
        try {
          const errorJson = await response.json();
          if (
            Array.isArray(errorJson) &&
            errorJson.length > 0 &&
            typeof errorJson[1] === 'string'
          ) {
            const [, errorMessage] = errorJson;
            errorDetail = errorMessage;
          } else {
            errorDetail = JSON.stringify(errorJson);
          }
        } catch (e) {
          /* Не удалось распарсить JSON ошибки, используем статус */
        }
        throw new Error(errorDetail);
      }

      const responseData = await response.json();
      if (
        Array.isArray(responseData) &&
        responseData.length === 2 &&
        responseData[0] === 'OK' &&
        Array.isArray(responseData[1])
      ) {
        [, chartCandleData] = responseData;
      } else {
        console.error(
          '[Chart] Unexpected API response format for chart data:',
          responseData
        );
        throw new Error(
          t('serverFormatError', 'Invalid chart data format from server.')
        );
      }
    } catch (error) {
      console.error(
        `[Chart] Error fetching prod chart data for ${ticker} (${period}, ${timeframe}):`,
        error.message
      );
      chartCandleData = null;
    }
  }
  return chartCandleData;
}
