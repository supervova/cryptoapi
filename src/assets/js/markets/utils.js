// assets/js/markets/utils.js
import * as DOMElements from './dom.js';
import { state, setUpdateIntervalId } from './state.js';

/**
 * Получение вложенного значения из объекта по пути
 * @param {Object} obj - Исходный объект
 * @param {string} path - Путь к значению через точку
 * @returns {*} Найденное значение или null
 */
export const getNestedValue = (obj, path) => {
  if (!obj || !path) return null;
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : null), obj);
};

/**
 * Очистка ресурсов и интервалов
 */
export function cleanup() {
  if (state.updateIntervalId) {
    clearInterval(state.updateIntervalId);
    setUpdateIntervalId(null);
  }
}

/**
 * Троттлинг выполнения функции
 * @param {Function} func - Функция для троттлинга
 * @param {number} limit - Ограничение в миллисекундах
 * @returns {Function} Троттлированная функция
 */
export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function throttled(...args) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
      return;
    }
    clearTimeout(lastFunc);
    lastFunc = setTimeout(
      () => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      },
      limit - (Date.now() - lastRan)
    );
  };
};

/**
 * Объявление обновления для screen reader
 * @param {string} message - Сообщение для озвучивания
 */
export function announceUpdate(message) {
  if (DOMElements.screenReaderAnnouncer) {
    DOMElements.screenReaderAnnouncer.textContent = message;
  }
}

/**
 * Получение смещения часового пояса в часах
 * @returns {number} Смещение часового пояса
 */
export function getTimezoneOffset() {
  const offset = new Date().getTimezoneOffset();
  return (offset / 60) * -1;
}
