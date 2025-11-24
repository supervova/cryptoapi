<?php
/**
 * Общий «инициализатор»: загрузка конфигурации, проверка авторизации,
 * подготовка данных для шаблонов.
 */

$marketdata = memcache_get($memcache_obj, "cryptomarketdata");
$marketassets = memcache_get($memcache_obj, "marketassets");

// Разбор пути страницы
$routes = explode('/', $_REQUEST['routestring'] ?? '');
$current_page = !empty($routes[1]) ? $routes[1] : 'home';

// Получение окружения: development или production
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';



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


$data_objects['site']['header_stats'] = [
    'btc_price' => $marketdata['BTC']['price']   ?? null,
    'btc_diff'  => $marketdata['BTC']['diff']    ?? null,
    'all_diff'  => $marketdata['all']['diff']    ?? null,
    'level'     => $marketdata['level']          ?? null,
    'fgi'       => $marketdata['fear_and_greed'] ?? null,
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
