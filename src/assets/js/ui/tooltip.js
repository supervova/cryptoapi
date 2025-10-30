/**
 * Инициализирует задержку исчезновения для rich-тултипов.
 * Тултип исчезает с задержкой в 240 мс после потери фокуса или наведения.
 * Может быть вызвана несколько раз для инициализации новых элементов.
 */
const initTooltipsDelay = () => {
  // Только неинициализированные тултипы
  const richTooltips = document.querySelectorAll('.has-rich-tooltip:not([data-tooltip-initialized])');
  const HIDE_DELAY = 240; // ms

  richTooltips.forEach(parent => {
    const tooltip = parent.querySelector('.tooltip');
    if (!tooltip) return;

    let hideTimeout;

    const showTooltip = () => {
      clearTimeout(hideTimeout);
      tooltip.classList.add('is-visible');
    };

    const hideTooltip = () => {
      hideTimeout = setTimeout(() => {
        tooltip.classList.remove('is-visible');
      }, HIDE_DELAY);
    };

    parent.addEventListener('mouseenter', showTooltip);
    parent.addEventListener('mouseleave', hideTooltip);
    parent.addEventListener('focusin', showTooltip);
    parent.addEventListener('focusout', hideTooltip);

    // Помечаем элемент как инициализированный
    parent.setAttribute('data-tooltip-initialized', 'true');
  });
};

export default initTooltipsDelay;