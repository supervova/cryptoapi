// ./src/assets/js/asset-chart.js

/* global Chart */

/**
 * Интерфейс для хранения данных о цене актива
 * @typedef {Object} PriceData
 * @property {string} time - Временная метка в формате ISO
 * @property {number} price - Цена актива
 */

/**
 * Интерфейс для периода данных актива
 * @typedef {Object} AssetPeriod
 * @property {string} period - Идентификатор периода ('1d', '1w', '1m', 'all')
 * @property {string} timeframe - Временной интервал ('1m', '15m', '1h', '1d', '1w')
 * @property {string} title - Заголовок для графика
 * @property {PriceData[]} data - Массив данных о ценах
 */

/**
 * Интерфейс для информации об активе
 * @typedef {Object} Asset
 * @property {string} id - Уникальный идентификатор актива
 * @property {string} name - Название актива
 * @property {string} symbol - Символ актива
 * @property {AssetPeriod[]} periods - Массив периодов с данными
 */

/**
 * Интерфейс для конфигурации графика
 * @typedef {Object} ChartConfig
 * @property {string} assetId - Идентификатор актива
 * @property {string} period - Идентификатор периода ('1d', '1w', '1m', 'all')
 * @property {string} timeframe - Временной интервал ('1m', '15m', '1h', '1d', '1w')
 */

document.addEventListener('DOMContentLoaded', () => {
  const chartCanvas = document.getElementById('markets-chart');
  const chartLoader = document.getElementById('chart-loader');
  const chartError = document.getElementById('chart-error');
  let assetChart = null;

  // Текущая конфигурация графика
  const currentConfig = {
    assetId: 'bitcoin',
    period: '1d',
    timeframe: '15m',
  };

  /**
   * Форматирует время в зависимости от таймфрейма
   * @param {string} isoString - Время в формате ISO
   * @param {string} timeframe - Временной интервал
   * @returns {string} Отформатированное время
   */
  function formatTimeLabel(isoString, timeframe) {
    const date = new Date(isoString);

    switch (timeframe) {
      case '1min':
      case '5m':
      case '15m':
      case '30m':
      case '1h':
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      case '1d':
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      case '1w':
      case '1mo':
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
      default:
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    }
  }

  /**
   * Загружает данные из JSON-файла
   * TODO: @see fetchAPIData()
   * @returns {Promise<{assets: Asset[]}>} Объект с массивом активов
   */
  async function loadFixtureData() {
    const response = await fetch(
      '/projects/cryptoapi.ai/assets/data/fixtures/asset-data.json'
    );
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Получает данные периода актива по конфигурации
   * @param {{assets: Asset[]}} data - Объект с массивом активов
   * @param {ChartConfig} config - Конфигурация графика
   * @returns {AssetPeriod|null} Данные периода выбранного актива или null, если не найдено
   */
  function getAssetPeriodData(data, config) {
    const asset = data.assets.find((a) => a.id === config.assetId);
    if (!asset) return null;

    const periodData = asset.periods.find((p) => p.period === config.period);
    return periodData || null;
  }

  /**
   * Загружает данные из API
   * @param {ChartConfig} config - Конфигурация графика
   * @returns {Promise<AssetPeriod>} Данные периода выбранного актива
   */
  async function fetchAPIData(config) {
    // TODO: разработать под production запрос к API
    // const url = `https://api.example.com/assets/${config.assetId}/history?period=${config.period}&timeframe=${config.timeframe}`;
    // const response = await fetch(url);
    // return await response.json();

    // Для тестирования возвращаем данные из fixture
    const fixtureData = await loadFixtureData();
    return getAssetPeriodData(fixtureData, config);
  }

  /**
   * Отрисовывает график с данными
   * @param {AssetPeriod} periodData - Данные периода актива
   */
  function drawChart(periodData) {
    // Если график существует, уничтожаем его
    if (assetChart) {
      assetChart.destroy();
    }

    const ctx = chartCanvas.getContext('2d');
    const { timeframe } = periodData;

    assetChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: periodData.data.map((item) =>
          formatTimeLabel(item.time, timeframe)
        ),
        datasets: [
          {
            backgroundColor: 'hsl(254 88% 78% / 0.06)',
            borderColor: 'hsl(254 88% 78%)',
            borderWidth: 2,
            data: periodData.data.map((item) => item.price),
            fill: true,
            label: periodData.title,
            tension: 0,

            // Настройки ключевых точек
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: 'hsl(254 88% 46%)',
            pointHoverBorderColor: 'hsl(254 88% 78%)', // Цвет границы при наведении
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
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
                return `${tooltipItems[0].label}`;
              },
              label: (context) => {
                return `${context.raw} $`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgb(255 255 255 / 0.08)',
              drawTicks: false,
            },
            ticks: {
              color: 'rgb(255 255 255 / 0.6)',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
              padding: 16,
            },
          },
          y: {
            position: 'right',
            grid: {
              color: 'rgb(255 255 255 / 0.08)',
            },
            ticks: {
              color: 'rgb(255 255 255 / 0.6)',
              callback: (value) => {
                return `${value} `;
              },
            },
            beginAtZero: false,
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
  }

  /**
   * Основная функция для рендеринга графика
   * @param {ChartConfig} [config] - Конфигурация графика, если не указана, используется текущая
   */
  async function renderChart(config = currentConfig) {
    try {
      // Отображаем индикатор загрузки
      chartLoader.style.display = 'flex';
      chartError.style.display = 'none';

      // Получаем данные из источника (fixtures или API)
      const periodData = await fetchAPIData(config);

      if (!periodData || !periodData.data || periodData.data.length === 0) {
        throw new Error('Нет данных для отображения');
      }

      // Отрисовываем график
      drawChart(periodData);

      // Скрываем индикатор загрузки
      chartLoader.style.display = 'none';
    } catch {
      // console.error('Ошибка при рендеринге графика:', error);
      chartError.style.display = 'flex';
      chartLoader.style.display = 'none';
    }
  }

  // Инициализация графика
  renderChart();

  // Обработчик нажатия на кнопку периода
  document.querySelectorAll('[data-role="chart-period"]').forEach((button) => {
    button.addEventListener('click', () => {
      const period = button.getAttribute('data-period');
      if (period && period !== currentConfig.period) {
        currentConfig.period = period;
        renderChart();
      }
    });
  });

  // Обработчик нажатия на кнопку таймфрейма
  document
    .querySelectorAll('[data-role="chart-timeframe"]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const timeframe = button.getAttribute('data-timeframe');
        if (timeframe && timeframe !== currentConfig.timeframe) {
          currentConfig.timeframe = timeframe;
          renderChart();
        }
      });
    });

  // Обработчик нажатия на кнопку выбора актива
  document.querySelectorAll('[data-role="chart-asset"]').forEach((button) => {
    button.addEventListener('click', () => {
      const assetId = button.getAttribute('data-asset-id');
      if (assetId && assetId !== currentConfig.assetId) {
        currentConfig.assetId = assetId;
        renderChart();
      }
    });
  });

  // Автоматическое обновление графика каждые 5 минут
  setInterval(() => renderChart(), 5 * 60 * 1000);
});
