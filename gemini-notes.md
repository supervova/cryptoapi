│  > Посмотри @src/assets/js/widgets/iframe.js – этот скрипт оределяет высоту iframe со страницей виджета по содержанию    │
│    этой странице. В скрипте @src/assets/js/widgets/signals.js он помимо прочего вызывается после того, как получены      │
│    данные с сервера и отрисован DOM. Надо тоже самое сделатьи в @src/assets/js/widgets/trindex.js Сейчас высота iframe с │
│     виджетом trindex определяется до загрузик данных с сервера, в результате виджет и таблица с данными выводятся        │
│    обрезанными. Исправь, пожалуйста                                                                                      │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯

✦ Хорошо, я понял проблему. Виджет trindex не обновляет свою высоту после загрузки данных, из-за чего контент обрезается.
  Я исправлю это, добавив вызов события widget:rendered после отрисовки таблицы, как это сделано в signals.js.
 ╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
 │ ?  Edit src/assets/js/widgets/trindex.js: function displayErrorState(mes... => function displayErrorState(mes... ←    │
 │                                                                                                                       │
 │ 91       <tr>                                                                                                         │
 │ 92         <td colspan="3" class="e-assets__error">${message}</td>                                                    │
 │ 93       </tr>`;                                                                                                      │
 │ 94 +   document.body.dispatchEvent(new CustomEvent('widget:rendered'));                                               │
 │ 95   }                                                                                                                │
 │ 96                                                                                                                    │
 │ 97   // --- Rendering ---                                                                                             │
 │                                                                                                                       │
 │ Apply this change?                                                                                                    │
 │                                                                                                                       │
 │ ● 1. Yes, allow once                                                                                                  │
 │   2. Yes, allow always                                                                                                │
 │   3. No (esc)                                                                                                         │
 │                                                                                                                       │
 │ o  Edit src/assets/js/widgets/trindex.js: // src/assets/js/widgets/trind... => // src/assets/js/widgets/trind...
