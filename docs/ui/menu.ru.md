# Меню

## Разметка

```pug
nav
  ul.menu
    li: a.menu__link(href='#')
      span.label Menu Item
    li: a.menu__link(href='#')
      span.label Menu Item
    li: a.menu__link(href='#')
      span.label Menu Item
```

Атрибуты `role` использовать только в том случае, если меню почему-то не обёрнуто тегом `nav`.

```pug
ul(role='menu' aria-label='Lorem Ipsum')
  li(role='none')
    a(href='#' role='menuitem')
      span.label Menu Item
  li(role='none')
    a(href='#' role='menuitem')
      span.label Menu Item
  li(role='none')
    a(href='#' role='menuitem')
      span.label Menu Item
```

## Управление фокусом

Для нескрываемых элементов, нуждающихся в фокусе, но не фокусируемых по умолчанию — например, кликабельных li — устанавливается tabindex: '0'.

Для скрытых интерактивных элементов устанавливается tabindex: '-1'. Причем атрибут назначается не только элементам без «врожденной» фокусировки но и фокусируемым, вроде `<a>` — см. [Building a Keyboard Accessible Custom Menu using Roving Tabindex](https://blog.srij.dev/roving-tabindex-from-scratch).

```pug
li: a(href='#' tabindex="-1")
  span.label Menu Item
```

При открытии виджета, в котором такие элементы содержатся — модальное окно, выпадающее или контекстное меню — первый из таких элементов, который должен попасть в фокус, меняет значение атрибута tabindex на '0'.

Затем значения меняются по нажатию клавиш-стрелок:

- у элемента, который был в фокусе последним tabindex становится равным -1;
- у следующего в очереди на фокус tabindex становится равным 0;
- вместе с изменением tabindex'а на этом элементе вызывается метод
  `element.focus()`.

Впрочем, при открытии скрываемых виджетов фокус может переводиться и на фокусируемого по умолчанию потомка:

```js
function openDialog() {
  const modal = document.getElementById('modal');
  const firstInput = modal.querySelector('input[type="text"]');
  modal.classList.add('is-open');
  firstInput.focus();
}
```

При закрытии виджетов «по требованию» следует возвращать фокус на элемент их открывший: .focus(). Думаю в момент открытия скрытого виджета их можно помечать data-атрибутом, чтоб не потерять.

- Образец JS можно [взять здесь](https://a11y-solutions.stevenwoodson.com/solutions/focus/roving-focus/)
- [Тестирование клавиатуры](https://ru.reactjs.org/docs/accessibility.html#the-keyboard)
- [Блуждающий фокус (Roving Focus)](https://www.w3.org/TR/2019/NOTE-wai-aria-practices-1.1-20190814/#kbd_roving_tabindex)

## Лучшие и достаточные примеры разметки

- [Salesforce](https://react.lightningdesignsystem.com/components)
- [W3C](https://www.w3.org/TR/2019/NOTE-wai-aria-practices-1.1-20190814/examples/)
- [MS To-do](https://to-do.live.com/tasks/)
- [Evernote](https://www.evernote.com/)

За решениями в разработке React-компонентов можно еще заглядывать в [Альфа-банк](https://digital.alfabank.ru/components). CSS подсматривать в [Bootstrap](https://v5.getbootstrap.com/docs/5.0/components).

## Первая реализация в MNB

Основана на минималистичном решение: кликабельными элементами в роли menuitem сделаны элементы `li`. Но, возможно, ради естественного порядка фокусирования лучше добавить кнопки: `li(role='none')>button(role='menuitem')`. Впрочем, тем, кто выбрал такую технологию — Spotify, MS To-do — всё равно назначают кнопкам `tabindex='-1'`

```pug
.menu
  button#my-button.menu__toggle(type='button' aria-haspopup='true' aria-controls='my-menu' aria-expanded='false')
    svg.icon
    span Button Label
    svg.icon
  ul#my-menu.menu__list(role='menu' aria-labelledby='my-button' data-menu-direction='bottom')
    li.menu__item(role='menuitem' data-action='my-action' tabindex='0' data-tooltip='Ecли пункту меню требуются многословные пояснения, можно добавить data-tooltip и показывать его, как пользовательский тултип')
      span Action Label
    //- Navigation menu item with link
    li:a.menu__item(role='menuitem' href='#' tabindex='-1')
      span Link Label
    //- Checkbox role
    li.menu__item(role='menuitemcheckbox' aria-checked='true' tabindex='-1')
      svg.icon
        use(href='/img/components/icon/sprite.svg#icon-check')
      span Option Label
      svg.icon
        use(href='/img/components/icon/sprite.svg#icon-mycicon')
    //- Has submenu
    li.has-submenu
      button.menu__item(type='button' aria-haspopup='true' aria-controls='my-submenu' aria-expanded='false')
        svg.icon
        span Submenu Label
      ul#my-submenu.menu__list(role='menu' aria-label='Submenu Label')
        li.menu__item(role='menuitem' data-action='my-action' tabindex='-1')
          span Action Label
        li.menu__item(role='menuitem' data-action='my-action' tabindex='-1')
          span Action Label
```

## Меню с использованием `details` и `summary`

Валидное и логичное решение.

```pug
ul.tree
  li
    details(open)
      summary Giant planets
      ul
        li
          details
            summary Gas giants
            ul
              li Jupiter
              li Saturn
        li
          details
            summary Ice giants
            ul
              li Uranus
              li Neptune
```

## Меню Saleforce

```pug
.menu
  button.menu__toggle(type='button' aria-haspopup='true')
    svg.icon
    span Label

  ul.menu__list(role='menu' aria-label='Label')
    li.menu__item(role='presentation')
      a(href='javascript:void(0);' role='menuitem' tabindex='0')
        span Menu Item One
    //- Has submenu
    li.has-submenu(role='presentation')
      a(role='menuitem' href='javascript:void(0);' aria-haspopup='true' aria-expanded='true' tabindex='-1')
        span Menu Item Three
        svg.icon
          use(href='/img/components/icon/sprite.svg#icon-chevron')
      .menu__submenu
        ul.menu__list(role='menu' aria-label='Menu Item Three')
          li.menu__item(role='presentation')
            a(href='javascript:void(0);' role='menuitem' tabindex='0')
              span.slds-truncate(title='Submenu Item One') Submenu Item One
          li.menu__item(role='presentation')
            a(href='javascript:void(0);' role='menuitem' tabindex='-1')
              span.slds-truncate(title='Submenu Item Two') Submenu Item Two
          li.menu__item(role='presentation')
            a(href='javascript:void(0);' role='menuitem' tabindex='-1')
              span.slds-truncate(title='Submenu Item Three') Submenu Item Three
          li.slds-has-divider_top-space(role='separator')
          li.menu__item(role='presentation')
            a(href='javascript:void(0);' role='menuitem' tabindex='-1')
              span.slds-truncate(title='Submenu Item Four') Submenu Item Four
```

## Меню Saleforce с двумя иконками в каждом элементе

```pug
.menu
  button.menu__toggle(aria-haspopup='true' title='Show More')
    svg.icon
    span Button Label
  ul.menu__list(role='menu' aria-label='Button Label')
    li.menu__item(role='presentation')
      a(aria-checked='true' href='javascript:void(0);' role='menuitemcheckbox' tabindex='0')
        span
          svg.icon
            use(href='/img/components/icon/sprite.svg#icon-check')
          | Table View
          svg.icon
            use(href='/img/components/icon/sprite.svg#icon-mycicon')
```

## Menu: W3C

```pug
.menu
  button#menubutton1.menu__toggle(aria-haspopup='true' aria-controls='menu1') Actions
  ul#menu1.menu__box(role='menu' aria-labelledby='menubutton1' aria-activedescendant='menu-item1')
    li#menu-item1.menu__item(role='menuitem' onclick='action(event)') Action 1
    li#menu-item2.menu__item(role='menuitem' onclick='action(event)') Action 2
    li#menu-item3.menu__item(role='menuitem' onclick='action(event)') Action 3
    li#menu-item4.menu__item(role='menuitem' onclick='action(event)') Action 4
```

## Меню Bootstrap

```pug
.menu
  button#menuMenuButton.button.button-secondary.menu-toggle(type='button' data-toggle='menu' aria-expanded='false') Label
  ul.menu-menu(aria-labelledby='menuMenuButton')
    li:a.menu__item(href='#') Action
    li:a.menu__item(href='#') Another action
    li:a.menu__item(href='#') Something else here
```

## Меню IBM

```pug
.menu(data-menu)
  button#menu-ibm-btn.menu__trigger(aria-haspopup='true' aria-expanded='false' aria-controls='menu-ibm')
    svg.icon
    span Overflow
  ul#menu-ibm.menu__list(tabindex='-1' role='menu' aria-labelledby='menu-ibm-btn' data-menu-direction='bottom')
    li.menu__option
      button.menu__item(role='menuitem' title='Ecли пункту меню требуются многословные пояснения, можно добавить title')
        span Menu label
```

## Меню Material Design

```pug
.menu
  button#menu-mdc-button Open Menu
  ul.menu__list(role='menu' aria-hidden='true' aria-orientation='vertical' tabindex='-1')
    li.menu__item(role='menuitem')
      span A Menu Item
    li.menu__item(role='menuitem')
      span A Menu Item
```

## Моя панель форматирования (toolbar)

```pug
.toolbar(role='toolbar' aria-label='Форматирование текста' aria-controls='main-editor')
  button.toolbar__btn(type='button' aria-pressed='false' data-action='h1')
    svg.icon
    span Заголовок (H1) — ⇧⌘1
  button.toolbar__btn(type='button' aria-pressed='false' data-action='h2')
    svg.icon
    span Подзаголовок (H2) — ⇧⌘2
  button.toolbar__btn(type='button' aria-pressed='false' data-action='h3')
    svg.icon
    span Подзаголовок подраздела (H3) — ⇧⌘3

  span.toolbar__separator(role='separator')

  button.toolbar__btn(type='button' aria-pressed='false' data-action='bold')
    svg.icon
    span Полужирный — ⌘B
  button.toolbar__btn(type='button' aria-pressed='false' data-action='italic')
    svg.icon
    span Курсив — ⌘I
  button.toolbar__btn(type='button' aria-pressed='false' data-action='ul')
    svg.icon
    span Маркированный список — ⌘L
  button.toolbar__btn(type='button' aria-pressed='false' data-action='ol')
    svg.icon
    span Нумерованный список — ⇧⌘L
  button.toolbar__btn(type='button' data-action='indent')
    svg.icon
    span Отступ — ⌘]
  button.toolbar__btn(type='button' data-action='outdent')
    svg.icon
    span Уменьшить отступ — ⌘[
  button.toolbar__btn(type='button' data-action='img')
    svg.icon
    span Вставить изображение — ⇧⌘I

  .toolbar__select(tabindex='0')
    button.toolbar__select-toggle(aria-haspopup='true' aria-expanded='false' aria-controls='toolbar-menu-more' tabindex='-1' aria-label='Дополнительные команды вставки и форматирования')
      span Ещё
    ul#toolbar-menu-more.menu(role='menu' aria-label='Дополнительные команды вставки и форматирования')
      li.menu__item(role='menuitem' data-action='link')
        span Ссылка — ⌘K
      li.menu__item(role='menuitem' data-action='hr')
        span Горизонтальная линия

  .toolbar__separator(role='separator')

  button.toolbar__btn(type='button' tabindex='-1')
    svg.icon
    span Показать панель «Комментарии»
  button.toolbar__btn(type='button' tabindex='-1')
    svg.icon
    span Показать панель «Инспектор»
    span.badge 99+

iframe#main-doc.main__doc(aria-label='Редактор заметки' tabindex='-1' src='https://www.magic-nb.com/doc?1606165931029')
```

В кнопке More, помимо прочего — зачеркнутый, выделение, ссылка, таблица, чек-лист, HR, теги(см. Evernote), выравнивание текста и «Сбросить форматирование»

## Панель форматирования W3C

```pug
.toolbar(role='toolbar' aria-label='Text Formatting' aria-controls='main-editor-w3c')
  .toolbar__group
    button.button.has-only-icon(aria-pressed='false' value='bold' tabindex='0')
      svg.icon
      span Bold
    button.button.has-only-icon(aria-pressed='false' value='italic' tabindex='-1')
      svg.icon
      span Italic
    button.button.has-only-icon(aria-pressed='false' value='underline' tabindex='-1')
      svg.icon
      span Underline

  .toolbar__group(role='radiogroup' aria-label='Text Alignment')
    button.button.has-only-icon(role='radio' aria-checked='true' tabindex='-1')
      svg.icon
      span Text Align Left
    button.button.has-only-icon(role='radio' aria-checked='false' tabindex='-1')
      svg.icon
      span Text Align Center
    button.button.has-only-icon(role='radio' aria-checked='false' tabindex='-1')
      svg.icon
      span Text Align Right

  .toolbar__group
    button.button.has-only-icon(aria-disabled='true' tabindex='-1')
      span Copy
    button.button.has-only-icon(aria-disabled='true' tabindex='-1')
      span Paste
    button.button.has-only-icon(aria-disabled='true' tabindex='-1')
      span Cut

  .toolbar__group.menu
    button.button(type='button' aria-haspopup='true' aria-controls='toolbar-menu-font' tabindex='-1' aria-label='Font: Sans-serif')
      span Sans-serif
    ul#toolbar-menu-font(role='menu' aria-label='Font Family' tabindex='-1')
      li(role='menuitemradio' aria-checked='true') Sans-serif
      li(role='menuitemradio' aria-checked='false') Serif
      li(role='menuitemradio' aria-checked='false') Monospace

  .toolbar__group
    .toolbar__spin(role='spinbutton' tabindex='-1' aria-valuenow='14' aria-valuetext='14 Point' aria-valuemin='8' aria-valuemax='40' aria-label='Font size in points')
      //- Decrease
      button.button
        svg.icon
      span 14 Point
      //- Increase
      button.button
        svg.icon

  .toolbar__group
    label.toolbar__checkbox
      input(type='checkbox' tabindex='-1') Night Mode

    a.toolbar__link(href='/help.html' tabindex='-1') Help

iframe#main-editor-w3c.main__editor(aria-label='Редактор заметки' tabindex='-1' src='https://www.magic-nb.com/doc?1606165931029')
```

## Панель форматирования Google

```pug
.toolbar(role='toolbar' tabindex='0' aria-label='Text Formatting')
  button.toolbar__btn(type='button' title='Отменить (⌘Z)')
    svg.icon
    span Label
  button.toolbar__btn(type='button' title='Повторить (⌘Y)')
    svg.icon
    span Label
  button.toolbar__btn(type='button' title='Печать (⌘P)')
    svg.icon
    span Label
  button.toolbar__btn(type='button' title='Проверка грамматики и орфографии (⌘+Option+X)')
    svg.icon
    span Label
  button.toolbar__btn(type='button' title='Копировать форматирование')
    svg.icon
    span Label

  .toolbar__separator(role='separator')

  .toolbar__combobox
    .toolbar__combobox-control(role='combobox' aria-expanded='false' aria-owns='listbox-1' aria-haspopup='true')
      input(type='text' autocomplete='off' aria-autocomplete='both' aria-controls='listbox-1' tabindex='-1' aria-label='Масштаб')
      button.toolbar__combobox-toggle(aria-label='Показать варианты масштаба' tabindex='-1')
        svg.icon
          use(href='/img/components/icon/sprite.svg#icon-chevron')
    ul.toolbar__combobox-options(role='listbox' aria-label='Выбор масштаба документа.')
      li.toolbar__combobox-option(role='option' aria-selected='false') 50%
      li.toolbar__combobox-option(role='option' aria-selected='true') 100%
      li.toolbar__combobox-option(role='option' aria-selected='false') 150%

  .toolbar__separator(role='separator')

  .toolbar__select(role='listbox' aria-haspopup='true' aria-expanded='false' aria-label='Стили')
    button.toolbar__select-toggle(role='option' aria-label='Стили. Выбран Основной текст')
      span Основной текст
    ul.menu
      li.menu__item(role='menuitemcheckbox' aria-checked='true')
        span Основной текст
      li.menu__item(role='menuitemcheckbox' aria-checked='false')
        span Заголовок
      li.menu__item(role='menuitemcheckbox' aria-checked='false')
        span Подзаголовок
      li.menu__item(role='menuitemcheckbox' aria-checked='false')
        span Подзаголовок подраздела

  .toolbar__separator(role='separator')

  button.toolbar__btn(type='button' title='Полужирный (⌘B)')
    svg.icon
    span Label

  //- И т.д.
```

## Панель форматирования Evernote

```pug
.toolbar
  .menu
    .menu__toggle.button.has-only-icon
      svg.icon
      span Вставка
```

Выпадающие меню динамические — создаются JS'ом — `document.body.appendChild(menuInsert);` —
и позиционируются строковыми стилями (лучше, конечно, — CSS-переменными).

```pug
    ul.menu__list(aria-label='Выпадающий список' role='menu')
      li(role='menuitem')
        svg.icon
        span Таблица
      li(role='menuitem')
        svg.icon
        span Разделитель
      li(role='menuitem')
        svg.icon
        span Вложение
      li(role='menuitem')
        svg.icon
        span Фото
      li(role='menuitem')
        svg.icon
        span Флажок
      li(role='menuitem')
        svg.icon
        span Фрагмент кода
      li(role='menuitem')
        svg.icon
        span Набросок
      li(role='menuitem')
        svg.icon
        span Google Drive

    input(type='file' multiple name='filesInput' style='display: none;')

  .button.has-only-icon
    svg.icon
    span Отменить

  .button.has-only-icon
    svg.icon
    span Повторить

  .menu
    .menu__toggle
      span Обычный текст
      //- Chevron
      svg.icon
    //- Динамическое выпадающие меню

  .menu
    .menu__toggle
      span Без засечек
      // Chevron
      svg.icon
    //- Динамическое выпадающие меню

  .menu
    .menu__toggle
      span 16
      //- Chevron
      svg.icon
    //- Динамическое выпадающие меню

  .menu
    .menu__toggle
      span Цвет шрифта
      //- Chevron
      svg.icon #{/* Chevron */}
    //- Динамическое выпадающие меню


  .button.has-only-icon
    svg.icon
    span Жирный

  .button.has-only-icon
    svg.icon
    span Курсив

  .button.has-only-icon
    svg.icon
    span Подчеркивание

  .button.has-only-icon
    svg.icon
    span Выделение

  .menu
    .menu__toggle.has-only-icon
      span Выделение
      //- Chevron
      svg.icon #{/* Chevron */}
    //- Динамическое выпадающие меню

  .button.has-only-icon
    svg.icon
    span Маркированный список

  .button.has-only-icon
    svg.icon
    span Нумерованный список

  .button.has-only-icon
    svg.icon
    span Чек-лист

  .button.has-only-icon
    svg.icon
    span Вставить ссылку

  .menu
    .menu__toggle.has-only-icon
      span Выделение
      //- Chevron
      svg.icon #{/* Chevron */}
    //- Динамическое выпадающие меню

    ul.menu__list(aria-label='Выпадающий список' role='menu')
      li(role='menuitem')
        svg.icon
        span Выровнять по левому краю
      li(role='menuitem')
        svg.icon
        span Выровнять по центру
      li(role='menuitem')
        svg.icon
        span Выровнять по правому краю
      li(role='menuitem')
        svg.icon
        span Отступ
      li(role='menuitem')
        svg.icon
        span Уменьшить отступ
      li(role='menuitem')
        svg.icon
        span Перечеркнуть
      li(role='menuitem')
        svg.icon
        span Надстрочный текст
      li(role='menuitem')
        svg.icon
        span Подстрочный текст
      li(role='menuitem')
        svg.icon
        span Сбросить форматирование

    //- На узком экране пунктов больше
    ul.menu__list(aria-label='Выпадающий список' role='menu')
      li(role='menuitem')
        svg.icon
        span Жирный
      //- И т.д. вплоть до…
      li(role='menuitem')
        svg.icon
        span Сбросить форматирование
      li(role='menuitem')
        span Ниже в списке
```

## «Дерево» MS To-do

Разметка упрощена — удалены многочисленные «обёртки»

```pug
ul.tree(role='tree')
  li.tree__item(tabindex='0' role='treeitem' aria-label='My Day, 0 tasks')
    svg.icon
    span.tree__label My Day
    span.tree__count(aria-hidden='true')
  li.tree__item(role='treeitem' tabindex='-1' aria-label='Important, 0 tasks')
    svg.icon
    span.tree__label Important
  li.tree__item(role='treeitem' tabindex='-1' aria-label='Planned, 9 tasks')
    svg.icon
    span.tree__label Planned
    span.tree__count(aria-hidden='true') 9
  li.tree__item(role='treeitem' tabindex='-1' aria-label='All, 598 tasks')
    svg.icon
    span.tree__label All
    span.tree__count(aria-hidden='true') 598
  li.tree__item(role='treeitem' tabindex='-1' aria-label='Flagged email, 0 tasks')
    svg.icon
    span.tree__label Flagged

  li.tree__item(role='treeitem' tabindex='-1' aria-label='Tasks, 0 tasks')
    svg.icon
    span.tree__label Tasks

    .sortable-lists
      .tree__item.has-branches(aria-label='Group Magic Notebook' aria-expanded='true' tabindex='-1' role='treeitem')
        svg.icon
        span.tree__label Magic Notebook
        svg.icon

        ul.tree__child(role='group')
          li.tree__item(role='treeitem' tabindex='-1' aria-label='MN — На очереди, 4 tasks')
            svg.icon
            span.tree__label MN — На очереди
            span.tree__count(aria-hidden='true') 4
          li.tree__item(role='treeitem' tabindex='-1' aria-label='MN — Бизнес-план и маркетинг, 4 tasks')
            svg.icon
            span.tree__label MN — Бизнес-план и маркетинг
            span.tree__count(aria-hidden='true') 4
          li.tree__item(role='treeitem' tabindex='-1' aria-label='MN — Архив, 3 tasks')
            svg.icon
            span.tree__label MN — Архив
            span.tree__count(aria-hidden='true') 3

      .tree__item.has-branches(aria-label='Group Полилог' aria-expanded='true' tabindex='-1' role='treeitem')
        svg.icon
        span.tree__label Полилог
        svg.icon

        ul.tree__child(role='group')
          li.tree__item(role='treeitem' tabindex='-1' aria-label='Plg — После запуска, 27 tasks')
            svg.icon
            span.tree__label Plg — После запуска
            span.tree__count(aria-hidden='true') 27
```

## «Дерево» W3C

```pug
h3#tree1 Foods
ul.tree(role='tree' aria-labelledby='tree1')
  li.tree__item.has-branches(role='treeitem' aria-expanded='false') Fruits
    ul.tree__group(role='group')
      li.tree__item.has-branches(role='treeitem') Oranges
        ul.tree__group(role='group')
          li.tree__item(role='treeitem') Macintosh
      li(role='treeitem') Bananas
  li(role='treeitem') Vegetables
  li(role='treeitem' aria-expanded='false') Vegetables 2
    ul(role='group')
      li(role='treeitem') Podded Vegetables
      li(role='treeitem') Podded Vegetables 2
```

## Контекстное меню MS To-do. Разметка упрощена

```pug
.menu(aria-label='right-click menu' tabindex='-1')
  ul.menu__list(role='menu')
    li.menu__item(aria-posinset='1' aria-setsize='6' aria-disabled='false' role='menuitem' tabindex='0')
      Share list
    li.menu__item(aria-haspopup='true' aria-expanded='false' aria-posinset='2' aria-setsize='6' aria-disabled='false' role='menuitem' tabindex='-1')
    li.menu__item(aria-posinset='3' aria-setsize='6' aria-disabled='false' role='menuitem' tabindex='-1')
    //- MS делает активным элементом вложенную кнопку, но мне это представляется излишним
    li.menu__item(role='presentation')
      button.menu__area(aria-posinset='4' aria-setsize='6' aria-disabled='false' role='menuitem' tabindex='-1')
        i.icon
        span.menu__label Duplicate list
    li.menu__item(aria-posinset='5' aria-setsize='6' aria-disabled='false' role='menuitem' tabindex='-1')
    li.menu__divider(role='separator' aria-hidden='true')
    li.ms-ContextualMenu-item.ms-ContextualMenu-item-destructive.item-65(role='presentation')
      button.ms-ContextualMenu-link.root-67(aria-posinset='6' aria-setsize='6' aria-disabled='false' role='menuitem' tabindex='0')
        .ms-ContextualMenu-linkContent.linkContent-71
          i.icon.fontIcon.ms-Icon.ms-Icon--Delete.iconSize-24(aria-hidden='true')
          span.ms-ContextualMenu-itemText.label-77 Delete list
```

## Роль радиокнопок

```pug
li
  ul(role='group' data-option='font-color' aria-label='Text Color')
    li(role='menuitemradio' aria-checked='true') Black
    li(role='menuitemradio' aria-checked='false') Blue
    li(role='menuitemradio' aria-checked='false') Red
    li(role='menuitemradio' aria-checked='false') Green
```
