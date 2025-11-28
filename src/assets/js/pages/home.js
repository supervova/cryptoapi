// src/assets/js/pages/home.js

import { fetchData, fetchChartData } from '../markets/api.js';
import { state } from '../markets/state.js';
import { getPair } from '../utils/currency.js';
import { formatPrice as formatTablePrice } from '../table/formatting.js';

const { Chart } = window;

const REFRESH_INTERVAL = 30000;

let chartInstance = null;
let chartContainer = null;
let chartLoader = null;
let chartError = null;

const getCurrentLang = () => {
  if (typeof document !== 'undefined' && document.documentElement.lang) {
    return document.documentElement.lang;
  }
  return 'en';
};

/**
 * Форматирует цену с HTML
 * @param {number} v - значение
 * @param {number} tick - тик
 * @returns {string} HTML строка
 */
const formatPrice = (v, tick) => {
  const s = formatTablePrice(v, tick ? { tick } : {});
  if (!s || s === '–' || s.includes('e')) return s;

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  if (!hasComma && !hasDot) return s;

  const sep = hasComma && !hasDot ? ',' : '.';
  const [i, f] = s.split(sep);
  return `${i}${sep}<small>${f}</small>`;
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

const formatPercent = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '–';
  const currentLang = getCurrentLang();
  const sign = num > 0 ? '+' : num < 0 ? '-' : '';
  const absFixed = Math.abs(num).toFixed(2);
  const formattedAbs =
    currentLang === 'en' ? absFixed : absFixed.replace('.', ',');
  return `${sign}${formattedAbs}%`;
};

/**
 * Создает строку таблицы для актива
 * @param {object} asset - данные актива
 * @param {object} cryptoMeta - метаданные криптовалют
 * @returns {string} HTML строка
 */
const createTableRow = (asset, cryptoMeta) => {
  const directory = cryptoMeta || {};
  const meta = directory[asset.symbol] || {};
  const assetName = asset.name || meta.name || asset.symbol;
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
        <div class="e-assets__symbol">${getPair(asset.symbol, directory)}</div>
        <div class="e-assets__name">${assetName}</div>
      </th>
      <td class="e-assets__price">${formatPrice(asset.price?.current)}</td>
      <td class="e-assets__change ${cls}">${
        change == null ? '–' : formatPercent(change)
      }</td>
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
            callback: (value) => formatTablePrice(value),
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
  if (!asset) {
    return;
  }

  const directory = cryptoMeta || {};
  const meta = directory[asset.symbol] || {};
  const assetName = asset.name || meta.name || asset.symbol;
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
    item.textContent = assetName;
  });

  symbolElem.textContent = getPair(asset.symbol, directory);
  figureElem.dataset.fallback = asset.symbol.slice(0, 3);

  const iconPath = `/images/coins/${asset.symbol}.png`;
  iconElem.src = iconPath;
  iconElem.alt = assetName;

  const changeText = change !== null ? formatPercent(change) : '–';
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
 * Обновляет данные активов и таблицу
 */
const refreshData = async () => {
  try {
    await fetchData();

    const { allAssets, cryptoMeta, asset: currentAsset } = state;
    if (!Array.isArray(allAssets) || allAssets.length === 0) {
      return;
    }

    const directory = cryptoMeta || {};

    const btc = allAssets.find((c) => c.symbol === 'BTC');
    const otherAssets = allAssets
      .filter((c) => c.rating >= 1 && c.rating <= 5 && c.symbol !== 'BTC')
      .slice(0, 5);

    const topAssets = btc ? [btc, ...otherAssets] : otherAssets;

    renderTable(topAssets, directory);

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
    await refreshData();

    if (Array.isArray(state.allAssets) && state.allAssets.length > 0) {
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
