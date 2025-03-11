/**
 * Модуль для реализации горизонтальной прокрутки с помощью колесика мыши
 * и добавления индикаторов прокрутки при необходимости
 */

/**
 * Инициализирует горизонтальную прокрутку для указанного селектора контейнера
 * @param {string|Element|NodeList} selector - CSS селектор, элемент DOM или NodeList
 * @param {Object} options - Настройки прокрутки
 * @param {boolean} options.wheelScroll - Включить прокрутку колесиком мыши
 * @param {boolean} options.showIndicators - Показывать индикаторы прокрутки
 * @param {number} options.scrollAmount - Величина прокрутки для индикаторов
 * @returns {Array} - Массив объектов управления для каждого инициализированного контейнера
 */
export function initHorizontalScroll(selector, options = {}) {
  const settings = {
    wheelScroll: true,
    showIndicators: false,
    scrollAmount: 300,
    ...options,
  };

  let containers = [];
  if (typeof selector === 'string') {
    containers = Array.from(document.querySelectorAll(selector));
  } else if (selector instanceof Element) {
    containers = [selector];
  } else if (selector instanceof NodeList || Array.isArray(selector)) {
    containers = Array.from(selector);
  }

  if (containers.length === 0) return [];

  const controllers = [];

  containers.forEach((scrollContainer, index) => {
    /* eslint-disable no-param-reassign */
    if (!scrollContainer.id) {
      scrollContainer.id = `horizontal-scroll-${index}`;
    }
    /* eslint-enable no-param-reassign */

    if (settings.wheelScroll) {
      scrollContainer.addEventListener('wheel', (event) => {
        if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
          event.preventDefault();
          /* eslint-disable no-param-reassign */
          scrollContainer.scrollLeft += event.deltaY;
          /* eslint-enable no-param-reassign */
        }
      });
    }

    let checkScrollIndicators;

    if (settings.showIndicators) {
      const parentContainer = scrollContainer.parentElement;
      parentContainer.style.position = 'relative';

      checkScrollIndicators = () => {
        const canScroll =
          scrollContainer.scrollWidth > scrollContainer.clientWidth;

        const indicatorsSelector = `.scroll-indicators[data-for="${scrollContainer.id}"]`;
        const existingIndicators =
          parentContainer.querySelector(indicatorsSelector);
        if (existingIndicators) {
          parentContainer.removeChild(existingIndicators);
        }

        if (canScroll) {
          const indicators = document.createElement('div');
          indicators.className = 'scroll-indicators';
          indicators.setAttribute('data-for', scrollContainer.id);

          const leftIndicator = document.createElement('button');
          leftIndicator.className = 'scroll-indicator scroll-left';
          leftIndicator.setAttribute('aria-label', 'Прокрутить влево');
          leftIndicator.innerHTML = '&larr;';
          leftIndicator.addEventListener('click', () => {
            scrollContainer.scrollBy({
              left: -settings.scrollAmount,
              behavior: 'smooth',
            });
          });

          const rightIndicator = document.createElement('button');
          rightIndicator.className = 'scroll-indicator scroll-right';
          rightIndicator.setAttribute('aria-label', 'Прокрутить вправо');
          rightIndicator.innerHTML = '&rarr;';
          rightIndicator.addEventListener('click', () => {
            scrollContainer.scrollBy({
              left: settings.scrollAmount,
              behavior: 'smooth',
            });
          });

          indicators.appendChild(leftIndicator);
          indicators.appendChild(rightIndicator);

          parentContainer.appendChild(indicators);

          const updateIndicators = () => {
            const leftBtn = parentContainer.querySelector(
              `${indicatorsSelector} .scroll-left`
            );
            const rightBtn = parentContainer.querySelector(
              `${indicatorsSelector} .scroll-right`
            );

            if (leftBtn && rightBtn) {
              const isAtLeftEdge = scrollContainer.scrollLeft <= 10;
              leftBtn.style.opacity = isAtLeftEdge ? '0.5' : '1';
              leftBtn.disabled = isAtLeftEdge;

              const isAtRightEdge =
                scrollContainer.scrollLeft + scrollContainer.clientWidth >=
                scrollContainer.scrollWidth - 10;
              rightBtn.style.opacity = isAtRightEdge ? '0.5' : '1';
              rightBtn.disabled = isAtRightEdge;
            }
          };

          scrollContainer.addEventListener('scroll', updateIndicators);
          updateIndicators();
        }
      };

      checkScrollIndicators();

      if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
          checkScrollIndicators();
        });
        resizeObserver.observe(scrollContainer);
      } else {
        window.addEventListener('resize', checkScrollIndicators);
      }
    }

    const controller = {
      element: scrollContainer,
      scrollLeft: (amount) => {
        scrollContainer.scrollBy({ left: -amount, behavior: 'smooth' });
      },
      scrollRight: (amount) => {
        scrollContainer.scrollBy({ left: amount, behavior: 'smooth' });
      },
      scrollToIndex: (itemIndex) => {
        const { children } = scrollContainer;
        if (itemIndex >= 0 && itemIndex < children.length) {
          children[itemIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      },
      refreshIndicators: () => {
        if (settings.showIndicators && checkScrollIndicators) {
          checkScrollIndicators();
        }
      },
    };

    controllers.push(controller);
  });

  return controllers;
}

export function isScrollable(element) {
  return element.scrollWidth > element.clientWidth;
}

export function initAllScrollables(
  className = 'horizontal-scroll',
  options = {}
) {
  return initHorizontalScroll(`.${className}`, options);
}
