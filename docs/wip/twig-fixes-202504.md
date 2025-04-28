# Необходимые исправления в `./qwerty.blog/engine/functions.php`

## Глобальные переменные, которые доступны в логических конструкциях Twig

Сейчас значения `{$переменных}` в Smarty-синтаксисе подставляются в HTML какой-то серверной обработкой PHP. Но в Twig-контекст не передаются, поэтому их нельзя использовать в логических конструкциях.

Например, можно сделать так и в HTML в атрибуте появится правильная локаль.

```twig
<summary class="has-chevron" data-lang="{$lng_html}">
```

Но нельзя сделать так.

```twig
{% if lng_html == 'ru' %} 👈 lng_html == null
{% if '{$lng_html}' == 'ru' %} 👈 '{$lng_html}' == строке {$lng_html}
{% if {$lng_html} == 'ru' %} 👈 Ошибка компилятора
```

Поэтому, например, сейчас в переключатели языков используется «костыль» на CSS.

### Как добавить глобальные переменные, которые не нужно указывать в каждом контроллере

В `./qwerty.blog/engine/functions.php` где-нибудь после создания экземпляра движка Твиг добавить массив

```php
// После этого…
$twig = new \Twig\Environment($loader, [
  'cache' => false,
]);

// Добавляем это:
$twig->addGlobal('ExtraData', [
    'domain' => $host,
    'lang' => $lng_html,
]);
```

## Настройки Symfony Translator

В логике загрузки .po файлов через Symfony Finder есть ошибка: вместо одновременного поиска GeneralUI.po и {page}.po фактически обрабатывается только один из них. Для исправления требуется изменить фильтрацию файлов, чтобы оба для перевода использовались оба файла.

Нужно весь код в условии...

```php
if (is_dir($_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR . 'projects' . DIRECTORY_SEPARATOR . $_SERVER['HTTP_HOST'] . DIRECTORY_SEPARATOR . 'translate')) {
   /* ВОТ ЭТОТ БЛОК, ДО `else` */
}
```

...заменить на:

```php
$translator = new Symfony\Component\Translation\Translator($user_lng . '_' . mb_strtoupper($user_lng));
$translator->addLoader('po', new \Symfony\Component\Translation\Loader\PoFileLoader());

// Путь до папки translate
$translateDir = $_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR . 'projects' . DIRECTORY_SEPARATOR . $_SERVER['HTTP_HOST'] . DIRECTORY_SEPARATOR . 'translate';

// Ищем два файла: GeneralUI.po и {page}.po
$generalPoPath = glob($translateDir . DIRECTORY_SEPARATOR . '*' . DIRECTORY_SEPARATOR . 'GeneralUI.po');
$pagePoPath = glob($translateDir . DIRECTORY_SEPARATOR . '*' . DIRECTORY_SEPARATOR . str_replace('.twig', '', $tname) . '.po');

// Склеиваем найденные пути
$poFiles = array_merge($generalPoPath ?: [], $pagePoPath ?: []);

foreach ($poFiles as $filePath) {
    $pp = explode(DIRECTORY_SEPARATOR, dirname($filePath));
    $locale = array_pop($pp); // Папка — это язык, например ru_RU или en_EN
    $fp = explode('.', basename($filePath));
    $domain = count($fp) === 3 ? $fp[1] : 'messages';

    $translator->addResource(
        'po',
        $filePath,
        $locale,
        $domain
    );
}
```
