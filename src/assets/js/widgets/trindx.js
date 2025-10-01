// src/assets/js/widgets/trindx.js

/**
 * TRINDX Widget Script
 *
 * This script fetches cryptocurrency data from the API, processes it,
 * and renders it into a table within the TRINDX widget. It is designed
 * to be self-contained and embedded in an iframe.
 */

const REFRESH_INTERVAL = 30000; // 30 seconds
const IS_DEVELOPMENT = window.APP_CONFIG?.env === 'development';
const ASSETS_PATH_PREFIX = window.APP_CONFIG?.assetsBasePrefix || '';
const API_URL_DEV = `${ASSETS_PATH_PREFIX}/assets/data/crypto-data.json`;
const CURRENT_LANG = window.APP_CONFIG?.lang || 'en';

// --- Simplified State Management ---
const state = {
  cryptoMeta: {},
  allAssets: [],
  isLoading: true,
  currentRequestController: null,
};

// --- Currency Utils ---
const DEFAULT_QUOTE_CURRENCY = 'USD';

const getQuoteCurrency = (symbol, cryptoMeta) => {
  if (!symbol || !cryptoMeta) {
    return DEFAULT_QUOTE_CURRENCY;
  }
  return cryptoMeta[symbol.toUpperCase()]?.quote || DEFAULT_QUOTE_CURRENCY;
};

const getPair = (symbol, cryptoMeta) => {
  if (!symbol) {
    return `---${DEFAULT_QUOTE_CURRENCY}`;
  }
  const quote = getQuoteCurrency(symbol, cryptoMeta);
  return `${symbol.toUpperCase()}-${quote}`;
};

// --- Utility & Formatting Functions ---

/**
 * Simple translation fallback.
 * @param {string} key - Translation key (ignored).
 * @param {string} fallback - The fallback string.
 * @returns {string} The fallback string.
 */
const t = (key, fallback) => fallback;

/**
 * Formats a price number into a string without HTML.
 * @param {number} v - The value.
 * @returns {string} The formatted price.
 */
const fmtPriceRaw = (v) => {
  if (v == null) return '–';
  const p = Number(v);
  if (!Number.isFinite(p)) return '–';
  if (p === 0) return '0';
  if (Math.abs(p) < 1e-8) return p.toExponential(2);

  if (Math.abs(p) < 1) {
    const e = Math.floor(Math.log10(Math.abs(p)));
    const d = Math.min(8, Math.max(4, Math.abs(e) + 3));
    return p.toFixed(d).replace(/0+$/, '').replace(/\.$/, '');
  }

  const d = 2;
  return p.toLocaleString('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
};

/**
 * Formats a price with HTML for fractional part.
 * @param {number} v - The value.
 * @returns {string} HTML string.
 */
const formatPrice = (v) => {
  const s = fmtPriceRaw(v);
  if (!s.includes('.') || s.includes('e')) return s;
  const [i, f] = s.split('.');
  return `${i.replace(/,/g, ' ')}.<small>${f}</small>`;
};

/**
 * Calculates the percentage change between two prices.
 * @param {object} p - Price object with 'current' and 'dayago'.
 * @returns {number|null} The percentage change or null.
 */
const calcChange = (p) =>
  p?.current && p?.dayago
    ? ((parseFloat(p.current) - parseFloat(p.dayago)) * 100) /
      parseFloat(p.dayago)
    : null;

/**
 * Displays an error message in the table.
 * @param {string} message - The error message to display.
 */
function displayErrorState(message) {
  const tableBody = document.querySelector('.e-assets tbody');
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="3" class="e-assets__error">${message}</td>
    </tr>`;
  document.body.dispatchEvent(new CustomEvent('widget:rendered'));
}

// --- Rendering ---

/**
 * Creates a table row HTML string for a given asset.
 * @param {object} asset - The asset data.
 * @returns {string} The HTML string for the table row.
 */
const createTableRow = (asset) => {
  const meta = state.cryptoMeta[asset.symbol] || {};
  const change = calcChange(asset.price);
  let cls = '';
  if (change > 0) cls = 'is-positive';
  else if (change < 0) cls = 'is-negative';
  const sign = change > 0 ? '+' : '';

  return `
    <tr class="e-assets__tr" data-asset-id="${asset.symbol}">
      <th scope="row">
        <div class="e-assets__symbol">${getPair(asset.symbol, state.cryptoMeta)}</div>
        <div class="e-assets__name">${meta.name ?? asset.symbol}</div>
      </th>
      <td class="e-assets__price">${formatPrice(asset.price?.current)}</td>
      <td class="e-assets__change ${cls}">${change == null ? '–' : `${sign}${change.toFixed(2)}%`}</td>
    </tr>`;
};

/**
 * Renders the entire table with the provided assets.
 * @param {Array} assets - The array of assets to render.
 */
const renderTable = (assets) => {
  const tableBody = document.querySelector('.e-assets tbody');
  if (!tableBody) {
    if (IS_DEVELOPMENT) console.error('[trindx] Table body not found.');
    return;
  }
  if (assets.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3" class="e-assets__empty">${t('noAssets', 'No assets to display.')}</td></tr>`;
  } else {
    tableBody.innerHTML = assets.map(createTableRow).join('');
  }
  document.body.dispatchEvent(new CustomEvent('widget:rendered'));
};

// --- API & Data Processing ---

/**
 * Processes the raw data received from the API.
 * @param {any} responseData - The data from the API response.
 */
function processData(responseData) {
  let actualCryptoDataObject;

  if (IS_DEVELOPMENT) {
    if (
      Array.isArray(responseData) &&
      responseData.length === 2 &&
      responseData[0] === 'OK'
    ) {
      [, actualCryptoDataObject] = responseData;
    } else {
      actualCryptoDataObject = responseData;
    }
  } else {
    if (
      !Array.isArray(responseData) ||
      responseData.length < 2 ||
      responseData[0] !== 'OK' ||
      typeof responseData[1] !== 'object'
    ) {
      if (IS_DEVELOPMENT)
        console.error('API response format error:', responseData);
      displayErrorState(
        t('serverFormatError', 'Server sent data in an unexpected format.')
      );
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
      console.error('Valid asset data not found:', actualCryptoDataObject);
    displayErrorState(t('noValidAssetData', 'No valid asset data available.'));
    return;
  }

  const newAssets = Object.keys(actualCryptoDataObject).map((symbol) => {
    const upperSymbol = symbol.toUpperCase();
    const meta = state.cryptoMeta[upperSymbol] || {
      name: upperSymbol,
      icon: null,
    };
    const assetApiData = actualCryptoDataObject[symbol];

    return {
      symbol: upperSymbol,
      name: meta.name || upperSymbol,
      id: upperSymbol,
      icon: meta.icon
        ? `${ASSETS_PATH_PREFIX}/assets/img/cryptologos/${meta.icon}`
        : null,
      ...assetApiData,
    };
  });

  state.allAssets = newAssets;
}

/**
 * Fetches the main asset data from the server.
 */
async function fetchData() {
  if (state.currentRequestController) {
    state.currentRequestController.abort();
  }
  const controller = new AbortController();
  state.currentRequestController = controller;

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
      throw new Error(
        `${t('dataLoadError', 'Data could not be loaded.')} Status: ${response.status}`
      );
    }

    const data = await response.json();
    processData(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      if (IS_DEVELOPMENT) console.log('Fetch aborted');
      return;
    }
    if (IS_DEVELOPMENT) console.error('Failed to fetch crypto data:', error);
    displayErrorState(
      `${t('dataLoadError', 'Data couldn’t be loaded. Try again soon.')}`
    );
  } finally {
    if (state.currentRequestController === controller) {
      state.currentRequestController = null;
    }
    state.isLoading = false;
  }
}

/**
 * Fetches crypto metadata.
 */
async function getCryptoData() {
  try {
    const response = await fetch(
      `${ASSETS_PATH_PREFIX}/assets/data/crypto-meta.json`
    );
    if (!response.ok) throw new Error('Failed to fetch crypto meta');
    state.cryptoMeta = await response.json();
  } catch (error) {
    if (IS_DEVELOPMENT)
      console.error('Error fetching crypto meta data:', error);
    // Provide minimal fallback meta
    state.cryptoMeta = {
      BTC: { name: 'Bitcoin', icon: 'btc.svg' },
      ETH: { name: 'Ethereum', icon: 'eth.svg' },
    };
  }
}

/**
 * Main data refresh and rendering cycle.
 */
const refreshData = async () => {
  await fetchData();

  if (!state.allAssets || !state.cryptoMeta) {
    return;
  }

  // Filter assets by rating, exclude BTC, and take the top 6
  const topAssets = state.allAssets
    .filter((c) => c.rating >= 1 && c.rating <= 5 && c.symbol !== 'BTC')
    .slice(0, 6);

  renderTable(topAssets);
};

// --- Initialization ---

/**
 * Initializes the widget.
 */
const init = async () => {
  const table = document.querySelector('.e-assets');
  if (!table) {
    console.error('[trindx] Essential table element not found, aborting init.');
    return;
  }

  // Add a loading indicator
  const tableBody = table.querySelector('tbody');
  if (tableBody) {
    tableBody.innerHTML = `<tr><td colspan="3" class="e-assets__loading">${t('loading', 'Loading...')}</td></tr>`;
    document.body.dispatchEvent(new CustomEvent('widget:rendered'));
  }

  // Add click listener for asset rows
  table.addEventListener('click', (event) => {
    const row = event.target.closest('.e-assets__tr');
    if (row && row.dataset.assetId) {
      const assetId = row.dataset.assetId;
      const url = `https://cryptoapi.ai/${CURRENT_LANG}/markets/${assetId.toLowerCase()}`;
      window.open(url, '_blank', 'noopener');
    }
  });

  // Add hover effect to rows
  const style = document.createElement('style');
  style.textContent = '.e-assets .e-assets__tr { cursor: pointer; }';
  document.head.appendChild(style);

  await getCryptoData();
  await refreshData();

  setInterval(refreshData, REFRESH_INTERVAL);
};

document.addEventListener('DOMContentLoaded', init);

