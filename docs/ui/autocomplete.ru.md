# Автодополнение (autocomplete)

Текстовое поле с возможностью выбора предопределенных вариантов из списка. Может быть реализовано с помощью стандартных тегов `datalist`, `option`, `input`. Поддержка браузерами > 97%.

```pug
label(for='myHouse') Choose your magical house:

input#input-browsers(list='list-browsers' name='browsers' placeholder='type here...')
datalist#list-browsers
  option(value='Edge')
  option(value='Firefox')
  option(value='Chrome')
  option(value='Opera')
  option(value='Safari')
```




