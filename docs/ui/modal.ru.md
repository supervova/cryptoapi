# Модальное окно и элемент `dialog`

HTML-элемент `dialog` — технология, которая может быть использована не только для модальных окон, но и для выдвижных панелей и «тостов». [Поддержка браузеров > 96%](https://caniuse.com/?search=dialog).

## Разметка

```pug
dialog.modal#my-dialog
  article
    header
      h2 Hello! I'm a modal dialog...
    div
      p
        label(for='form-my-input') Label
        input#form-my-input(name='name' type='text' autofocus placeholder='Label')
      p Lorem ipsum dolor sit amet consectetur adipisicing elit.
  footer.modal__buttons
    button.btn.is-close.js-close-modal(type='reset') Cancel
    button(type='submit') Submit
```

```html
<dialog class="modal" id="modal-example">
  <article>
    <button class="modal__close btn" type="button" data-role="close-modal" aria-label="Close">
      ❌
    </button>
    <header>Lorem</header>
    <p>ipsum dolor sit amet consectetur, adipisicing elit.</p>
  </article>
</dialog>

<dialog class="modal" id="modal-external">
  <button class="modal__close btn" type="button" data-role="close-modal" aria-label="Close">
    ❌
  </button>
  <div class="modal__content">
  </div>
</dialog>

<dialog class="modal" id="modal-search">
  <form class="form is-search" action="https://www.google.com/search" method="get" target="_blank">
    <input class="form-control form__input" name="q" type="text" maxlength="255" tabindex="-1" autocomplete="off" value="" placeholder="Поиск" spellcheck="false" data-ms-editor="true">
    <button class="btn is-search" type="submit" aria-label="Поиск">
      <svg class="icon" focusable="false" aria-hidden="true">
        <use xlink:href="/assets/img/base/icons/sprite.svg#icon-search"></use>
      </svg>
    </button>
    <input type="hidden" name="sitesearch" value="https://super-mark.ru">
  </form>
</dialog>

<button type="button" data-target="modal-example">
  Открыть пример
</button>

<a href="/about" data-target="modal-external">
  Обо мне
</a>

<button class="contrast" type="button" data-target="modal-search">
  Искать
</button>

```

## Скрипт `modal.js`

1. **Прослушиваем события кнопок открытия и закрытия модальных окон.**

2. **Используем классы `has-open-modal`, `has-opening-modal` и `has-closing-modal` для управления состояниями страниц с модальными окнами.** Классы назначаются элементу `html`. После закрытия удаляются. Учитывается время анимации.

3. **Получаем и устанавливаем ширину полосы прокрутки в переменную `--scrollbar-width`.** Это позволяет учитывать ширину полосы прокрутки и предотвращать сдвиг контента при открытии модального окна.

4. **Функция `getExternalContent` загружает внешнее содержимое в модальное окно.** При загрузке внешнего содержимого в модальное окно, контент модального окна очищается после его закрытия.

5. **Используем `IntersectionObserver` для управления стилем заголовка модального окна.** При прокрутке на телефонах «шапка» окна получает класс `is-pinned`.

6. **Управляем закрытием модального окна.** Модальное окно закрывается при клике вне его содержимого, при нажатии клавиши `Escape` или кнопки `[data-role="close-modal"]`.

## Методы элемента `dialog`

Элемент имеет встроенные методы.

- `show`. Открыть абсолютно позиционированный немодальный диалог. Метод подходит для панелей и «тостов».
- `showModal`. Открыть модальный диалог в фиксированной позиции. Метод подходит для модальных окон.
- `close`. Закрыть диалог.

```javascript
const dialog = document.querySelector('dialog');

dialog.show();
dialog.showModal();
dialog.close();
```

Элемент закрывается также при нажатии клавиши Esc — и не нужно устанавливать обработчик события `keydown`.

## Затемнение

Элемент `dialog` содрежит псевдодемент `backdrop` — затемнение. Цвет затемнения можно менять.

```css
dialog::backdrop {
  background: hsl(240 100% 90% / .64);
}
```

## Множество открытых окон

Диалогов, в том числе открытых, на странице может быть несколько. Они занимают слои интерфейса, согласно положению в коде или значению `z-index`. Если верхнее окно являятся модальным, остальные под ним остаются заблокированными, как и остальные элементы интерфейса.

## Автофокус

При открытии элемента `dialog` браузер передаёт фокус первому интерактивному элементу окна. При закрытии — возвращает «открывашке».

Если нужно установить фокус не на первый интерактивный элемент в `dialog`'е, можно использовать атрибут `autofocus`. Однако на странице не может быть больше одного элемента с `autofocus`'ом.

```html
<button type="submit" autofocus>Submit</button>
```

## Доступность, aria-атрибуты

`dialog` нуждается только в двух `aria`-атрибутах:

- `aria-labelledby` или `aria-label`
- `aria-modal='true'` — указывает на то, что взаимодействие с интерфейсом под активным окном невозможно. Значение не зависит от того, открыто окно или нет.

⚠️ `dialog`'у не следует назначать атрибут `tabindex`.

```pug
dialog#dialog-sample(aria-labelledby='dialog-sample-title' aria-modal='true')
  h2#dialog-sample-title.dialog-title
    Съешь же ещё этих мягких французских булок да выпей чаю

  p Lorem ipsum dolor sit amet consectetur adipisicing elit.
```

## Интеграция с формой

[Согласно MDN](https://developer.mozilla.org/ru/docs/Web/HTML/Element/dialog), форму можно интегрировать с диалогом с помощью `method="dialog"`. После отправки такой формы, диалог закрывается. Но [в спецификации формы](https://html.spec.whatwg.org/multipage/forms.html#the-form-element) метода `dialog` нет. Соответственно, валидатор W3C ругается на его использование.

```pug
dialog
  form(method='dialog')
    label(for='favAnimal') Favorite animal:
    select#favAnimal
      option Brine shrimp
      option Red panda
      option Spider monkey
    footer.buttons
      button#cancel(type='reset') Cancel
      button(type='submit') Confirm
```
