// assets/js/table/formatting.js
import t from '../markets/translate.js';
import { ASSETS_PATH_PREFIX } from '../markets/config.js';

/**
 * Форматирование цены с динамическим числом знаков после запятой.
 *  • < 1 e-8  → экспоненциальная запись `1.23e-9`
 *  • < 1      → столько знаков, чтобы показать первые 2 значащие цифры,
 *               но не более 8
 *  • ≥ 1      → всегда 2 знака
 * @param {string|number} value
 * @returns {string}
 */
export function formatPrice(value) {
  if (value === null || value === undefined) return '–';

  const price = Number(value);
  if (!Number.isFinite(price)) return '–';
  if (price === 0) return '0';

  // Очень маленькие значения показываем в экспоненциальной форме
  if (Math.abs(price) < 1e-8) return price.toExponential(2);

  // Для значений меньше 1 рассчитываем нужную точность
  if (Math.abs(price) < 1) {
    const exponent = Math.floor(Math.log10(Math.abs(price))); // отрицательное число
    /*  |exponent| = количество нулей после точки до первой значащей
     *  +3  → две дополнительные значащие цифры.
     *  Минимум 4 знака, максимум 8.                         */
    const decimals = Math.min(8, Math.max(4, Math.abs(exponent) + 3));
    return Number(price.toFixed(decimals)).toString(); // убираем лишние нули
  }

  // Всё остальное — две цифры после запятой
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Форматирование изменения цены за 24 часа
 * @param {Object} priceData - Данные о цене с текущим значением и вчерашним средним
 * @returns {string} Отформатированное изменение в процентах
 */
export function formatChange24h(priceData) {
  if (
    !priceData ||
    priceData.current === undefined ||
    priceData.yesterday?.middle === undefined
  )
    return '–';
  const current = parseFloat(priceData.current);
  const yesterdayMiddle = parseFloat(priceData.yesterday.middle);
  if (
    Number.isNaN(current) ||
    Number.isNaN(yesterdayMiddle) ||
    yesterdayMiddle === 0
  )
    return '–';
  const change = ((current - yesterdayMiddle) / yesterdayMiddle) * 100;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`;
}

/**
 * Форматирование уровня риска в иконку
 * @param {string} value - Уровень риска (high, medium, low и т.д.)
 * @returns {string} HTML с иконкой риска
 */
export function formatRisk(value) {
  const riskLower = (value || '').toLowerCase();
  switch (riskLower) {
    case 'high':
      return `<span class="has-tooltip" aria-label="${t('highRisk', 'High risk')}"><svg class="e-icon is-error" aria-hidden="true" focusable="false"><use xlink:href="${ASSETS_PATH_PREFIX}/assets/img/icons/sprite.svg#icon-error"></use></svg></span>`;
    case 'medium':
    case 'neutral':
      return `<span class="has-tooltip" aria-label="${t('mediumRisk', 'Medium risk')}"><svg class="e-icon is-yin-yang" aria-hidden="true" focusable="false"><use xlink:href="${ASSETS_PATH_PREFIX}/assets/img/icons/sprite.svg#icon-yin-yang"></use></svg></span>`;
    case 'low':
      return `<span class="has-tooltip" aria-label="${t('lowRisk', 'Low risk')}"><svg class="e-icon is-success" aria-hidden="true" focusable="false"><use xlink:href="${ASSETS_PATH_PREFIX}/assets/img/icons/sprite.svg#icon-success"></use></svg></span>`;
    default:
      return `<span aria-label="${t('noRiskData', 'No risk data')}">–</span>`;
  }
}

/**
 * Форматирование значения с обработкой null/undefined
 * @param {*} value - Значение для форматирования
 * @returns {string} Значение или тире если null/undefined
 */
export function formatNullable(value) {
  return value !== null && value !== undefined ? value : '–';
}
