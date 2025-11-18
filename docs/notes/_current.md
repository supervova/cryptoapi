# Рабочие заметки

после некоторых событий. Например.

1) Я добавляю в фильтре новые колонки, нажимаю Apply.
2) Cами колонки появляются, но данные в ячейках нет – даже тегов <td></td> нет.

```html
<table class="table has-hovered-rows has-2-liners" id="crypto-table" data-sort-field="rating" data-sort-direction="asc" aria-live="polite" aria-busy="false">
  <caption class="visually-hidden">
  Таблица данных рынка криптовалют
  </caption>
  <thead class="is-updated">
    <tr>
      <th class="table__cell is-text" scope="col" data-col-key="asset"> <div class="table__th-actions">
          <button class="e-btn is-sort  " type="button" data-sort-field="asset" aria-label="Сортировать по этой колонке" aria-sort="none"> Актив
          <svg class="e-icon" aria-hidden="true" focusable="false">
            <use xlink:href="/projects/cryptoapi.ai/assets/img/icons/sprite.svg#icon-up"></use>
          </svg>
          </button>
          <!-- Original content first -->
          <!-- Tooltip last -->
        </div></th>
      <th class="table__cell is-num" scope="col" data-col-key="price"> <div class="table__th-actions">
          <button class="e-btn is-sort  " type="button" data-sort-field="price" aria-label="Сортировать по этой колонке" aria-sort="none"> Цена, $
          <svg class="e-icon" aria-hidden="true" focusable="false">
            <use xlink:href="/projects/cryptoapi.ai/assets/img/icons/sprite.svg#icon-up"></use>
          </svg>
          </button>
          <!-- Original content first -->
          <!-- Tooltip last -->
        </div></th>
      <th class="table__cell is-num" scope="col" data-col-key="change_24h"> <div class="table__th-actions">
          <button class="e-btn is-sort  " type="button" data-sort-field="change_24h" aria-label="Сортировать по этой колонке" aria-sort="none"> Изм. (24ч), %
          <svg class="e-icon" aria-hidden="true" focusable="false">
            <use xlink:href="/projects/cryptoapi.ai/assets/img/icons/sprite.svg#icon-up"></use>
          </svg>
          </button>
          <!-- Original content first -->
          <!-- Tooltip last -->
        </div></th>
      <th class="table__cell is-num" scope="col" data-col-key="rating"> <div class="table__th-actions">
          <button class="e-btn is-sort is-active " type="button" data-sort-field="rating" aria-label="Сортировать по этой колонке" aria-sort="ascending"> Рейтинг
          <svg class="e-icon" aria-hidden="true" focusable="false">
            <use xlink:href="/projects/cryptoapi.ai/assets/img/icons/sprite.svg#icon-up"></use>
          </svg>
          </button>
          <!-- Original content first -->

          <span class="has-rich-tooltip is-bottom-right" data-tooltip-initialized="true"> <span class="tooltip__trigger" aria-describedby="tt-js-rating">
          <svg class="e-icon is-sm" aria-hidden="true" focusable="false">
            <use xlink:href="/projects/cryptoapi.ai/assets/img/icons/sprite.svg#icon-sm-help"></use>
          </svg>
          </span> <span class="tooltip" id="tt-js-rating" role="tooltip"> 📊 Обобщённая оценка привлекательности актива на основе индекса TRINDX™ и других факторов.<br>
          <a href="/ru/faq">Подробнее</a> </span> </span> <!-- Tooltip last -->
        </div></th>
      <th class="table__cell is-icon" scope="col" aria-label="Риск" data-col-key="risk"> <div class="table__th-actions"> Риск <!-- Original content first -->

          <span class="has-rich-tooltip is-bottom-right" data-tooltip-initialized="true"> <span class="tooltip__trigger" aria-describedby="tt-js-risk">
          <svg class="e-icon is-sm" aria-hidden="true" focusable="false">
            <use xlink:href="/projects/cryptoapi.ai/assets/img/icons/sprite.svg#icon-sm-help"></use>
          </svg>
          </span> <span class="tooltip" id="tt-js-risk" role="tooltip"> ⚠️ Упрощённая оценка рискованности актива по индексу TRINDX™.<br>
          <a href="/ru/faq">Подробнее</a> </span> </span> <!-- Tooltip last -->
        </div></th>
      <th class="table__cell is-num" scope="col" data-col-key="trindx"> <div class="table__th-actions">
          <button class="e-btn is-sort  " type="button" data-sort-field="trindx" aria-label="Сортировать по этой колонке" aria-sort="none"> TRINDX
          <svg class="e-icon" aria-hidden="true" focusable="false">
            <use xlink:href="/projects/cryptoapi.ai/assets/img/icons/sprite.svg#icon-up"></use>
          </svg>
          </button>
          <!-- Original content first -->

          <span class="has-rich-tooltip is-bottom-right" data-tooltip-initialized="true"> <span class="tooltip__trigger" aria-describedby="tt-js-trindx">
          <svg class="e-icon is-sm" aria-hidden="true" focusable="false">
            <use xlink:href="/projects/cryptoapi.ai/assets/img/icons/sprite.svg#icon-sm-help"></use>
          </svg>
          </span> <span class="tooltip" id="tt-js-trindx" role="tooltip"> 🤖 Индекс торговых рисков, рассчитываемый ИИ-системой проекта.<br>
          <a href="/ru/faq">Подробнее</a> </span> </span> <!-- Tooltip last -->
        </div></th>
      <th class="table__cell is-num" scope="col" data-col-key="rsi_7d"> <div class="table__th-actions">
          <button class="e-btn is-sort  " type="button" data-sort-field="rsi_7d" aria-label="Сортировать по этой колонке" aria-sort="none"> RSI (7&nbsp;дн.)
          <svg class="e-icon" aria-hidden="true" focusable="false">
            <use xlink:href="/projects/cryptoapi.ai/assets/img/icons/sprite.svg#icon-up"></use>
          </svg>
          </button>
          <!-- Original content first -->

          <span class="has-rich-tooltip is-bottom-right" data-tooltip-initialized="true"> <span class="tooltip__trigger" aria-describedby="tt-js-rsi_7d">
          <svg class="e-icon is-sm" aria-hidden="true" focusable="false">
            <use xlink:href="/projects/cryptoapi.ai/assets/img/icons/sprite.svg#icon-sm-help"></use>
          </svg>
          </span> <span class="tooltip" id="tt-js-rsi_7d" role="tooltip"> 📈 Индекс относительной силы, показывающий перекупленность или перепроданность актива за указанный период.<br>
          <a href="/ru/faq">Подробнее</a> </span> </span> <!-- Tooltip last -->
        </div></th>
      <th class="table__cell is-num" scope="col" data-col-key="rsi_30d"> <div class="table__th-actions">
          <button class="e-btn is-sort  " type="button" data-sort-field="rsi_30d" aria-label="Сортировать по этой колонке" aria-sort="none"> RSI (1 мес.)
          <svg class="e-icon" aria-hidden="true" focusable="false">
            <use xlink:href="/projects/cryptoapi.ai/assets/img/icons/sprite.svg#icon-up"></use>
          </svg>
          </button>
          <!-- Original content first -->

          <span class="has-rich-tooltip is-bottom-right" data-tooltip-initialized="true"> <span class="tooltip__trigger" aria-describedby="tt-js-rsi_30d">
          <svg class="e-icon is-sm" aria-hidden="true" focusable="false">
            <use xlink:href="/projects/cryptoapi.ai/assets/img/icons/sprite.svg#icon-sm-help"></use>
          </svg>
          </span> <span class="tooltip" id="tt-js-rsi_30d" role="tooltip"> 📈 Индекс относительной силы, показывающий перекупленность или перепроданность актива за указанный период.<br>
          <a href="/ru/faq">Подробнее</a> </span> </span> <!-- Tooltip last -->
        </div></th>
    </tr>
  </thead>
  <tbody id="crypto-table-body">
    <tr id="asset-row-BTC" data-asset-symbol="BTC" class="is-clickable">
      <td class="table__cell is-text is-2-liner"><a class="table__link" href="/markets/btc">
        <div class="e-asset">
          <div class="e-asset__copy"> <span class="e-asset__name">Bitcoin</span> <span class="e-asset__symbol">BTC-USD</span> </div>
          <figure class="e-asset__figure" data-fallback="BTC"> <img class="e-asset__icon" src="/images/coins/BTC.png" alt="" width="32" height="32"> </figure>
        </div>
        </a></td>
      <td class="table__cell is-num"><a class="table__link" href="/markets/btc">100,879.72</a></td>
      <td class="table__cell is-num is-negative"><a class="table__link" href="/markets/btc">-2.78</a></td>
      <td class="table__cell is-num"><a class="table__link" href="/markets/btc">3</a></td>
      <td class="table__cell is-icon"><a class="table__link" href="/markets/btc"><span class="has-tooltip" aria-label="Низкий риск">
        <svg class="e-icon is-success" aria-hidden="true" focusable="false">
          <use xlink:href="/projects/cryptoapi.ai/assets/img/icons/sprite.svg#icon-success"></use>
        </svg>
        </span></a></td>
      <td class="table__cell is-num"><a class="table__link" href="/markets/btc">1.66</a></td>
      <td class="table__cell is-num"><a class="table__link" href="/markets/btc">21</a></td>
    </tr>
    <tr id="asset-row-XRP" data-asset-symbol="XRP" class="is-clickable">
      <td class="table__cell is-text is-2-liner"><a class="table__link" href="/markets/xrp">
        <div class="e-asset">
          <div class="e-asset__copy"> <span class="e-asset__name">XRP</span> <span class="e-asset__symbol">XRP-USD</span> </div>
          <figure class="e-asset__figure" data-fallback="XRP"> <img class="e-asset__icon" src="/images/coins/XRP.png" alt="" width="32" height="32"> </figure>
        </div>
        </a></td>
      <td class="table__cell is-num"><a class="table__link" href="/markets/xrp">2.18</a></td>
      <td class="table__cell is-num is-negative"><a class="table__link" href="/markets/xrp">-7.79</a></td>
      <td class="table__cell is-num"><a class="table__link" href="/markets/xrp">4</a></td>
      <td class="table__cell is-icon"><a class="table__link" href="/markets/xrp"><span class="has-tooltip" aria-label="Низкий риск">
        <svg class="e-icon is-success" aria-hidden="true" focusable="false">
          <use xlink:href="/projects/cryptoapi.ai/assets/img/icons/sprite.svg#icon-success"></use>
        </svg>
        </span></a></td>
      <td class="table__cell is-num"><a class="table__link" href="/markets/xrp">1.88</a></td>
      <td class="table__cell is-num"><a class="table__link" href="/markets/xrp">29</a></td>
    </tr>
  </tbody>
</table>
```

3) Однако, когда я начинаю прокручивать таблицу, ячейки новой колонки вместе с содержимым начинают появляться.

Надо сделать так, чтобы они появлялись сразу после нажатия Apply в панели фильтров.

Также надо сделать полное обновление данных таблицы после сброса строки поиска/фильтрации в поле `#header-search`. Сейчас после очистки поля, до обновления таблицы через таймер показываются не все строки, а только какая-то часть.

У меня есть такая разметка

Надо добавить в та
