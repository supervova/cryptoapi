// src/assets/js/pages/home.js

import { fetchData, fetchChartData } from '../markets/api.js';
import { state, setCryptoMeta } from '../markets/state.js';
import { getPair } from '../utils/currency.js';

const { Chart } = window;

const ASSETS_PATH_PREFIX = window.APP_CONFIG?.assetsBasePrefix || '';
const REFRESH_INTERVAL = 30000;

let chartInstance = null;
let chartContainer = null;
let chartLoader = null;
let chartError = null;

/**
 * Форматирует цену без HTML
 * @param {number} v - значение
 * @param {number} tick - тик
 * @returns {string} отформатированная цена
 */
const fmtPriceRaw = (v, tick = 0) => {
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

  const d = tick && tick < 0.01 ? 4 : 2;
  return p.toLocaleString('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
};

/**
 * Форматирует цену с HTML
 * @param {number} v - значение
 * @param {number} tick - тик
 * @returns {string} HTML строка
 */
const formatPrice = (v, tick) => {
  const s = fmtPriceRaw(v, tick);
  if (!s.includes('.') || s.includes('e')) return s;
  const [i, f] = s.split('.');
  return `${i.replace(/,/g, ' ')}.<small>${f}</small>`;
};

/**
 * Вычисляет изменение цены в процентах
 * @param {object} p - объект с current и dayago
 * @returns {number|null} процент изменения
 */
const calcChange = (p) =>
  p?.current && p?.dayago
    ? ((parseFloat(p.current) - parseFloat(p.dayago)) * 100) /
      parseFloat(p.dayago)
    : null;

/**
 * Создает строку таблицы для актива
 * @param {object} asset - данные актива
 * @param {object} cryptoMeta - метаданные криптовалют
 * @returns {string} HTML строка
 */
const createTableRow = (asset, cryptoMeta) => {
  const meta = cryptoMeta[asset.symbol] || {};
  const change = calcChange(asset.price);
  let cls = '';
  if (change > 0) {
    cls = 'is-positive';
  } else if (change < 0) {
    cls = 'is-negative';
  }
  const sign = change > 0 ? '+' : '';

  return `
    <tr class="e-assets__tr" data-asset-id="${asset.symbol}">
      <th scope="row">
        <div class="e-assets__symbol">${getPair(asset.symbol, cryptoMeta)}</div>
        <div class="e-assets__name">${meta.name ?? asset.symbol}</div>
      </th>
      <td class="e-assets__price">${formatPrice(asset.price?.current)}</td>
      <td class="e-assets__change ${cls}">${change == null ? '–' : `${sign}${change.toFixed(2)}%`}</td>
    </tr>`;
};

/**
 * Отрисовывает таблицу активов
 * @param {Array} assets - массив активов
 * @param {object} cryptoMeta - метаданные
 */
const renderTable = (assets, cryptoMeta) => {
  const tableBody = document.querySelector('.e-assets__table tbody');
  if (!tableBody) {
    console.error('[home] Table body not found for rendering.');
    return;
  }
  tableBody.innerHTML = assets
    .map((asset) => createTableRow(asset, cryptoMeta))
    .join('');
};

/**
 * Отрисовывает линейный график
 * @param {Array} chartData - данные для графика
 */
const renderLineChart = (chartData) => {
  if (!chartContainer) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const labels = chartData.map((d) => new Date(d.x));
  const data = chartData.map((d) => d.y);
  const currentLang = document.documentElement.lang || 'en';

  chartInstance = new Chart(chartContainer.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: 'hsl(254 88% 78% / 0.06)',
          borderColor: 'hsl(254 88% 78%)',
          borderWidth: 2,
          fill: true,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: 'hsl(254 88% 46%)',
          pointHoverBorderColor: 'hsl(254 88% 78%)',
          pointHoverBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'hsl(254 11% 18%)',
          titleColor: 'rgb(255 255 255 / 0.6)',
          titleFont: { weight: 'normal' },
          bodyColor: 'rgb(255 255 255 / 0.87)',
          bodyFont: { weight: 'bold' },
          borderWidth: 0,
          padding: 16,
          displayColors: false,
          callbacks: {
            title: (tooltipItems) => {
              const date = new Date(tooltipItems[0].parsed.x);
              return currentLang === 'en'
                ? date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : date.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
            },
            label: (context) => `$${context.raw}`,
          },
        },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'hour',
            displayFormats: {
              hour: currentLang === 'en' ? 'h a' : 'HH:mm',
            },
          },
          grid: {
            color: 'rgb(255 255 255 / 0.08)',
            drawTicks: false,
          },
          ticks: {
            color: 'rgb(255 255 255 / 0.6)',
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8,
            padding: 14,
          },
        },
        y: {
          position: 'right',
          grid: { color: 'rgb(255 255 255 / 0.08)' },
          ticks: {
            color: 'rgb(255 255 255 / 0.6)',
            callback: (value) => fmtPriceRaw(value),
          },
          beginAtZero: false,
          border: { display: false },
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
      elements: {
        line: {
          borderJoinStyle: 'round',
        },
      },
    },
  });
};

/**
 * Обновляет детали выбранного актива
 */
const updateAssetDetails = () => {
  const { asset, cryptoMeta } = state;
  if (!asset || !cryptoMeta) {
    return;
  }

  const meta = cryptoMeta[asset.symbol] || {};
  const change = calcChange(asset.price);

  const titleElems = document.querySelectorAll('.e-asset-details__title');
  const symbolElem = document.querySelector('.e-asset-details__symbol');
  const figureElem = document.querySelector('.e-asset-details__figure');
  const iconElem = document.querySelector('.e-asset-details__icon');
  const priceContainer = document.querySelector('.e-asset-details__price');
  const statsSpans = document.querySelectorAll('.e-asset-details__stats .nobr');

  if (
    !titleElems.length ||
    !symbolElem ||
    !figureElem ||
    !iconElem ||
    !priceContainer ||
    statsSpans.length < 3
  ) {
    console.warn('Asset details elements not found');
    return;
  }

  titleElems.forEach((el) => {
    const item = el;
    item.textContent = meta.name ?? asset.symbol;
  });

  symbolElem.textContent = getPair(asset.symbol, cryptoMeta);
  figureElem.dataset.fallback = asset.symbol.slice(0, 3);

  const iconFile = meta.icon || 'placeholder.svg';
  iconElem.src = `${ASSETS_PATH_PREFIX}/assets/img/cryptologos/${iconFile}`;
  iconElem.alt = meta.name ?? asset.symbol;

  const changeText =
    change !== null ? `${change > 0 ? '+' : ''}${change.toFixed(2)}%` : '–';
  let changeCls = '';
  if (change > 0) {
    changeCls = 'is-positive';
  } else if (change < 0) {
    changeCls = 'is-negative';
  }

  priceContainer.innerHTML = `
    ${formatPrice(asset.price?.current)}
    <small class="e-asset-details__price-change ${changeCls}">
      ${changeText}
    </small>
  `;

  const [openElem, maxElem, minElem] = statsSpans;
  openElem.innerHTML = formatPrice(asset.price?.dayago);
  maxElem.innerHTML = formatPrice(asset.price?.today?.max);
  minElem.innerHTML = formatPrice(asset.price?.today?.min);
};

/**
 * Обновляет график для выбранного актива
 */
const updateChart = async () => {
  const { asset } = state;
  if (!asset || !chartContainer) return;

  chartLoader.style.display = 'flex';
  chartError.style.display = 'none';

  try {
    const chartData = await fetchChartData(asset.symbol);
    if (chartData && Array.isArray(chartData) && chartData.length > 0) {
      const formattedChartData = chartData.map((d) => ({ x: d.x, y: d.c }));
      renderLineChart(formattedChartData);
      chartLoader.style.display = 'none';
    } else {
      throw new Error('No chart data received');
    }
  } catch (error) {
    console.error('Error updating chart:', error);
    chartError.style.display = 'flex';
    chartLoader.style.display = 'none';
  }
};

/**
 * Выбирает актив по ID
 * @param {string} assetId - идентификатор актива
 */
const selectAsset = (assetId) => {
  if (!state.allAssets) {
    return;
  }

  const newAsset = state.allAssets.find((a) => a.symbol === assetId);
  if (!newAsset) {
    return;
  }

  state.asset = newAsset;

  document
    .querySelectorAll('.e-assets__tr')
    .forEach((row) => row.removeAttribute('aria-current'));
  const newRow = document.querySelector(`[data-asset-id="${assetId}"]`);
  if (newRow) newRow.setAttribute('aria-current', 'true');

  updateAssetDetails();
  updateChart();
};

/**
 * Получает метаданные криптовалют
 * @returns {Promise<object|null>} метаданные или null
 */
const getCryptoData = async () => {
  try {
    const response = await fetch(
      `${ASSETS_PATH_PREFIX}/assets/data/crypto-meta.json`
    );
    if (!response.ok) throw new Error('Failed to fetch crypto meta');
    return await response.json();
  } catch (error) {
    console.error('Error fetching crypto meta data:', error);
    return null;
  }
};

/**
 * Обновляет данные активов и таблицу
 */
const refreshData = async () => {
  try {
    const { cryptoMeta, asset: currentAsset } = state;
    await fetchData(cryptoMeta);

    const { allAssets } = state;

    if (!allAssets || !cryptoMeta) {
      return;
    }

    const btc = allAssets.find((c) => c.symbol === 'BTC');
    const otherAssets = allAssets
      .filter((c) => c.rating >= 1 && c.rating <= 5 && c.symbol !== 'BTC')
      .slice(0, 5);

    const topAssets = btc ? [btc, ...otherAssets] : otherAssets;

    renderTable(topAssets, cryptoMeta);

    if (currentAsset) {
      const activeRow = document.querySelector(
        `[data-asset-id="${currentAsset.symbol}"]`
      );
      if (activeRow) activeRow.setAttribute('aria-current', 'true');

      const updatedAsset = allAssets.find(
        (a) => a.symbol === currentAsset.symbol
      );
      if (updatedAsset) {
        state.asset = updatedAsset;
        updateAssetDetails();
      }
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
  }
};

/**
 * Инициализирует приложение
 */
const init = async () => {
  chartContainer = document.querySelector('#markets-chart');
  chartLoader = document.getElementById('chart-loader');
  chartError = document.getElementById('chart-error');
  const assetsTable = document.querySelector('.e-assets__table tbody');

  if (!assetsTable || !chartContainer || !chartLoader || !chartError) {
    console.error('Essential elements not found, aborting init.');
    return;
  }

  try {
    const cryptoData = await getCryptoData();
    if (cryptoData) {
      setCryptoMeta(cryptoData);
    }

    await refreshData();

    if (state.allAssets && state.allAssets.length > 0) {
      selectAsset('BTC');
    } else {
      chartLoader.style.display = 'none';
      chartError.style.display = 'flex';
    }

    assetsTable.addEventListener('click', (event) => {
      const row = event.target.closest('.e-assets__tr');
      if (row && row.dataset.assetId) {
        selectAsset(row.dataset.assetId);
      }
    });

    setInterval(refreshData, REFRESH_INTERVAL);
  } catch (error) {
    console.error('Error initializing app:', error);
    chartError.style.display = 'flex';
    chartLoader.style.display = 'none';
  }
};

document.addEventListener('DOMContentLoaded', init);
