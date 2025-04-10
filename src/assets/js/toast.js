// Счетчик для уникальных ID
let toastCounter = 0;

/**
 * Скрывает toast-уведомление
 * @param {string} toastId - ID toast-элемента
 */
export function hideToast(toastId) {
  const toast = document.getElementById(toastId);
  if (!toast) return;

  // Запускаем анимацию скрытия
  toast.style.opacity = '0';
  toast.style.translate = '0 16px';

  // После завершения анимации удаляем toast
  setTimeout(() => {
    toast.hidePopover();
    toast.remove();
  }, 300); // Длительность анимации
}

/**
 * Показывает тост-уведомление
 * @param {string} message - Текст сообщения
 * @param {string} type - Тип уведомления (success, error, warning, info)
 * @param {number} duration - Длительность показа в миллисекундах
 * @returns {string} ID созданного toast-элемента
 */
export function showToast(message, type = 'info', duration = 5000) {
  toastCounter += 1;
  const toastId = `toast-${toastCounter}`;
  const toastContainer = document.getElementById('toast-container');

  // Создаем элемент toast
  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = `e-toast__base is-${type}`;
  toast.setAttribute('popover', 'manual');
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  // Добавляем содержимое
  toast.innerHTML = `
    <div class="e-toast__content">${message}</div>
    <button class="e-btn is-close" aria-label="Close">
      <svg class="e-icon is-candles is-sm" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
        <path d="M15 5L5 15M5 5L15 15" stroke="var(--icon-stroke)" stroke-width="var(--icon-stroke-width)" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `;

  // Добавляем в контейнер
  toastContainer.appendChild(toast);

  // Показываем toast
  toast.showPopover();

  // Добавляем обработчик для кнопки закрытия
  const closeButton = toast.querySelector('.e-btn.is-close');
  closeButton.addEventListener('click', () => {
    hideToast(toastId);
  });

  // Устанавливаем таймер для автоматического закрытия
  if (duration > 0) {
    setTimeout(() => {
      hideToast(toastId);
    }, duration);
  }

  return toastId;
}
