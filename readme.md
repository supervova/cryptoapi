# Веб-сайт CryptoAPI.ai — AI-брокера и консультанта для криптовалютного рынка

## Памятка

Запуска локального сервера с переменной окружения:

```sh
NODE_ENV=development gulp dev
```

Я также добавил команды сборки в scripts, но чтобы они заработали надо обновить gulp-cli. Пока не занимался.

```sh
npm run dev

# для сборки
npm run build
```

- Для моментального обновления вёрстки на «боевом» сервере надо в браузере отключить куки — см. инструкции в notes/projects
- Чтобы в путях вложенных файлов, добавлялся префикс /projects/cryptoapi.ai, а в head добавлялись веб-шрифты, нужно в PHP-контроллере каждого шаблона добавлять соответствующие значения в ExtraData.
- Макросы не получают переменную префикса пути `assets_prefix` из ExtraData, поэтому вынужден использовать только инклюды.
- А в инклюды, содержащие вложенные инклюды с переменными из ExtraData, — главным образом блоки с иконками — надо явно передавать ExtraData, потому что у них нет доступа по умолчанию.
`{% include 'partials/x.twig' with {'x': x, 'ExtraData': ExtraData} only %}`
- В PHP-окружении не всегда можно передать данные из одного блока в другого: например,из `config` в `content`. Можно только через переменную определенную в контроллере — типа, `ExtraData` — но и то, с опасностью ошибок. Поэтому, самый простой вариант — определять данные для блока `content` в самом блоке:

```twig
{% block content %}
  {% set my_data = [ {# ... #} ] %}
  {# ... #}
{% endblock %}
```

### Переводы

Базовые надписи на страницах должны быть на английском. Их следует закрывать в скобки Twig-переменных и применять фильтр `trans`.

```twig
{{ 'Select your language'|trans }}
```

В папку проекта добавляем папку с переводами — translate. В нее — папки локалей: en_EN, ru_RU etc.

В папках локалей — переводы по страницам, согласно названиям twig-шаблонов: index.po, about.po etc.

Каждый файл начинается «шапки»:

```po
msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\n"
"Plural-Forms: nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);\n"
```

Далее следуют пары строк:

- msgid — строка на английском, одновременно используется, как id
- msgstr — перевод

```po
msgid "Add metrics"
msgstr "Добавить показатели"
```

Каждая пара, включая первую, отбивается сверху пустой строкой.

☝️🧐 Переводы компонентов-инклюдов — header, footer и т.п. — можно переводить отдельно, чтобы не повторрять в po-файлах каждой страницы. Однако, нельзя вынести в отдельные файлы переводы общих для всего сайта надписей — например, Submit, Cancel etc. Их надо повторять в переводах для каждой страницы.

При сборке циклами, в ассоциативных массивах записываются англоязычные термины, а в `for` к ним уже применяется фильтр `trans`.

```twig
{% set data_menu = {
  "home": {
    "label": "Home",
    "href": "/",
    "icon": "home",
    "classes": "tablet:d-none"
  },
  {# etc #}
} %}

<ul>
  {% for key, item in data_menu %}
    <li class="e-navbar__menu-item is-{{ key }}">
      <a href="{{ item.href }}">
        {% include 'partials/icon.twig' with { name: item.icon } %}
        {{ item.label|trans }}
      </a>
    </li>
  {% endfor %}
</ul>
```

☝️🧐 Если в циклах переводимые ключи надо указывать без кавычек, то ключи из po, надо всегда записывать в кавычках — даже, если это точечная нотация.

{{ 'Hello world'|trans }}
{{ 'alert.request'|trans }}

## Структура папок

```text
cryptoapi/
├── dist/                       # Папка локального сервера
├── docs/                       # Документация
├── public/                     # Папка для production
│   ├── assets/                 # Подключаемые ресурсы
│   |   ├── css/
│   |   ├── fonts/
│   |   ├── js/
│   |   └── img/
│   ├── favicon.ico
│   ├── favicon.svg
│   └── manifest.json           # Файл манифеста для PWA
├── src/
│   ├── assets/                 # Исходные файлы интерфейсов
│   │   ├── css                 # Собранные CSS-файлы до пост-процессинга и оптимизации
│   │   ├── data
│   │   │   └── fixtures/       # Тестовые данные в формате JSON
│   │   ├── fonts/
│   │   ├── img/                # Исходные изображения
│   │   │   ├── components/
│   │   │   ├── cryptologos/
│   │   │   ├── icons/
│   │   │   ├── pages/
│   │   │   └── placeholders/   # Временные картинки
│   │   ├── js/
│   │   │   ├── *.js            # Исходные скрипты, ESM
│   │   │   └── main.js
│   │   └── scss/               # Исходные стили
│   │       ├── abstracts/      # Примеси, функции, пользовательские селекторы и медиазапросы
│   │       ├── content/        # Типографика
│   │       ├── form/           # Стили компонентов формы
│   │       ├── helpers/        # Вспомогательные классы
│   │       ├── markets/        # Стили графиков и котировок
│   │       ├── pages/          # Стили страниц
│   │       ├── _*.scss         # Стили компонентов и переменные
│   │       └── main.scss
│   ├── engine/                 # PHP-контроллеры
│   └── twig/                   # Twig-шаблоны страниц и служебные HTML-файлы
│       ├── data/               # Общие данные для нескольких страниц
│       ├── partials/           # Общие блоки шаблонов страниц
│       └── *.twig              # Основная разметка шаблонов страниц
├── .editorconfig               # Настройки форматирования кода — помогают поддерживать единый стиль в разных редакторах и IDE.
├── .env                        # Переменные окружения
├── gulpfile.js                 # Конфигурация Gulp для сборки проекта
├── package.json                # Зависимости Node.js и настройки линтеров
├── phpcs.xml.dist              # Конфигурация для PHP CodeSniffer — стандарты кодирования PHP
└── readme.md                   # Этот файл
```

## Правила именования папок и файлов

Соответствуют стандарту PSR-4 для автозагрузки классов в PHP, который является частью рекомендаций PHP-FIG (PHP Framework Interop Group).

- Папки с пространствами имён и классами пишутся в PascalCase (с большой буквы, без дефисов и подчеркиваний): Controllers/, Models/
- Имена файлов классов тоже должны быть в PascalCase: UserController.php, BaseModel.php
- Название файла должно точно соответствовать имени класса.

Для папок, которые не содержат классы (например, конфиги, шаблоны, «статика»), используются «шашлычный» регистр — строчные буквы, через дефисы: config/, templates/, assets/.
