# Встроенная проверка формы

См. также [большую коллекцию шаблонов](http://html5pattern.com/), [Документацию MDN](https://developer.mozilla.org/ru/docs/Learn/HTML/Forms/Валидация_формы) и [статью на css-tricks](https://css-tricks.com/form-validation-part-1-constraint-validation-html/)

## Буквы, пробелы, дефисы и цифры

### Только буквы (отдельные поля имени и фамилии)

```html
<input id="" name="" type="text" pattern="[A-Za-z]+" required>
```

### + пробелы (одно поле для имени и фамилии)

```html
<input id="" name="" type="text" pattern="[A-Za-z\s]+" required>
```

### + дефисы (двойные имена в католических странах, двойные фамилии, города)

```html
<input id="" name="" type="text" pattern="[A-Za-z\s\-]+" required>
```

### + цифры (названия компаний)

```html
<input id="" name="" type="text" pattern="[A-Za-z\d\s\-]+" required>
```

### + точка и запятая (aдреса)

```html
<input id="" name="" type="text" pattern="[A-Za-z,.\d\s\-]+" required>
```

### + буквы с диакритикой (португальский)

```html
<input id="" name="" type="text" pattern="[A-Za-zÁÂÃÀÇÉÊÍÓÔÕÚáâãàçéêíóôõú\d\s\-]+" required>
```

## Email

```html
<input id="" name="" type="email" required>
```

## Номер кредитной карты

Для номеров используется тип "text", а не "number" — чтобы избежать интерфейса увеличения-уменьшения на единицу.

```html
<input id="" name="" type="text" maxlength="16" pattern="\d{13,16}" required>
```

## Срок действия карты (два поля по два символа)

```html
<input id="" name="" type="text" maxlength="16" pattern="\d{2}" required>
```

## Пароль

```html
<input id="" name="" type="password" pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$" required>
```

## Телефон в формате +99(99)9999-9999

```html
<input id="" name="" type="text" pattern="[\+]\d{2}[\(]\d{2}[\)]\d{4}[\-]\d{4}" required>
```

## Пользовательские сообщения

```html
<input
  id=""
  name=""
  type="text"
  oninvalid="this.setCustomValidity('Required!')"
  oninput="this.setCustomValidity('')"
  required
>
```

### Стили ошибок

```scss
.is-touched:invalid {
  box-shadow:
    inset 0 0 0 3px $color-error,
    $box-shadow-z2 !important;
  outline: 0;
}
```
