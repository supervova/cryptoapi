# Горизонтальная прокрутка с помощью мыши

Реализуется с помощью скрипта scroller-row.js.

Скрипт может управлять прокруткой индивидуальных компонентов или группы.

```js
// Индивидуальная инициализация:
const productsScroll = initHorizontalScroll('.products-container', options);
const teamScroll = initHorizontalScroll('.team-container', options);

// Инициализация группы по селектору:
const allScrollContainers = initHorizontalScroll(
  '.scrollable-container',
  options
);
```

Помимо настроек, сделанных в main.js можно добавить кнопки для программной

```js
const scroll = initHorizontalScroll('.cards-container', {/* настройки */}

document.querySelector('.custom-left-button').addEventListener('click', () => {
  scroll.scrollLeft(200);
});
document.querySelector('.custom-right-button').addEventListener('click', () => {
  scroll.scrollRight(200);
});

// Пример прокрутки к конкретной карточке
document.querySelectorAll('.card-selector').forEach((button, index) => {
  button.addEventListener('click', () => {
    scroll.scrollToIndex(index);
  });
});
```
