<?php

/**
 * Контроллер страницы одной валюты.
 * Отображает график, информацию об активе и (в будущем) новости/рекомендации.
 */

// Этот файл подключается из markets.class.php, если в URL есть тикер.

// ПОЛУЧЕНИЕ ТИКЕРА
// $curr определяется в markets.class.php перед include_once этого файла
if (!isset($curr) || empty(trim($curr))) {
    $fallback_lang_prefix = !empty($lng_html) ? '/' . $lng_html : '';
    // Если $curr не определена или пуста, редирект на общую страницу рынков.
    header('Location: ' . $fallback_lang_prefix . '/markets/');
    exit;
}

// Используем $curr и приводим к нижнему регистру
$ticker = strtolower(trim($curr));

// ПОДГОТОВКА БАЗОВЫХ ДАННЫХ СТРАНИЦЫ

$page_settings = [
    'app'    => true,
    // Тип страницы для OpenGraph
    'type'   => 'article',
    'slug'   => 'markets/' . $ticker,
];

// Обновляем $data_objects['page']
$data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_settings);

// ЧТЕНИЕ CRYPTO-META.JSON — НАЗВАНИЕ ВАЛЮТЫ И ИКОНКА
// Название валюты по умолчанию, если не найдено в meta
$asset_name = strtoupper($ticker);
// Название файла иконки по умолчанию
$asset_icon_filename = strtolower($ticker) . '.svg';
// Путь к иконке по умолчанию
$asset_icon_path = ($data_objects['site']['assets_prefix'] ?? '') .
                   '/assets/img/cryptologos/' . $asset_icon_filename;

// Путь к crypto-meta.json
$base_path_for_data = $_SERVER['DOCUMENT_ROOT']; // Корень документов веб-сервера
$relative_path_to_meta_json = ($data_objects['site']['assets_prefix'] ?? '') .
                              '/assets/data/crypto-meta.json';
$crypto_meta_file_path = rtrim($base_path_for_data, '/') . '/' .
                         ltrim($relative_path_to_meta_json, '/');

if (file_exists($crypto_meta_file_path)) {
    $meta_content = @file_get_contents($crypto_meta_file_path);
    if ($meta_content !== false) {
        $crypto_meta_data = json_decode($meta_content, true);
        if (
            json_last_error() === JSON_ERROR_NONE &&
            is_array($crypto_meta_data) &&
            isset($crypto_meta_data[strtoupper($ticker)])
        ) {
            $asset_meta = $crypto_meta_data[strtoupper($ticker)];
            $asset_name = $asset_meta['name'] ?? $asset_name;
            if (isset($asset_meta['icon'])) {
                $asset_icon_filename = $asset_meta['icon'];
                $icon_prefix = $data_objects['site']['assets_prefix'] ?? '';
                $asset_icon_path = $icon_prefix . '/assets/img/cryptologos/' . $asset_icon_filename;
            }
        }
    }
}

// Title и Description
$ticker_upper = strtoupper($ticker);
$data_objects['page']['title'] = sprintf(
    '%s (%s) Price Chart & Market Data – CryptoAPI.ai',
    $asset_name,
    $ticker_upper
);
$data_objects['page']['desc'] = sprintf(
    '%s (%s) — price, chart, market statistics, and analysis. Stay updated with the trends.',
    $asset_name,
    $ticker_upper
);

// ГРАФИК — ЗАПРОС К /JSON/PRICECHART
$chart_data_raw = [];
$ohl_data = [
  'open' => 'N/A',
  'high' => 'N/A',
  'low'  => 'N/A',
  'current_price' => 'N/A',
  'change_24h_percent' => 'N/A' // Это поле пока нечем заполнить
];

$api_domain = $data_objects['site']['domain'] ?? 'cryptoapi.ai';
$is_local_env = ($data_objects['ENV'] ?? 'production') == 'development' &&
                ($api_domain === 'localhost' || strpos($api_domain, '.local') !== false);
$api_protocol = $is_local_env ? 'http://' : 'https://';

// Языковой префикс для API URL, если он нужен
$api_lang_prefix = !empty($lng_html) ? '/' . $lng_html : '';
$api_url_pricechart = $api_protocol . $api_domain . $api_lang_prefix . '/json/pricechart';
// Если язык не нужен для эндпоинта /json/pricechart:
// $api_url_pricechart = $api_protocol . $api_domain . '/json/pricechart';


$api_url_params = [
    'ticker'         => $ticker, // $ticker теперь точно установлен и в нижнем регистре
    'period'         => '1d',   // Дефолтный период для первоначальной загрузки
    'timeframe'      => '1h',   // Дефолтный таймфрейм, совместимый с '1d'
    'timezoneoffset' => date('Z') / 3600, // Смещение UTC сервера
    'jsonfather'     => 'true'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url_pricechart);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($api_url_params));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Таймаут 10 секунд

$api_response_body = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($api_response_body !== false && $http_code === 200) {
    $api_response_data = json_decode($api_response_body, true);
    $is_valid_json = json_last_error() === JSON_ERROR_NONE;
    $is_valid_response_format = is_array($api_response_data) &&
                                isset($api_response_data[0], $api_response_data[1]) &&
                                $api_response_data[0] === 'OK' &&
                                is_array($api_response_data[1]);

    if ($is_valid_json && $is_valid_response_format) {
        $chart_data_raw = $api_response_data[1];
        if (!empty($chart_data_raw)) {
            $ohl_data['open'] = $chart_data_raw[0]['o'] ?? 'N/A';
            $highs_column = array_column($chart_data_raw, 'h');
            $lows_column = array_column($chart_data_raw, 'l');

            $numeric_highs = array_filter($highs_column, 'is_numeric');
            $ohl_data['high'] = !empty($numeric_highs) ? max($numeric_highs) : 'N/A';

            $numeric_lows = array_filter($lows_column, 'is_numeric');
            $ohl_data['low'] = !empty($numeric_lows) ? min($numeric_lows) : 'N/A';

            $last_candle = end($chart_data_raw);
            reset($chart_data_raw); // Важно сбросить указатель массива
            $ohl_data['current_price'] = $last_candle['c'] ?? 'N/A';
        }
    } else {
        // error_log("Asset page API ($ticker) JSON error or invalid format: HTTP $http_code, " .
        // "Body: $api_response_body");
    }
} else {
    // error_log("Asset page API ($ticker) cURL error: HTTP $http_code, " .
    // "cURL: $curl_error, Response: $api_response_body");
}

// ПЕРЕДАЧА ДАННЫХ В ШАБЛОН
$data_objects['page']['asset'] = [
    'ticker'              => strtoupper($ticker), // Для отображения, в верхнем регистре
    'name'                => $asset_name,
    'icon_path'           => $asset_icon_path,
    'open_price'          => $ohl_data['open'],
    'high_price'          => $ohl_data['high'],
    'low_price'           => $ohl_data['low'],
    'current_price'       => $ohl_data['current_price'],
    'change_24h_percent'  => $ohl_data['change_24h_percent'], // Все еще N/A
];

// Данные, которые будут переданы в JavaScript через window.APP_CONFIG в шаблоне asset.twig
$data_objects['page']['js'] = [
    'pageType'                => 'assetDetail', // Идентификатор типа страницы для JS
    'assetTicker'             => $ticker,       // Тикер в нижнем регистре для JS API запросов
    'assetName'               => $asset_name,
    'assetIconPath'           => $asset_icon_path,
    'assetOpenPrice'          => $ohl_data['open'],
    'assetHighPrice'          => $ohl_data['high'],
    'assetLowPrice'           => $ohl_data['low'],
    'assetCurrentPrice'       => $ohl_data['current_price'],
    'assetChange24hPercent'   => $ohl_data['change_24h_percent'],
    'initialChartPeriod'      => '1d',
    'initialChartTimeframe'   => '1h',
    'initialCandleData'       => $chart_data_raw,
    'assetsBasePrefix'        => $data_objects['site']['assets_prefix'] ?? '',
    'currentLang'             => $lng_html ?? 'en', // $lng_html должен быть доступен
    'isDevelopment'           => ($data_objects['ENV'] ?? 'production') === 'development',
    'devApiUrl'               => ($data_objects['ENV'] ?? 'production') === 'development'
                                 ? '/assets/data/fixtures/crypto-data-candles.json' : '',
];

$final_html = get_template("asset.twig");
