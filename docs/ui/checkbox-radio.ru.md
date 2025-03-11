# Чекбоксы и радиокнопки

## Разметка

Добавлять обёртку `fieldset`, если нужны опции в столбик.

```pug
  label
    input(name='isadult' type='checkbox')
    | Сообщество содержит материалы для взрослых

  label
    input(name='enabled' type='checkbox')
    | Это сообщество доступно другим пользователям

fieldset
  label
    input(name='delivery' type='radio' value='Самовызов' checked)
    | Самовызов: Москва,  Адмирала Корнилова, вл. 5 (только будни)

  label
    input(name='delivery' type='radio' value='постамат')
    | Доставка по Москве через постаматы — ориентировочно 300 ₽
```

## Неопределенное состояние флажка

- [Indeterminate Checkboxes](https://css-tricks.com/indeterminate-checkboxes/)
- [Псевдокласс :indeterminate](http://htmlbook.ru/css/indeterminate)
- [Material Design Checkboxes Behavior](https://material.io/components/checkboxes#behavior)
