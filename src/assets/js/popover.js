export default function initPopovers() {
  const popovers = Array.from(
    document.querySelectorAll('[data-role="popover"]')
  );

  // Инициализация ARIA-атрибутов для div-поповеров
  popovers.forEach((popover) => {
    if (popover.tagName.toLowerCase() !== 'details') {
      const summary = popover.querySelector('[data-role="popover-summary"]');
      const body = popover.querySelector('.e-popover__body');
      if (summary && body) {
        if (!body.id) {
          body.id = `popover-content-${Math.random().toString(36).substring(2, 10)}`;
        }
        summary.setAttribute('aria-haspopup', 'true');
        summary.setAttribute('aria-expanded', 'false');
        summary.setAttribute('aria-controls', body.id);
        summary.setAttribute('role', 'button');
        if (!summary.hasAttribute('tabindex')) {
          summary.setAttribute('tabindex', '0');
        }
        body.setAttribute('aria-hidden', 'true');
      }
    }
  });

  // Функция для закрытия всех поповеров с исключением
  function closeAllPopovers(exclude = null) {
    popovers.forEach((el) => {
      if (el !== exclude) {
        if (el.tagName.toLowerCase() === 'details') {
          el.removeAttribute('open');
        } else {
          el.classList.remove('is-open');
          const summary = el.querySelector('[data-role="popover-summary"]');
          const body = el.querySelector('.e-popover__body');
          if (summary && body) {
            body.setAttribute('aria-hidden', 'true');
            summary.setAttribute('aria-expanded', 'false');
          }
        }
      }
    });
  }

  // Обработчик клика для переключения состояния
  popovers.forEach((popover) => {
    const summary = popover.querySelector(
      '[data-role="popover-summary"], summary'
    );
    if (summary) {
      summary.addEventListener('click', (event) => {
        if (popover.tagName.toLowerCase() !== 'details') {
          event.preventDefault();
        }

        closeAllPopovers(popover);

        if (popover.tagName.toLowerCase() !== 'details') {
          const isOpen = popover.classList.contains('is-open');
          if (isOpen) {
            popover.classList.remove('is-open');
            const body = popover.querySelector('.e-popover__body');
            if (body) {
              body.setAttribute('aria-hidden', 'true');
              summary.setAttribute('aria-expanded', 'false');
            }
          } else {
            popover.classList.add('is-open');
            const body = popover.querySelector('.e-popover__body');
            if (body) {
              body.setAttribute('aria-hidden', 'false');
              summary.setAttribute('aria-expanded', 'true');
            }
          }
        }

        event.stopPropagation();
      });

      if (popover.tagName.toLowerCase() !== 'details') {
        summary.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            summary.click();
          }
        });
      }
    }
  });

  // Закрытие при клике вне поповера
  document.addEventListener('click', (event) => {
    popovers.forEach((popover) => {
      const popoverBody = popover.querySelector('.e-popover__body');
      if (
        !popover.contains(event.target) ||
        (popoverBody &&
          !popoverBody.contains(event.target) &&
          !popover
            .querySelector('[data-role="popover-summary"], summary')
            .contains(event.target))
      ) {
        if (popover.tagName.toLowerCase() === 'details') {
          popover.removeAttribute('open');
        } else {
          popover.classList.remove('is-open');
          const summary = popover.querySelector(
            '[data-role="popover-summary"]'
          );
          if (summary && popoverBody) {
            popoverBody.setAttribute('aria-hidden', 'true');
            summary.setAttribute('aria-expanded', 'false');
          }
        }
      }
    });
  });

  // Закрытие при нажатии Esc
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Esc' || event.key === 'Escape') {
      closeAllPopovers();
    }
  });
}
