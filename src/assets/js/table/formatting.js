// assets/js/table/formatting.js
import t from '../markets/translate.js';
import { ASSETS_PATH_PREFIX } from '../markets/config.js';

const isEnglishLocale = () => {
  let raw = '';

  if (typeof document !== 'undefined' && document.documentElement) {
    raw = String(document.documentElement.lang || '').toLowerCase();
  }

  if (!raw && typeof window !== 'undefined' && window.APP_CONFIG) {
    raw = String(window.APP_CONFIG.currentLang || '').toLowerCase();
  }

  if (!raw) return true;

  return raw === 'en' || raw.startsWith('en-') || raw.startsWith('en_');
};

/**
 * Форматирование цены с динамическим числом знаков после запятой.
 *  • < 1 e-8  → экспоненциальная запись `1.23e-9`
 *  • < 1      → столько знаков, чтобы показать первые 2 значащие цифры,
 *               но не более 8
 *  • ≥ 1      → всегда 2 знака, либо 4 — если указан малый tick
 * @param {string|number} value
 * @param {Object} [options]
 * @param {number} [options.tick] — минимальный шаг изменения цены
 * @returns {string}
 */
export function formatPrice(value, options = {}) {
  if (value === null || value === undefined) return '–';

  const price = Number(value);
  if (!Number.isFinite(price)) return '–';
  if (price === 0) return '0';

  // Очень маленькие значения — экспоненциально
  if (Math.abs(price) < 1e-8) {
    return price.toExponential(2);
  }

  // До 1 — вычисляем нужную точность от порядка
  if (Math.abs(price) < 1) {
    const exponent = Math.floor(Math.log10(Math.abs(price)));
    const decimals = Math.min(8, Math.max(4, Math.abs(exponent) + 3));
    const normalized = Number(price.toFixed(decimals)).toString();
    if (isEnglishLocale()) {
      return normalized;
    }
    return normalized.replace('.', ',');
  }

  // Для значений >= 1 — увеличиваем точность, если tick < 0.01
  const { tick } = options;
  const decimals = tick && tick < 0.01 ? 4 : 2;

  if (isEnglishLocale()) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  const fixed = price.toFixed(decimals);
  const [intPart, fracPart] = fixed.split('.');
  const intWithSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  if (!fracPart || Number(fracPart) === 0) {
    return intWithSpaces;
  }

  return `${intWithSpaces},${fracPart}`;
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
    priceData.dayago === undefined
  )
    return '–';
  const current = parseFloat(priceData.current);
  const dayAgoPrice = parseFloat(priceData.dayago);
  if (Number.isNaN(current) || Number.isNaN(dayAgoPrice) || dayAgoPrice === 0)
    return '–';
  const change = ((current - dayAgoPrice) / dayAgoPrice) * 100;
  const sign = change > 0 ? '+' : '';
  const fixed = change.toFixed(2);
  const formatted = isEnglishLocale()
    ? fixed
    : fixed.replace('.', ',');
  return `${sign}${formatted}`;
}

/**
 * Форматирование обычного числа с локализованным разделителем.
 * Используется для колонок вроде TRINDX.
 * @param {string|number} value
 * @param {number} [decimals=2]
 * @returns {string}
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return '–';
  const num = Number(value);
  if (!Number.isFinite(num)) return '–';

  const fixed = num.toFixed(decimals);
  if (isEnglishLocale()) return fixed;

  const [intPart, fracPart] = fixed.split('.');
  if (!fracPart || Number(fracPart) === 0) {
    return intPart;
  }
  return `${intPart},${fracPart}`;
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
