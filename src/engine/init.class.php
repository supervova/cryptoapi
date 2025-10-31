<?php

/**
 * Общий «инициализатор»: загрузка конфигурации, проверка авторизации,
 * подготовка данных для шаблонов.
 */

// Разбор пути страницы
$routes = explode('/', $_REQUEST['routestring'] ?? '');
$current_page = !empty($routes[1]) ? $routes[1] : 'home';

// Получение окружения: development или production
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

if (!function_exists('fetch_marketdata')) {
    /**
     * Получает marketdata через POST x-www-form-urlencoded.
     *
     * @param int $timeout  секунд ожидания ответа
     * @return array|null   Распарсенный payload[1] либо null при ошибке
     */
    function fetch_marketdata(int $timeout = 3): ?array
    {
        $url  = 'https://cryptoapi.ai/json/marketdata';

        // Тело запроса: если jsonfather  не нужен, можно оставить пустую строку
        $postBody = http_build_query([
            'jsonfather' => 'true',
        ]);

        // stream_wrapper
        $ctx = stream_context_create([
            'http' => [
                'method'  => 'POST',
                'timeout' => $timeout,
                'header'  => implode("\r\n", [
                    'Content-Type: application/x-www-form-urlencoded',
                    'Accept: application/json',
                    'Content-Length: ' . strlen($postBody),
                ]),
                'content' => $postBody,
            ],
        ]);
        $json = @file_get_contents($url, false, $ctx);

        // fallback на cURL
        if ($json === false && function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $postBody,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => $timeout,
                CURLOPT_HTTPHEADER     => [
                    'Content-Type: application/x-www-form-urlencoded',
                    'Accept: application/json',
                ],
            ]);
            $json = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($code !== 200) {
                $json = false;
            }
        }

        if ($json === false) {
            error_log('marketdata POST failed');
            return null;
        }

        $payload = json_decode($json, true);
        if (json_last_error() !== JSON_ERROR_NONE || $payload[0] !== 'OK') {
            error_log('marketdata JSON parse error');
            return null;
        }

        return $payload[1];   // полезная часть ответа
    }
}

// Глобальные параметры сайта
$version_file = __DIR__ . '/../../dist/assets/css/main.css';
$assets_version = file_exists($version_file) ? filemtime($version_file) : time();

$data_objects['site'] = [
  'assets_prefix' => '/projects/cryptoapi.ai',
  'assets_version' => $assets_version,
  'desc' => $blog_description ?? 'Unlock the power of advanced APIs designed for crypto traders and analysts. ' .
    'Access real-time market insights, trading signals, custom indices, and automated tools to boost your trading ' .
    'performance.',
  'domain' => $thisdomain ?? 'cryptoapi.ai',
  // 'fgi' => $fgi ?? 44,
  'fonts_google' => 'Inter:wght@300;400;600',
  'languages' => $languages ?? ['en', 'ru'],
  'header_stats' => $header_stats ?? [3.78, -25.3],
  'id' => $thisprojectid ?? 43,
  'timezone_offset' => date('Z') / 3600,
  'title' => $blog_title ?? 'CryptoAPI.ai – Advanced APIs for Crypto Traders and Market Analytics'
];

$market = fetch_marketdata();

$data_objects['site']['header_stats'] = [
    'btc_price' => $market['BTC']['price']   ?? null,
    'btc_diff'  => $market['BTC']['diff']    ?? null,
    'all_diff'  => $market['all']['diff']    ?? null,
    'level'     => $market['level']          ?? null,
    'fgi'       => $market['fear_and_greed'] ?? null,
];

// Данные текущей страницы
$data_objects['page'] = [
  'app' => false,
  'classes' => false,
  'content' => $page_content_html ?? '',
  'desc' => $meta_description ?? '',
  'lang' => $lng_html ?? 'en',
  'legacy_js' => $thispagejs ?? '',
  'script_start' => $startruntime ?? '',
  'slug' => $current_page ?? '',
  'title' => $meta_title ?? '',
  'type' => 'article',
];

// В котроллерах страниц присваивать значения элементу массива, если нужно
// добавить или изменить одно или пару полей
// $data_objects['page']['classes'] = 'page is-hello';

// или array_merge(), если обновляемых, добавляемых полей много
// $data_objects['page'] = array_merge(
//   $data_objects['page'] ?? [],
//   [
//     'classes' => 'page is-hello',
//     'desc' => 'hello, world',
//     'title' =>  'welcome',
//   ]
// );

// Данные пользователя
$data_objects['user'] = [
  'avatar' => $userdata['avatarbox'] ?? '',
  'id' => $user_id,
  'name' => $username ?? '',
  'balance' => $user_balancefnall ?? '',
];

// Для обратной совместимости (если старые шаблоны ещё используют ExtraData)
$data_objects['ExtraData'] = [
  'title' => $data_objects['page']['title'] ?? '',
  'desc' => $data_objects['page']['desc'] ?? '',
  'body_classes' => $data_objects['page']['classes'] ?? false,
  'lang' => $data_objects['page']['lang'] ?? '',

  'assets_prefix' => $data_objects['site']['assets_prefix'] ?? '',
  'domain' => $data_objects['site']['domain'] ?? '',

  'user_id' => $data_objects['user']['id'] ?? null,
  'user_name' => $data_objects['user']['name'] ?? '',
  'user_avatar' => $data_objects['user']['avatar'] ?? '',
];

$data_objects['UserId'] = $data_objects['user']['id'] ?? null;
$data_objects['Page'] = $data_objects['page']['slug'] ?? null;


//// Статистика проекта:
$project_stat = memcache_get($memcache_obj, "projecttradestat".$thisprojectid);
if (empty($project_stat))
{
$project_stat = array();
$stat_period = '1y';
while(true)
{
if ($stat_period == '1y') {
    $dateto = date('Y-m-d', strtotime('+1 day'));
    $datefrom = date('Y-m-d', strtotime('-1 year'));
}
else {
    $dateto = date('Y-m-d', strtotime('+1 day'));
    $datefrom = date('Y-m-d', strtotime('-1 month'));
}

$deals = $db->super_query("SELECT curr, lasttimebuy as buytime, timesell as saletime, round(profit/(pricebuy/100),2) as profitperc FROM cryptosignals_trade WHERE sold=1 and profit>0 and timesell >= '".$datefrom."' and timesell <= '".$dateto."' and lasttimebuy >= '".$datefrom."' and lasttimebuy <= '".$dateto."' UNION SELECT curr, timebuy as buytime, timesale as saletime, round(profit/(sumbuy/100),2) as profitperc FROM cryptotrade WHERE sold=1 and profit>0 and timesale >= '".$datefrom."' and timesale <= '".$dateto."' and timebuy >= '".$datefrom."' and timebuy <= '".$dateto."' and curr not in (select curr from cryptosignals_trade where date(lasttimebuy)=date(cryptotrade.timebuy)) ", true);

// ------------------------------
// НАСТРОЙКИ
// ------------------------------
$initial_capital = 10000.0;  // стартовый капитал
$deal_share      = 0.10;     // доля от свободного капитала
$max_exposure    = 0.50;     // ограничитель экспозиции (включён в формулу ставки)

// ------------------------------
// ФУНКЦИЯ: закрыть сделку и записать лог
// ------------------------------
if (!function_exists('close_and_log')) {
function close_and_log($pos, &$current_capital, &$deal_log) {
    $proceeds = $pos['amount'] * $pos['factor'];
    $profit_amount = $pos['amount'] * ($pos['factor'] - 1.0);
    $current_capital += $proceeds;

    $deal_log[] = array(
        'curr'                 => $pos['curr'],
        'buytime'              => date('Y-m-d H:i:s', $pos['buytime']),
        'saletime'             => date('Y-m-d H:i:s', $pos['saletime']),
        'capital_before_deal'  => $pos['capital_before'],
        'invest'               => $pos['amount'],
        'profit_amount'        => $profit_amount,
        'profitperc'           => $pos['profitperc'],
        'capital_after_deal'   => $current_capital
    );
}
}

// ------------------------------
// ЕСЛИ СДЕЛОК НЕТ
// ------------------------------
$noDeals = (!is_array($deals) || count($deals) === 0);
if ($noDeals) {
    $report = array(
        'count'         => 0,
        'period_from'   => $datefrom,
        'period_to'     => $dateto,
        'deal_share'    => $deal_share * 100,
        'max_exposure'  => $max_exposure * 100,
        'avg_exposure'  => 0.0,
        'total_profit'  => 0.0,
        'final_capital' => $initial_capital,
        'cagr'          => 0.0,
    );
    $deal_log = array();
} else {

    // ------------------------------
    // ПОДГОТОВКА
    // ------------------------------
    foreach ($deals as &$d) {
        $d['buytime']    = strtotime($d['buytime']);
        $d['saletime']   = strtotime($d['saletime']);
        $d['profitperc'] = (float)$d['profitperc'];
    }
    unset($d);

    usort($deals, function($a, $b) {
        if ($a['buytime'] == $b['buytime']) return 0;
        return ($a['buytime'] < $b['buytime']) ? -1 : 1;
    });

    $current_capital = $initial_capital;
    $active = array();
    $deal_log = array();
    $exposure_log = array();

    // ------------------------------
    // ОСНОВНОЙ ЦИКЛ
    // ------------------------------
    $total_profitperc = 0;
    foreach ($deals as $deal) {
        $buy    = $deal['buytime'];
        $sell   = $deal['saletime'];
        $profitperc = $deal['profitperc'];
        $total_profitperc += $profitperc;
        $factor = 1.0 + ($profitperc / 100.0);

        // --- Закрываем завершённые сделки ---
        $new_active = array();
        foreach ($active as $a) {
            if ($a['saletime'] <= $buy) {
                close_and_log($a, $current_capital, $deal_log);
            } else {
                $new_active[] = $a;
            }
        }
        $active = $new_active;

        // --- Рассчёт ставки по новой формуле ---
        $capital_before = $current_capital;
        $invest = $deal_share * $current_capital * $max_exposure;
        if ($invest <= 0) continue;

        // --- Открываем сделку ---
        $current_capital -= $invest;
        $active[] = array(
            'curr'            => $deal['curr'],
            'buytime'         => $buy,
            'saletime'        => $sell,
            'amount'          => $invest,
            'factor'          => $factor,
            'profitperc'      => $profitperc,
            'capital_before'  => $capital_before
        );

        // --- Запоминаем текущую экспозицию ---
        $in_market = 0.0;
        foreach ($active as $a) $in_market += $a['amount'];
        $den = $current_capital + $in_market;
        $exposure_log[] = ($den > 0) ? ($in_market / $den) : 0.0;
    }
    $middle_profitperc = round($total_profitperc / count($deals),2);

    // --- Закрываем оставшиеся ---
    if (!empty($active)) {
        foreach ($active as $a) close_and_log($a, $current_capital, $deal_log);
        $active = array();
    }

    // ------------------------------
    // ИТОГИ
    // ------------------------------
    $final_capital = $current_capital;
    $start_time = min(array_column($deals, 'buytime'));
    $end_time   = max(array_column($deals, 'saletime'));
    $total_profit = (($final_capital - $initial_capital) / $initial_capital) * 100.0;
    $period_sec  = max($end_time - $start_time, 1);
    $period_days = $period_sec / 86400.0;
    $cagr = ($period_days < 30) ? null : pow($final_capital / $initial_capital, 365.25 / $period_days) - 1.0;
    $avg_exposure = count($exposure_log) ? array_sum($exposure_log) / count($exposure_log) : 0.0;

    $report = array(
        'count'         => count($deal_log),
        'period_from'   => date('Y-m-d H:i:s', $start_time),
        'period_to'     => date('Y-m-d H:i:s', $end_time),
        'deal_share'    => $deal_share * 100,
        'max_exposure'  => $max_exposure * 100,
        'avg_exposure'  => $avg_exposure * 100,
        'total_profit'  => $total_profit,
        'final_capital' => $final_capital,
        'cagr'          => $cagr,
    );
}

$project_stat[$stat_period.'_dealscount'] = $report['count'];
$project_stat[$stat_period.'_total_profit'] = round($report['total_profit'],2);
$project_stat[$stat_period.'_middle_profit'] = $middle_profitperc;
if ($report['cagr'] === null) $project_stat[$stat_period.'_cagr'] = $project_stat[$stat_period.'_total_profit'] * 12;
elseif ($stat_period == '1y') $project_stat[$stat_period.'_cagr'] = round($report['total_profit'],2);
else $project_stat[$stat_period.'_cagr'] = $report['cagr'] * 100;
$project_stat[$stat_period.'_middle_profit'] = $middle_profitperc;

if ($stat_period == '1y') $stat_period = '1m';
else break;
}
memcache_set($memcache_obj, "projecttradestat".$thisprojectid, $project_stat, 0, 600);
}
//// Конец: Статистика проекта


// Монеты и их названия
$assetsnames = memcache_get($memcache_obj, "assetsnames");
if (empty($assetsnames))
{
    $cryptoassets = $db->super_query("select curr as symbol, name from cryptoassets order by curr", true);
    $assetsnamesarr = array();
    foreach ($cryptoassets as $cryptoasset)
    {
        $assetsnamesarr[$cryptoasset['symbol']] = $cryptoasset['name'];
    }
    $assetsnames = json_encode($assetsnamesarr, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    memcache_set($memcache_obj, "assetsnames", $assetsnames, 0, 10);
}
