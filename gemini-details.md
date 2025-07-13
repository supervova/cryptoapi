# Использование нового

Мы с тобой разрабатываем веб-приложение для трейдинга криптовалютами с использованием ИИ-консультанта. В частности, мы получаем с сервера https://cryptoapi.ai/en/json/trindxrating.json — см. src/assets/js/markets/api.js

Ранее он содержал такой набор полей:

```json
[
  "OK",
  {
    "BTC": {
      "price": {"current": "43521.23", "yesterday": {"middle": "42100.50"}},
      "rating": 8.5,
      "risk": "low",
      "TRINDX": 745,
      "RSI7": "62.3",
      "RSI30": "55.1",
      "RSI91": "50.5",
      "RSI182": "48.2",
      "RSI365": "52.1",
      "RSI1000": "58.9",
      "market": "high"
    },
  // остальные активы
  }
]
```

Теперь добавилось несколько полей.

```json
    "BTC": {
      "RSI1000": "238",
      "RSI182": "187",
      "RSI30": "197",
      "RSI365": "193",
      "RSI7": "177",
      "RSI91": "176",
      "TRINDX": 60,
      "market": "high",
      "price": {
        "current": "118758.42000000",
        "dayago": "117431.75999999999476131052",
        "today": {
          "min": 117042.82,
          "max": 119337.36,
          "middle": 117935.82944217362
        },
        "yesterday": {
          "min": 116989.14,
          "max": 118237.99,
          "middle": 117680.03657322
        }
      },
      "rating": 9,
      "risk": "neutral"
    },
  // остальные активы
  }
]
```

В частности, появилось поле `price.dayago`. Теперь его нужно использовать в функции `calcChange` вместо `yesterday.middle` — см. src/assets/js/table/render.js.

Достаточно ли исправить `calcChange`?

```js
const calcChange = (p) =>
  p?.current && p?.yesterday?.middle
    ? ((p.current - p.yesterday.dayago) / p.yesterday.dayago) * 100
    : null;
```

Или нужно еще что-то где-то править?
