<?php

/**
 * Контроллер главной страницы приложения с виджетами торговых сигналов,
 * графиками активов и панелями управления AI-агентами.
 */

// Проверка авторизации пользователя
// Удалено закрытие Memcache старым методом "на всякий случай".
// Соединение с Memcache закрывается автоматически при завершении скрипта.
if (!$islogged) {
    header('Location: https://' . $authhost . '/auth?returl=' . urlencode($thispagesimpleurl));
    exit;
}

// Получение окружения приложения (development/production) из переменной окружения APP_ENV
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

// Подготовка массива данных
$page_meta = [
    'app' => true,
    'desc' => 'Monitor the crypto market in real time, get trading signals, ' .
        'and manage AI-powered agents for smarter, faster trading decisions.',
    'styles' => 'dashboard.css',
    'title' => 'AI Crypto Trading Dashboard | Smart Agents & Market Insights – CryptoAPI.ai',
    'type'  => 'website',
];

$data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_meta);

// Константы для повторяющихся значений
const TREND_SUCCESS = 'success';
const TREND_ERROR = 'error';
const TREND_POSITIVE = 'positive';
const TREND_NEGATIVE = 'negative';
const TREND_NEUTRAL = 'neutral';

$data_objects['watchlist'] = [
    'total_value' => '980 641,14',
    'change_trend' => TREND_ERROR,
    'change_usd' => '-$19,04',
    'change_percent' => '0%',
    'all_time_trend' => TREND_SUCCESS,
    'all_time_change_usd' => '+$261 733,12',
    'all_time_change_percent' => '26,69%',
    'assets' => [
        ['symbol' => 'TRX', 'fullname' => 'TRON', 'value' => '0,25',
            'change' => '+3,37%', 'trend' => TREND_POSITIVE],
        ['symbol' => 'LTC', 'fullname' => 'Litecoin', 'value' => '79,64',
            'change' => '+1,31%', 'trend' => TREND_POSITIVE],
        ['symbol' => 'USDT', 'fullname' => 'Tether USDt', 'value' => '1,0000',
            'change' => '0%', 'trend' => TREND_NEUTRAL],
        ['symbol' => 'ADA', 'fullname' => 'Cardano', 'value' => '0,66',
            'change' => '-0,43%', 'trend' => TREND_NEGATIVE],
        ['symbol' => 'BTC', 'fullname' => 'Bitcoin', 'value' => '84 642,59',
            'change' => '-0,77%', 'trend' => TREND_NEGATIVE],
        ['symbol' => 'ETH', 'fullname' => 'Ethereum', 'value' => '1 628,11',
            'change' => '-0,97%', 'trend' => TREND_NEGATIVE],
    ],
];

$data_objects['signals'] = [
    ['trigger' => 'Price below', 'volume' => '30 000USD', 'type' => 'Price Trigger'],
    ['trigger' => 'AI Trend:', 'price_direction' => 'Uptrend -', 'asset' => 'BTC', 'type' => 'AI Forecast Trigger'],
    ['trigger' => 'Volume above', 'volume' => '50ETH', 'type' => 'Volume Trigger'],
];

$data_objects['advices'] = [
    ['asset' => 'ETH', 'action' => '[*verb.infinitive*]Sell', 'type' => 'sell'],
    ['asset' => 'BTC', 'action' => '[*verb.infinitive*]Buy', 'type' => 'buy'],
    ['asset' => 'SOL', 'action' => '[*verb*]Hedge', 'type' => 'hedge'],
    ['asset' => 'BTC', 'action' => 'Uptrend -', 'type' => 'uptrend', 'trend' => true],
];

$data_objects['reports'] = [
    ['action' => getphrase('[*noun*]Buy'), 'asset' => 'BTC', 'time' => '15:24', 'status' => 'pending'],
    ['action' => getphrase('[*noun*]Sell'), 'asset' => 'ETH', 'time' => '14:47', 'status' => 'success'],
    ['action' => getphrase('[*noun*]Buy'), 'asset' => 'LTC', 'time' => '13:03', 'status' => 'error'],
    ['action' => getphrase('[*noun*]Sell'), 'asset' => 'BTC', 'time' => '11:18', 'status' => 'success'],
];

$data_objects['apis'] = [
    ['name' => 'BTC Bungavy Bot', 'status' => 'active'],
    ['name' => 'ETH Grid Bot', 'status' => 'inactive'],
];

$data_objects['featured_assets'] = [
    [
        'logo' => 'sui',
        'label' => 'Top Loser',
        'ticker' => 'SUI-USD',
        'price' => '2,6530',
        'name' => 'Sui',
        'change' => '-17,78%',
        'change_class' => 'text-error',
        'card_class' => '',
    ],
    [
        'logo' => 'story',
        'label' => 'Top Gainer',
        'ticker' => 'IP-USD',
        'price' => '4,96',
        'name' => 'Story Protocol',
        'change' => '+26,69%',
        'change_class' => 'text-success',
        'card_class' => 'is-top-gainer',
    ],
    [
        'logo' => 'xrp',
        'label' => 'Trending',
        'ticker' => 'XRP-USD',
        'price' => '2,1115',
        'name' => 'XRP',
        'change' => '-2,27%',
        'change_class' => 'text-error',
        'card_class' => 'is-trending',
    ],
];

// Рендер страницы
$final_html = get_template("dashboard.twig");
