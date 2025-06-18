// src/assets/js/chart/chart.js

/**
 * @file Модуль для создания и управления интерактивным свечным графиком с помощью
 * Chart.js.
 * Настройка внешнего вида, форматирование данных и обработка изменения размеров.
 */
import t from '../markets/translate.js';
import { formatPrice } from '../table/formatting.js';
// import { IS_DEVELOPMENT } from '../markets/config.js';

const { Chart } = window;

/**
 * Проверяет и регистрирует плагин для финансовых графиков
 */
function ensureFinancialPlugin() {
  const fp = window['chartjs-chart-financial'] || {};
  const Ctl = fp.CandlestickController || fp.FinancialController;
  const El = fp.CandlestickElement;
  if (Ctl && El && !Chart.registry.controllers.has(Ctl.id)) {
    Chart.register(Ctl, El);
  } else {
    /* dev-сборка иногда загружает плагин после бандла → ждём onload */
    window.addEventListener('load', () => {
      const again = window['chartjs-chart-financial'] || {};
      if (again.CandlestickController && again.CandlestickElement) {
        Chart.register(again.CandlestickController, again.CandlestickElement);
      }
    });
  }
}

ensureFinancialPlugin();

const BAR_WIDTH = 7;
const DURATION = 240;
let chartInstance = null; // хранит текущий экземпляр Chart.js

// Актуальный scroll-контейнер
let currentScrollDiv = null;

// Кнопки прокрутки
const scrollBtns = {
  start: document.querySelector(
    '[data-role="chart-scroller"][data-target="start"]'
  ),
  end: document.querySelector(
    '[data-role="chart-scroller"][data-target="end"]'
  ),
};

/**
 * Обновляет состояние кнопки прокрутки графика
 * @param {HTMLElement|null} btn - HTML-элемент кнопки
 * @param {Object} options - Параметры состояния
 * @param {boolean} options.hidden - Флаг видимости кнопки
 * @param {boolean} options.disabled - Флаг активности кнопки
 * @returns {void}
 */
function setBtnState(btn, { hidden, disabled }) {
  if (!btn) return;
  btn.classList.toggle('is-hidden', !!hidden);
  if (disabled) btn.setAttribute('disabled', 'disabled');
  else btn.removeAttribute('disabled');
}

/**
 * Обновляет состояние кнопок прокрутки в зависимости от положения скролла графика
 * @returns {void}
 */
function updateScrollButtons() {
  if (!currentScrollDiv) return;
  const { scrollLeft, scrollWidth, clientWidth } = currentScrollDiv;
  const atStart = scrollLeft < 4;
  const atEnd = scrollLeft > scrollWidth - clientWidth - 4;

  // показываем кнопки, если график шире контейнера
  const need = scrollWidth > clientWidth + 4;
  setBtnState(scrollBtns.start, {
    hidden: !need,
    disabled: atStart,
  });
  setBtnState(scrollBtns.end, {
    hidden: !need,
    disabled: atEnd,
  });
}

// Хэндлеры кликов
scrollBtns.start?.addEventListener('click', () => {
  if (currentScrollDiv) {
    currentScrollDiv.scrollTo({ left: 0, behavior: 'smooth' });
  }
});

scrollBtns.end?.addEventListener('click', () => {
  if (currentScrollDiv) {
    currentScrollDiv.scrollTo({
      left: currentScrollDiv.scrollWidth,
      behavior: 'smooth',
    });
  }
});

// Пересчитываем при ресайзе окна
window.addEventListener('resize', updateScrollButtons);

/**
 * Рисует (или перерисовывает) свечной график.
 * @param {Array<Object>} candles    [{x,o,h,l,c}, …]
 * @param {HTMLElement}   wrapperEl  div-контейнер
 */
export function renderCandlestickChart(candles, wrapperEl) {
  if (!wrapperEl) return;
  const container = wrapperEl;

  // 1. Проверка данных
  if (!candles || candles.length === 0) {
    container.innerHTML = `
      <p class="p-3 text-center">
        ${t('noDataToDisplayChart', 'No data to display chart.')}
      </p>`;
    if (chartInstance) chartInstance.destroy();
    return;
  }

  // 2. Данные → числа/Date
  const processedData = candles.map((d) => ({
    x: new Date(d.x).getTime(),
    o: +d.o,
    h: +d.h,
    l: +d.l,
    c: +d.c,
  }));

  // 3. Подготовка контейнеров
  container.innerHTML = '';

  const scrollDiv = document.createElement('div'); // прокручиваемая часть
  scrollDiv.className = 'e-chart__base'; // сохраняем исходный класс

  // пока фиксированной колонки Y нет — создаём только scrollDiv
  container.appendChild(scrollDiv);

  // сам график
  const canvas = document.createElement('canvas');
  scrollDiv.appendChild(canvas);

  // для кнопок‑скроллеров
  currentScrollDiv = scrollDiv;

  const minWidth = container.clientWidth;
  const GAP = 5;
  const fullWidth = processedData.length * (BAR_WIDTH + GAP) + 32;
  const chartWidth = Math.max(minWidth, fullWidth);

  canvas.width = chartWidth;

  // можно управлять через CSS
  canvas.height = 400;
  canvas.style.width = `${chartWidth}px`;
  canvas.style.height = '400px';

  scrollDiv.style.overflowX = fullWidth > minWidth ? 'auto' : 'hidden';

  // 4. Chart.js
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas.getContext('2d'), {
    type: 'candlestick',
    data: {
      datasets: [
        {
          barThickness: BAR_WIDTH,
          barSpacing: GAP,
          borderColor: 'inherit',
          color: {
            up: 'var(--color-ink-text-success)',
            down: 'var(--color-ink-2ry-error)',
            unchanged: 'var(--color-ink-3ry-error)',
          },
          data: processedData,
        },
      ],
    },
    options: {
      animation: { duration: DURATION },
      maintainAspectRatio: false,
      parsing: false,
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
                    `O: ${formatPrice(dp.o, { tick: 0.001 })}`,
                    `H: ${formatPrice(dp.h, { tick: 0.001 })}`,
                    `L: ${formatPrice(dp.l, { tick: 0.001 })}`,
                    `C: ${formatPrice(dp.c, { tick: 0.001 })}`,
                  ]
                : context.dataset.label || '';
            },
          },
        },
      },
      responsive: false,
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
          ticks: {
            color: 'rgb(255 255 255 / 0.6)',
            padding: 12,
            callback: (v) => formatPrice(v, { tick: 0.001 }),
          },
        },
      },
    },
  });

  // 5. Скролл к последней свече
  if (fullWidth > minWidth) {
    requestAnimationFrame(() => {
      scrollDiv.scrollLeft = scrollDiv.scrollWidth - scrollDiv.clientWidth;
    });
  }

  /* 5. Обновляем/навешиваем слушатели */
  scrollDiv.addEventListener('scroll', updateScrollButtons, { passive: true });
  updateScrollButtons(); // первичный расчёт
}

/** Утилита для безопасного уничтожения графика */
export function destroyChartInstance() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}
