/**
 * Прокрутки содержимого перетаскиванием
 * Работает только на устройствах с мышью, игнорирует сенсорные экраны
 */
function initDragToScroll() {
  // Проверяем, поддерживает ли устройство hover (указывает на наличие мыши)
  const isMouseDevice = window.matchMedia(
    '(any-hover: hover) and (pointer: fine)'
  ).matches;

  // Если устройство сенсорное - не инициализируем
  if (!isMouseDevice) return;

  // Находим все скроллеры
  const scrollers = document.querySelectorAll('[data-role="draggable-scroll"]');

  scrollers.forEach((element) => {
    const scroller = element;
    const state = {
      isDown: false,
      startX: 0,
      scrollLeft: 0,
    };

    // Обработчик нажатия мыши
    const onMouseDown = (e) => {
      state.isDown = true;
      scroller.classList.add('is-active');
      state.startX = e.pageX - scroller.offsetLeft;
      state.scrollLeft = scroller.scrollLeft;
    };

    // Обработчик отпускания мыши
    const onMouseUp = () => {
      state.isDown = false;
      scroller.classList.remove('is-active');
    };

    // Обработчик выхода за пределы элемента
    const onMouseLeave = () => {
      state.isDown = false;
      scroller.classList.remove('is-active');
    };

    // Обработчик движения мыши
    const onMouseMove = (e) => {
      if (!state.isDown) return;

      const currentX = e.pageX - scroller.offsetLeft;
      const walk = (currentX - state.startX) * 1.5; // Множитель для регулировки скорости прокрутки

      // Учитываем direction: rtl для секций с обратной прокруткой
      const isReverseScroller =
        scroller.closest('.has-scroller-row-reverse') !== null;

      if (isReverseScroller) {
        const newScrollLeft = state.scrollLeft + walk; // Для RTL элементов направление прокрутки уже инвертировано
        scroller.scrollLeft = newScrollLeft;
      } else {
        const newScrollLeft = state.scrollLeft - walk;
        scroller.scrollLeft = newScrollLeft;
      }
    };

    // Добавляем обработчики событий только для мыши
    scroller.addEventListener('mousedown', onMouseDown);
    scroller.addEventListener('mouseleave', onMouseLeave);
    scroller.addEventListener('mouseup', onMouseUp);
    scroller.addEventListener('mousemove', onMouseMove);
  });
}

// Функция для переинициализации при изменении размера окна
function handleResize() {
  // Удаляем обработчики событий со всех скроллеров
  const scrollers = document.querySelectorAll('[data-role="draggable-scroll"]');
  scrollers.forEach((scroller) => {
    scroller.removeEventListener('mousedown', scroller.onMouseDown);
    scroller.removeEventListener('mouseleave', scroller.onMouseLeave);
    scroller.removeEventListener('mouseup', scroller.onMouseUp);
    scroller.removeEventListener('mousemove', scroller.onMouseMove);
    scroller.removeEventListener('touchstart', scroller.onTouchStart);
    scroller.removeEventListener('touchend', scroller.onTouchEnd);
    scroller.removeEventListener('touchcancel', scroller.onTouchCancel);
    scroller.removeEventListener('touchmove', scroller.onTouchMove);

    // Удаляем класс активности
    scroller.classList.remove('is-active');
  });

  // Переинициализируем
  initDragToScroll();
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initDragToScroll);

// Слушатель изменения размера окна
window.addEventListener('resize', handleResize);

export default initDragToScroll;
