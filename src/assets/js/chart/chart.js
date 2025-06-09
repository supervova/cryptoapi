/**
 * @file Модуль для создания и управления интерактивным свечным графиком с помощью
 * Chart.js.
 * Настройка внешнего вида, форматирование данных и обработка изменения размеров.
 * @path src/assets/js/chart/chart.js
 */

import t from '../markets/translate.js';
import { formatPrice } from '../table/formatting.js';
import { IS_DEVELOPMENT } from '../markets/config.js';

let chartInstance = null;

/**
 * Получение текущего экземпляра графика
 * @returns Текущий экземпляр Chart.js или null
 */
export function getChartInstance() {
  return chartInstance;
}

/**
 * Уничтожение текущего экземпляра графика
 */
export function destroyChartInstance() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

/**
 * Отрисовка свечного графика с данными OHLC
 * @param candleData - Массив данных свечей с полями x, o, h, l, c
 * @param containerElement - DOM-элемент контейнера для размещения графика
 */
export function renderCandlestickChart(candleData, containerElement) {
  if (!containerElement) {
    if (IS_DEVELOPMENT) {
      console.error('[Chart] Container element not found for rendering chart.');
    }
    return;
  }

  destroyChartInstance();

  const wrapper = document.createElement('div');
  const canvas = document.createElement('canvas');
  wrapper.appendChild(canvas);
  containerElement.replaceChildren(wrapper);
  const ctx = canvas.getContext('2d');

  if (!candleData || candleData.length === 0) {
    const messageElement = document.createElement('p');
    messageElement.className = 'p-3 text-center';
    messageElement.textContent = t(
      'noDataToDisplayChart',
      'No data to display chart.'
    );
    containerElement.replaceChildren(messageElement);
    return;
  }

  const processedData = candleData.map((d) => ({
    x: new Date(d.x).getTime(),
    o: Number(d.o),
    h: Number(d.h),
    l: Number(d.l),
    c: Number(d.c),
  }));

  const DURATION = 240;
  const colorUp = 'var(--color-ink-text-success)';
  const colorDown = 'var(--color-ink-2ry-error)';
  const colorUnchanged = 'var(--color-ink-3ry-error)';

  // eslint-disable-next-line no-undef
  chartInstance = new Chart(ctx, {
    type: 'candlestick',
    data: {
      datasets: [
        {
          barThickness: 7,
          color: { up: colorUp, down: colorDown, unchanged: colorUnchanged },
          borderColor: 'inherit',
          data: processedData,
        },
      ],
    },
    options: {
      animation: { duration: DURATION },
      maintainAspectRatio: false,
      onResize: (chart, size) => {
        const dataset = chart.config.data.datasets[0];
        const allData = dataset.data;

        if (!allData || allData.length === 0) {
          // eslint-disable-next-line no-param-reassign
          chart.options.scales.x.min = undefined;
          // eslint-disable-next-line no-param-reassign
          chart.options.scales.x.max = undefined;
          chart.update('none');
          return;
        }

        const barThickness = dataset.barThickness || 7;
        // В пикселях
        const desiredSpaceBetweenCandles = 5;
        const candleCellWidth = barThickness + desiredSpaceBetweenCandles;

        let maxVisibleCandles = Math.floor(size.width / candleCellWidth);
        maxVisibleCandles = Math.max(
          1, // Показать хотя бы одну свечу
          Math.min(maxVisibleCandles, allData.length)
        );

        let newXMin;
        let newXMax;

        if (allData.length <= maxVisibleCandles) {
          newXMin = allData[0].x;
          newXMax = allData[allData.length - 1].x;
        } else {
          // Показать последние 'maxVisibleCandles'
          newXMin = allData[allData.length - maxVisibleCandles].x;
          newXMax = allData[allData.length - 1].x;
        }

        const currentXMin = chart.options.scales.x.min;
        const currentXMax = chart.options.scales.x.max;

        if (newXMin !== currentXMin || newXMax !== currentXMax) {
          // eslint-disable-next-line no-param-reassign
          chart.options.scales.x.min = newXMin;
          // eslint-disable-next-line no-param-reassign
          chart.options.scales.x.max = newXMax;
          // Обновить график в новом размере
          chart.update('none');
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'var(--color-bg-level-02)',
          titleColor: 'rgb(255 255 255 / 0.6)',
          titleFont: { weight: 'normal' },
          bodyColor: 'rgb(255 255 255 / 0.87)',
          bodyFont: { weight: 'bold' },
          borderWidth: 0,
          padding: 16,
          displayColors: false,
          callbacks: {
            label(context) {
              const dp = context.raw;
              return dp
                ? [
                    `O: ${formatPrice(dp.o)}`,
                    `H: ${formatPrice(dp.h)}`,
                    `L: ${formatPrice(dp.l)}`,
                    `C: ${formatPrice(dp.c)}`,
                  ]
                : context.dataset.label || '';
            },
          },
        },
      },
      responsive: true,
      scales: {
        x: {
          type: 'time',
          // ... или 'linear', если значения x не строго упорядочены по времени
          distribution: 'series',
          grid: { color: 'rgb(255 255 255 / 0.08)', drawTicks: false },
          // Добавляем отступ между линией оси и надписями
          offset: true,
          ticks: {
            autoSkip: true,
            // Увеличиваем горизонтальный отступ, чтобы не пытаться впихнуть слишком много меток
            autoSkipPadding: 15,
            color: 'rgb(255 255 255 / 0.6)',
            // Не поворачивать надписи шкалы ради экономии места
            maxRotation: 0,
            padding: 12,
            // 'data', 'labels' или 'auto'
            source: 'auto',
          },
          time: {
            displayFormats: {
              // Форматы для разных временных интервалов
              millisecond: 'HH:mm:ss.SSS',
              second: 'HH:mm:ss',
              minute: 'HH:mm',
              // 'HH' - только час
              hour: 'HH:mm',
              // 'dd' — только число
              day: 'MMM d',
              week: 'MMM d, yyyy',
              month: 'MMM yyyy',
              quarter: 'QQQ yyyy',
              year: 'yyyy',
            },
            tooltipFormat: 'yyyy-MM-dd HH:mm',
          },
        },
        y: {
          beginAtZero: false,
          border: { display: true, color: 'rgb(255 255 255 / 0.08)', width: 1 },
          grid: { color: 'rgb(255 255 255 / 0.08)' },
          position: 'right',
          ticks: { color: 'rgb(255 255 255 / 0.6)', padding: 12 },
        },
      },
    },
  });
}
