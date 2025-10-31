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
    'app' => true,
    'classes' => 'is-asset',
    'slug'   => 'markets/' . $ticker,
    'styles' => 'markets.css',
     // Тип страницы для OpenGraph
    'type'   => 'article',
];

// Обновляем $data_objects['page']
$data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_settings);

$ticker_upper = strtoupper($ticker);
$asset_name = $ticker_upper;
$asset_icon_path = '/images/coins/' . $ticker_upper . '.png';

$api_domain = $data_objects['site']['domain'] ?? 'cryptoapi.ai';
$is_local_env = ($data_objects['ENV'] ?? 'production') === 'development' &&
                ($api_domain === 'localhost' || strpos($api_domain, '.local') !== false);
$api_protocol = $is_local_env ? 'http://' : 'https://';
$api_lang_prefix = !empty($lng_html) ? '/' . $lng_html : '';

$asset_directory = [];

if (!$is_local_env) {
    $trindx_url = $api_protocol . $api_domain . $api_lang_prefix . '/json/trindxrating';
    $trindx_params = [
        'jsonfather' => 'true',
    ];

    $curl_trindx = curl_init();
    curl_setopt($curl_trindx, CURLOPT_URL, $trindx_url);
    curl_setopt($curl_trindx, CURLOPT_POST, true);
    curl_setopt($curl_trindx, CURLOPT_POSTFIELDS, http_build_query($trindx_params));
    curl_setopt($curl_trindx, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl_trindx, CURLOPT_TIMEOUT, 10);

    $trindx_response = curl_exec($curl_trindx);
    $trindx_status = curl_getinfo($curl_trindx, CURLINFO_HTTP_CODE);
    curl_close($curl_trindx);

    if ($trindx_response !== false && $trindx_status === 200) {
        $decoded = json_decode($trindx_response, true);
        if (
            json_last_error() === JSON_ERROR_NONE &&
            is_array($decoded) &&
            isset($decoded[0], $decoded[1]) &&
            $decoded[0] === 'OK' &&
            is_array($decoded[1])
        ) {
            $asset_directory = $decoded[1];
        }
    }
}

if (empty($asset_directory)) {
    $fixture_candidates = [
        dirname(__DIR__) . '/assets/data/fixtures/crypto-data.json',
        rtrim($_SERVER['DOCUMENT_ROOT'], '/') .
        '/projects/cryptoapi.ai/assets/data/fixtures/crypto-data.json',
    ];

    foreach ($fixture_candidates as $fixture_path) {
        if (!is_readable($fixture_path)) {
            continue;
        }
        $fixture_content = file_get_contents($fixture_path);
        if ($fixture_content === false) {
            continue;
        }
        $fixture_decoded = json_decode($fixture_content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            continue;
        }
        if (
            is_array($fixture_decoded) &&
            isset($fixture_decoded[0], $fixture_decoded[1]) &&
            $fixture_decoded[0] === 'OK' &&
            is_array($fixture_decoded[1])
        ) {
            $asset_directory = $fixture_decoded[1];
            break;
        }
        if (is_array($fixture_decoded) && !isset($fixture_decoded[0])) {
            $asset_directory = $fixture_decoded;
            break;
        }
    }
}

$asset_entry = [];
if (!empty($asset_directory)) {
    $asset_entry = $asset_directory[$ticker_upper] ??
                   $asset_directory[strtolower($ticker_upper)] ??
                   [];
}

if (
    is_array($asset_entry) &&
    isset($asset_entry['name']) &&
    is_string($asset_entry['name']) &&
    $asset_entry['name'] !== ''
) {
    $asset_name = $asset_entry['name'];
}

// Title и Description
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

$api_url_pricechart = $api_protocol . $api_domain . $api_lang_prefix . '/json/pricechart';

$api_url_params = [
    'ticker'         => $ticker,
    'period'         => '1d',
    'timeframe'      => '1h',
    'timezoneoffset' => date('Z') / 3600,
    'jsonfather'     => 'true'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url_pricechart);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($api_url_params));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

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
            reset($chart_data_raw);
            $ohl_data['current_price'] = $last_candle['c'] ?? 'N/A';
        }
    }
}

// ПЕРЕДАЧА ДАННЫХ В ШАБЛОН
$data_objects['page']['asset'] = [
    'ticker'              => strtoupper($ticker),
    'name'                => $asset_name,
    'icon_path'           => $asset_icon_path,
    'open_price'          => $ohl_data['open'],
    'high_price'          => $ohl_data['high'],
    'low_price'           => $ohl_data['low'],
    'current_price'       => $ohl_data['current_price'],
    'change_24h_percent'  => $ohl_data['change_24h_percent'],
];

// Данные, которые будут переданы в JavaScript через window.APP_CONFIG
$data_objects['page']['js'] = [
    'pageType'                => 'assetDetail',
    'assetTicker'             => $ticker,
    'assetName'               => $asset_name,
    'assetIconPath'           => $asset_icon_path,
    'assetOpenPrice'          => $ohl_data['open'],
    'assetHighPrice'          => $ohl_data['high'],
    'assetLowPrice'           => $ohl_data['low'],
    'assetCurrentPrice'       => $ohl_data['current_price'],
    'assetChange_24h_percent' => $ohl_data['change_24h_percent'],
    'initialChartPeriod'      => '1d',
    'initialChartTimeframe'   => '5m',
    'initialCandleData'       => $chart_data_raw,
    'assetsBasePrefix'        => $data_objects['site']['assets_prefix'] ?? '',
    'currentLang'             => $lng_html ?? 'en',
    'isDevelopment'           => ($data_objects['ENV'] ?? 'production') === 'development',
    'devApiUrl'               => ($data_objects['ENV'] ?? 'production') === 'development'
                                 ? '/assets/data/fixtures/crypto-data-candles.json' : '',
];

$final_html = get_template("asset.twig");
