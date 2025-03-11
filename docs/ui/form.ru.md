# Форма

## Специальные атрибуты

### `inputmode`

Используется для выбора подходящей клавиатуры на мобильных устройствах.

```html
<input type="text" inputmode="url">
<input type="text" inputmode="email">
<input type="text" inputmode="search">
<input type="text" inputmode="numeric">
<input type="text" inputmode="tel">
```

Клавиатура для значения `inputmode="decimal"` почти идентична клавиатуре для `inputmode="tel"`. Но вместо клавиши `+*#` появляется клавиша десятичной точки (для англоязычного формата дробей).

```html
<input type="text" inputmode="decimal">
```

### `enterkeyhint`

Меняет текст кнопки ввода на клавиатуре мобильных устройств. Возможные значения:

- enter
- done
- go
- next
- previous
- search
- send

### `form`

Если разметка вынуждает вынести поле за пределы формы, можно получать из него данные и передавать на сервер с помощью атрибуты-ссылки `form`.

```html
<form id="my-form" action="/form.php">
  <input id="name">
  <button type="submit">
</form>

<input type="email" form="my-form">
```

### `label` для `optgroup`

```html
<select>
  <option>--Your Favourite Animal--</option>
  <optgroup label="Birds">
    <option>Blue Jay</option>
    <option>Cardinal</option>
    <option>Hummingbird</option>
  </optgroup>
</select>
```

### `multiple` для `[type='email']` и `[type='file']`

```html
<input name="form-file" type="file" multiple>
```

### `autocomplete`

Позволяет заполнять значения полей из профиля браузера.

Для комбобоксов и полей поиска, как правило, выключается.

```html
<input
  name="q"
  type="search"
  autocorrect="off"
  autocapitalize="off"
  autocomplete="off"
  spellcheck="false"
  aria-label="Search apple.com"
  placeholder="Search apple.com"
>
```

Но для других полей есть полезные значения.

- `name` — для поля полного имени
- `given-name` — имя
- `family-name` — фамилия
- `username` — пользовательское имя
- `email` — полезно для форм авторизации
- `tel-country-code`
- `street-address`
- `address-line1` и `address-line2` (адрес в два поля привычен только для американцев; поэтому для международных проектов второе поле либо не делать, либо не делать его обязательным)
- `postal-code`
- `cc-name` — имя на кредитной карте
- `cc-number` — номер карты
- `cc-exp`, `cc-exp-month`, `cc-exp-year` — срок окончания действия карты полностью или разитый на два поля
- `cc-csc` — проверочный код
- `one-time-code` — проверочны код двухфакторной авторизации

## Разметка

См. также:

- [`WTF, forms?`](http://wtfforms.com/). Стилизация сложных для CSS полей формы: чекбоксов, радиокнопок, загрузки файлов. Проект Марка Отто.
- [The Cleanest Trick for Autogrowing Textareas](https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/)

### Поле на всю ширину формы

```pug
//- Full width input

p
  label(for='form-my-input') Label
  input#form-my-input(name='name' type='text' placeholder='Label')
  small(role='alert') Message

p
  label(for='form-my-email') * Label:
  input#form-my-email(name='email' inputmode='email' type='email' required)

p
  label(for='form-my-textarea') * Label
  textarea#form-my-textarea(name='comment' required)
    | Placeholder
  small(role='alert') Message
```

### Несколько полей в ряд

```pug
.grid
  p.col-1#{/}2
    +formItem('Caption', 'my-name', 'text', false, 'Message')(required=true)
  p.col-1#{/}2
    //- etc
```

### Социальная авторизация

```pug
p Continue with your social network or messenger account:

ul.btns.is-social-login
  li
    +button('Facebook', 'brand-facebook', 'is-icon is-ghost', true)(onclick='facebookoauth()')
  li
    +button('Google', 'brand-google', 'is-icon is-ghost', true)(onclick='googleoauth()')
  li
    +button('Facebook', 'brand-yandex', 'is-icon is-ghost', true)(onclick='yandexoauth()')
  li
    +button('Facebook', 'brand-telegram', 'is-icon is-ghost', true)(onclick='preloginmsg(\'telegram\')')
  li
    +button('Facebook', 'brand-viber', 'is-icon is-ghost', true)(onclick='preloginmsg(\'viber\')')
```

### Всё вместе: основные типы полей, валидация с «регулярками»

```pug
form#form-needs-validation(action='/', method='post', novalidate)
  input(type='hidden', name='my-hidden-stuff', value='')

  p
    +formItem('Name', 'name', 'text', false, 'Message')(value='', maxlength='128', pattern='[A-Za-z -]+', required=true)

  p
    +formItem('Email', 'email', 'email', false, 'Message')(inputmode='email', value='', maxlength='128', required=true)
    small(role='alert') Message

  .grid.phone#{:}grid-3
    p.col-1#{/}3
      +formItem('Country code', 'country-code', 'text', false, 'Message')(inputmode='numeric', value='', maxlength='3', pattern='\d{3}', required=true)

    p.col-2#{/}3
      +formItem('Phone number', 'phone', 'text', false, 'Message')(inputmode='numeric', value='', maxlength='9', pattern='\d{8,9}', required=true)

  p
    label(for='form-state') State
    select#form-state(name='state')
      option(value='AL') Alabama
      option(value='AK') Alaska
      option(value='AZ') Arizona

  p.form__option
    input#form-terms(type='checkbox', name='terms', required)
    label(for='form-terms')
      | You agree to our
      a(href='', target='_blank', rel='noopener noreferrer') Terms


  button#form-submit.btn.is-primary(type='submit') Sign Up
    svg.spinner.is-sm(xmlns='http://www.w3.org/2000/svg', viewbox='0 0 48 48')
      circle.spinner__circle(cx='24', cy='24', r='20')
```
