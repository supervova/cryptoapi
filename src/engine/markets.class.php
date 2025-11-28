<?php

// Получение окружения приложения (development/production)
// $data_objects должен быть инициализирован ранее (например, в init.class.php)
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

// Предполагается, что $thispath, ROOTDIR, $config['project_path'] определены ранее.

// "Маршрутизация" на основе наличия тикера в URL
if (isset($thispath[1]) && $thispath[1] === 'markets' && isset($thispath[2]) && !empty($thispath[2])) {
    // Случай 1: URL вида /en/markets/ticker или /markets/ticker (если язык не в $thispath[0])
    // Предполагаем, что $thispath[2] это тикер, если он есть и dbstr() доступна.
    $curr = dbstr($thispath[2]);

    // Подключаем контроллер страницы актива.
    // asset.class.php теперь будет использовать $curr и $data_objects и должен установить $final_html.
    $asset_controller_path = (defined('ROOTDIR') ? ROOTDIR : '') .
                             (isset($config['project_path']) ? "projects/" . $config['project_path'] : '') .
                             "/engine/asset.class.php";

    if (file_exists($asset_controller_path)) {
        include_once($asset_controller_path);
    } else {
        // Можно показать страницу 404 или редирект
        $final_html = "Error: Asset controller not found.";
    }
} else {
    // Случай 2: URL вида /markets или /en/markets (без тикера в $thispath[2])
    // Отображаем страницу с таблицей валют.

    // Данные для <head> и мета-тегов страницы списка рынков
    $page_settings = [
        'app'            => true,
        'desc'           => 'Explore cryptocurrency markets, track asset performance with real-time data, ' .
                            'ratings, and risk analysis. Sort and prepare for filtering to ' .
                            'find your next investment.',
        'search_on_page' => true,
        'styles'         => 'markets.css',
        'title'          => 'Cryptocurrency Markets | Real-Time Prices, Ratings & Analysis – CryptoAPI.ai',
        'type'           => 'website'
    ];
    $data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_settings);

    // Начальные параметры сортировки для таблицы
    $data_objects['initial_sort_field']     = 'rating';
    $data_objects['initial_sort_direction'] = 'asc';

    // Конфигурация колонок для таблицы
    $data_objects['default_columns'] = [
        ['key' => 'watchlist',  'type' => 'action', 'label' => 'Watchlist', 'sortable' => false, 'visible' => false],
        ['key' => 'asset',      'type' => 'text',   'label' => 'Asset', 'sortable' => true],
        ['key' => 'price',      'type' => 'num',    'label' => 'Price, $', 'sortable' => true],
        ['key' => 'change_24h', 'type' => 'num',    'label' => 'Chg (24H), %', 'sortable' => true],
        ['key' => 'rating',     'type' => 'num',    'label' => 'Rating', 'sortable' => true],
        ['key' => 'risk',       'type' => 'icon',   'label' => 'Risk', 'sortable' => false],
        ['key' => 'trindex',    'type' => 'num',    'label' => 'TRIndex', 'sortable' => true],
        ['key' => 'rsi',        'type' => 'num',    'label' => 'RSI (7D)', 'sortable' => true]
    ];

    // Рендер шаблона для списка рынков
    $final_html = get_template("markets.twig");
}
