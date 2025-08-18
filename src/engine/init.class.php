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
$data_objects['site'] = [
  'assets_prefix' => '/projects/cryptoapi.ai',
  'assets_version' => '2',
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
