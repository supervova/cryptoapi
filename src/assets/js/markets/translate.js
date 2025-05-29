// src/assets/js/markets/translate.js

import { IS_DEVELOPMENT } from './config.js'; // Убедиться, что config загружен первым

const translations =
  typeof window !== 'undefined' && window.TRANSLATIONS_APP
    ? window.TRANSLATIONS_APP
    : {};

/**
 * Получение перевода по ключу
 * Возвращает fallback, если ключ не найден.
 * @param {string} key - Ключ перевода
 * @param {string} fallback - Резервное значение
 * @returns {string} Переведенное значение или fallback
 */
const t = (key, fallback = '') => {
  return translations[key] || fallback || key; // Вернуть ключ, если fallback тоже пустой
};

/**
 * Инициализация переводов из DOM элемента
 * Вызвать эту функцию один раз в главном markets.js для загрузки переводов.
 */
export function initTranslations() {
  const translationDataElement = document.getElementById('js-translations');
  if (translationDataElement && translationDataElement.textContent) {
    try {
      const newTranslations = JSON.parse(translationDataElement.textContent);
      Object.assign(translations, newTranslations);
    } catch (e) {
      if (IS_DEVELOPMENT) {
        console.warn('Failed to parse translations from #js-translations:', e);
      }
    }
  }
}

export default t;
