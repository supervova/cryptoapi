/* eslint-disable no-console */
// assets/js/widgets/btc.js

const { Chart } = window;

const REFRESH_INTERVAL = 30000; // 30 секунд

// #region THEME & COLORS

// Общие цвета для всех тем
const baseColors = {
  backgroundColor: 'hsl(254 88% 78% / 0.06)',
  borderColor: 'hsl(254 88% 78%)',
  pointHoverBackgroundColor: 'hsl(254 88% 46%)',
  pointHoverBorderColor: 'hsl(254 88% 78%)',
  tooltipBackgroundColor: 'hsl(254 11% 18%)',
  tooltipBodyColor: 'rgb(255 255 255 / 0.87)',
};

// Уникальные цвета для каждой темы
const themeOverrides = {
  light: {
    tooltipTitleColor: 'hsl(254 88% 78%)',
    gridColor: 'rgb(0 0 0 / 0.08)',
    ticksColor: 'rgb(0 0 0 / 0.6)',
  },
  dark: {
    tooltipTitleColor: 'rgb(255 255 255 / 0.6)',
    gridColor: 'rgb(255 255 255 / 0.08)',
    ticksColor: 'rgb(255 255 255 / 0.6)',
  },
};

// Итоговый объект с цветами, объединяющий базовые и уникальные
const THEME_COLORS = {
  light: { ...baseColors, ...themeOverrides.light },
  dark: { ...baseColors, ...themeOverrides.dark },
};

// #endregion

// #region UTILS

/**
 * Форматирует цену без HTML-тегов.
 * @param {number} v - Значение для форматирования.
 * @param {number} tick - Минимальный шаг цены (для определения точности).
 * @returns {string} Отформатированная строка с ценой.
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
 * Форматирует цену, оборачивая дробную часть в тег <small>.
 * @param {number} v - Значение для форматирования.
 * @param {number} tick - Минимальный шаг цены.
 * @returns {string} HTML-строка с отформатированной ценой.
 */
const formatPrice = (v, tick) => {
  const s = fmtPriceRaw(v, tick);
  if (!s.includes('.') || s.includes('e')) return s;
  const [i, f] = s.split('.');
  return `${i.replace(/,/g, ' ')}.<small>${f}</small>`;
};

/**
 * Вычисляет процентное изменение цены.
 * @param {object} p - Объект с ценами { current, dayago }.
 * @returns {number|null} Процент изменения или null.
 */
const calcChange = (p) =>
  p?.current && p?.dayago
    ? ((parseFloat(p.current) - parseFloat(p.dayago)) * 100) /
      parseFloat(p.dayago)
    : null;

// #endregion

// #region DOM & RENDERING

let chartInstance = null;

/**
 * Отрисовывает линейный график.
 * @param {HTMLCanvasElement} chartContainer - Canvas элемент для графика.
 * @param {Array} chartData - Данные для построения графика.
 */
const renderLineChart = (chartContainer, chartData) => {
  if (!chartContainer) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const labels = chartData.map((d) => new Date(d.x));
  const data = chartData.map((d) => d.y);
  const currentLang = document.documentElement.lang || 'en';
  const currentTheme = document.body.dataset.theme || 'dark';
  const colors = THEME_COLORS[currentTheme] || THEME_COLORS.dark;

  chartInstance = new Chart(chartContainer.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderWidth: 2,
          fill: true,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: colors.pointHoverBackgroundColor,
          pointHoverBorderColor: colors.pointHoverBorderColor,
          pointHoverBorderWidth: 2,
        },
      ],
    },
    options: {
      animation: {
        duration: 1,
        onComplete: () => {
          document.body.dispatchEvent(new CustomEvent('widget:rendered'));
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: -16,
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: colors.tooltipBackgroundColor,
          titleColor: colors.tooltipTitleColor,
          titleFont: { weight: 'normal' },
          bodyColor: colors.tooltipBodyColor,
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
            label: (context) => `${context.raw}`,
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
            color: colors.gridColor,
            drawTicks: false,
          },
          ticks: {
            color: colors.ticksColor,
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8,
            padding: 14,
            callback(value, index) {
              if (index === 0) {
                return null;
              }
              return this.getLabelForValue(value);
            },
          },
        },
        y: {
          position: 'right',
          grid: { color: colors.gridColor },
          ticks: {
            color: colors.ticksColor,
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
 * Обновляет информацию в шапке виджета.
 * @param {object} asset - Объект с данными по активу (BTC).
 */
const updateBtcDetails = (asset) => {
  const priceContainer = document.querySelector('.e-asset-details__price');
  const statsSpans = document.querySelectorAll('.e-asset-details__stats .nobr');

  if (!priceContainer || statsSpans.length < 3) {
    console.warn('[BTC Widget] Details elements not found');
    return;
  }

  const change = calcChange(asset.price);
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

// #endregion

// #region DATA FETCHING

const ASSETS_PATH_PREFIX = window.APP_CONFIG?.assetsBasePrefix || '';
const IS_DEVELOPMENT = window.APP_CONFIG?.env === 'development';

/**
 * Загружает данные о цене BTC.
 * @returns {Promise<object|null>} Данные по BTC или null.
 */
async function fetchBtcPriceData() {
  const url = IS_DEVELOPMENT
    ? `${ASSETS_PATH_PREFIX}/assets/data/fixtures/crypto-data.json`
    : `${window.location.origin}/json/trindxrating`;

  try {
    const response = await fetch(url, {
      method: IS_DEVELOPMENT ? 'GET' : 'POST',
      body: IS_DEVELOPMENT ? null : 'jsonfather=true',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Status ${response.status}`);

    const responseData = await response.json();
    const marketData = IS_DEVELOPMENT ? responseData : responseData[1];

    if (marketData && marketData.BTC) {
      return marketData.BTC;
    }
    throw new Error('BTC data not found in response');
  } catch (error) {
    console.error('[BTC Widget] Failed to fetch price data:', error);
    return null;
  }
}

/**
 * Загружает данные для графика BTC.
 * @returns {Promise<Array|null>} Массив данных для графика или null.
 */
async function fetchBtcChartData() {
  const ticker = 'BTC';
  const timezoneoffset = new Date().getTimezoneOffset();

  if (IS_DEVELOPMENT) {
    const devFixtureUrl = `${ASSETS_PATH_PREFIX}/assets/data/fixtures/crypto-data-candles.json`;
    try {
      const response = await fetch(devFixtureUrl);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const responseData = await response.json();
      return responseData[1] || [];
    } catch (error) {
      console.error('[BTC Widget] Error fetching dev chart data:', error);
      return null;
    }
  }

  const prodApiUrl = `${window.location.origin}/json/pricechart`;
  const chartParams = new URLSearchParams({
    ticker,
    period: '1d',
    timeframe: '1m',
    timezoneoffset,
    jsonfather: 'true',
  });

  try {
    const response = await fetch(prodApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include',
      body: chartParams.toString(),
    });
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const responseData = await response.json();
    if (responseData && responseData[0] === 'OK') {
      return responseData[1];
    }
    throw new Error('Invalid chart data format from server.');
  } catch (error) {
    console.error('[BTC Widget] Error fetching prod chart data:', error);
    return null;
  }
}

// #endregion

/**
 * Основная функция обновления виджета.
 */
async function updateWidget() {
  const chartContainer = document.querySelector('#markets-chart');
  const chartLoader = document.getElementById('chart-loader');
  const chartError = document.getElementById('chart-error');

  if (!chartContainer || !chartLoader || !chartError) {
    console.error('[BTC Widget] Essential DOM elements not found.');
    return;
  }

  chartLoader.style.display = 'flex';
  chartError.style.display = 'none';

  try {
    const [priceData, chartData] = await Promise.all([
      fetchBtcPriceData(),
      fetchBtcChartData(),
    ]);

    if (priceData) {
      updateBtcDetails(priceData);
    }

    if (chartData && chartData.length > 0) {
      const formattedChartData = chartData.map((d) => ({ x: d.x, y: d.c }));
      renderLineChart(chartContainer, formattedChartData);
    } else {
      throw new Error('No chart data available to render.');
    }

    chartLoader.style.display = 'none';
  } catch (error) {
    console.error('[BTC Widget] Error updating widget:', error);
    chartError.style.display = 'flex';
    chartLoader.style.display = 'none';
    document.body.dispatchEvent(new CustomEvent('widget:rendered'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Передаем конфигурацию из Twig в JS
  window.APP_CONFIG = {
    env: document.body.dataset.env || 'production',
    assetsBasePrefix: document.body.dataset.assetsPrefix || '',
  };

  if (!window.Chart) {
    console.error('[BTC Widget] Chart.js is not loaded.');
    const chartError = document.getElementById('chart-error');
    if (chartError) {
      chartError.style.display = 'flex';
      chartError.textContent = 'Chart library failed to load.';
    }
    document.body.dispatchEvent(new CustomEvent('widget:rendered'));
    return;
  }

  updateWidget();
  setInterval(updateWidget, REFRESH_INTERVAL);
});
