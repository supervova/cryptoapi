<?php

/**
 * Контроллер для раздела "Рынки"
 * Либо отображает список активов (markets.twig),
 * либо подключает asset.class.php для отображения страницы отдельного актива.
 */

// Проверка авторизации пользователя
if (!$islogged) {
    $redirectUrl = 'Location: https://' . ($authhost ?? 'yourdomain.com') .
        '/auth?returl=' . urlencode($thispagesimpleurl ?? '/');
    header($redirectUrl);
    exit;
}

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

    // Конфигурация колонок для таблицы (колонка 'chart' удалена)
    $data_objects['default_columns'] = [
        ['key' => 'watchlist',  'type' => 'action', 'label' => 'Watchlist', 'sortable' => false, 'visible' => false, 'tooltip' => "📋 A list of assets you want to track.<br><a href='/en/faq'>More</a>"],
        ['key' => 'asset',      'type' => 'text',   'label' => 'Asset', 'sortable' => true],
        ['key' => 'price',      'type' => 'num',    'label' => 'Price, $', 'sortable' => true],
        ['key' => 'change_24h', 'type' => 'num',    'label' => 'Chg (24H), %', 'sortable' => true],
        ['key' => 'rating',     'type' => 'num',    'label' => 'Rating', 'sortable' => true, 'tooltip' => "📊 A general score of asset attractiveness based on the TRINDX™ index and other factors.<br><a href='/en/faq'>More</a>"],
        ['key' => 'risk',       'type' => 'icon',   'label' => 'Risk', 'sortable' => false, 'tooltip' => "⚠️ A simplified risk score based on the TRINDX™ index.<br><a href='/en/faq'>More</a>"],
        ['key' => 'trindx',     'type' => 'num',    'label' => 'TRINDX', 'sortable' => true, 'tooltip' => "🤖 A trading risk index calculated by the project’s AI system.<br><a href='/en/faq'>More</a>"],
        ['key' => 'rsi',        'type' => 'num',    'label' => 'RSI (7D)', 'sortable' => true, 'tooltip' => "📈 Relative Strength Index indicating whether an asset is overbought or oversold over the selected period.<br><a href='/en/faq'>More</a>"]
    ];

    // Рендер шаблона для списка рынков
    $final_html = get_template("markets.twig");
}
