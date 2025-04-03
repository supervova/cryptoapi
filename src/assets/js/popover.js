export default function initPopovers() {
  const popovers = Array.from(
    document.querySelectorAll('[data-role="popover"]')
  );

  // Функция для проверки, является ли поповер частью главного меню
  function isMainNavPopover(popover) {
    return popover.closest('.e-navbar__menu') !== null;
  }

  // Функция для проверки, находимся ли мы на мобильном экране
  function isMobileScreen() {
    return window.innerWidth < 768;
  }

  // Функция обновления ARIA-атрибутов в зависимости от размера экрана
  function updateAriaAttributes() {
    popovers.forEach((popover) => {
      if (popover.tagName.toLowerCase() !== 'details') {
        const summary = popover.querySelector('[data-role="popover-summary"]');
        const body = popover.querySelector('.e-popover__body');

        if (summary && body) {
          if (!body.id) {
            body.id = `popover-content-${Math.random().toString(36).substring(2, 10)}`;
          }

          summary.setAttribute('aria-haspopup', 'true');
          summary.setAttribute(
            'aria-expanded',
            popover.classList.contains('is-open').toString()
          );
          summary.setAttribute('aria-controls', body.id);
          summary.setAttribute('role', 'button');

          if (!summary.hasAttribute('tabindex')) {
            summary.setAttribute('tabindex', '0');
          }

          // Проверка, является ли поповер частью главного меню
          if (isMainNavPopover(popover) && !isMobileScreen()) {
            // На десктопе main nav popovers должны быть доступны
            body.setAttribute('aria-hidden', 'false');
          } else {
            // В мобильном виде или для других поповеров используем стандартное поведение
            body.setAttribute(
              'aria-hidden',
              !popover.classList.contains('is-open').toString()
            );
          }
        }
      }
    });
  }

  // Инициализация ARIA-атрибутов
  updateAriaAttributes();

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
            // Проверка на главное меню на десктопе
            if (isMainNavPopover(el) && !isMobileScreen()) {
              // Не скрываем для скринридеров на десктопе
              body.setAttribute('aria-hidden', 'false');
            } else {
              body.setAttribute('aria-hidden', 'true');
            }
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
              // Проверка на главное меню на десктопе
              if (isMainNavPopover(popover) && !isMobileScreen()) {
                // Не скрываем для скринридеров на десктопе
                body.setAttribute('aria-hidden', 'false');
              } else {
                body.setAttribute('aria-hidden', 'true');
              }
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
      const summary = popover.querySelector(
        '[data-role="popover-summary"], summary'
      );

      if (
        !popover.contains(event.target) ||
        (popoverBody &&
          !popoverBody.contains(event.target) &&
          !summary.contains(event.target))
      ) {
        if (popover.tagName.toLowerCase() === 'details') {
          popover.removeAttribute('open');
        } else {
          popover.classList.remove('is-open');

          if (summary && popoverBody) {
            // Проверка на главное меню на десктопе
            if (isMainNavPopover(popover) && !isMobileScreen()) {
              // Не скрываем для скринридеров на десктопе
              popoverBody.setAttribute('aria-hidden', 'false');
            } else {
              popoverBody.setAttribute('aria-hidden', 'true');
            }
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

  // Обновление атрибутов при изменении размера окна
  window.addEventListener('resize', updateAriaAttributes);
}
