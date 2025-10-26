<?php

if (!$islogged) {
    memcache_close($memcache_obj);
    if ($db) {
        $db->close();
    }
    header('Location: https://' . $authhost . '/auth?returl=' . $thispagesimpleurl);
    die();
}


require_once ROOTDIRSECURE . 'config_sbf.php';
$tradesettings = get_trade_settings();

// Получение окружения приложения (development/production) из переменной окружения APP_ENV
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

// Подготовка массива данных
$page_meta = [
  'app' => true,
  'classes' => 'is-trading',
  'desc' => 'Customize your crypto trading setup for safer, faster crypto trades.',
  'has_balance' => true,
  'styles' => 'trading.css',
  'title' => 'Trading | AI Strategy & Risk Controls, History – CryptoAPI.ai'
];

$data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_meta);

// TODO: MOCK ↓ Заменить на реальные данные — выборку из таблицы api_keys
$data_objects['apis'] = [
    ['name' => 'BTC Bungavy Bot', 'status' => 'active', 'icon' => 'robot'],
    ['name' => 'Binance', 'status' => 'active', 'icon' => 'exchange'],
    ['name' => 'Coinbase', 'status' => 'inactive', 'icon' => 'exchange'],
    ['name' => 'ETH Grid Bot', 'status' => 'inactive', 'icon' => 'robot'],
];

// TODO: MOCK ↓ Заменить на реальные данные
$data_objects += [
  // Список доступных валют, из которых пользователь может выбирать в поле тегов
  // кеш с биржевого REST
  'currencies' => ['BTC','ETH','SOL'],
  // Собственно настройки пользователя
  'user'  => [
    'ai_mode'            => 'balanced',            // колонка ai_mode
    'allowed_assets'     => ['BTC','ETH','SOL'],   // JSON-поле профиля
    'deposit_allocation' => 25,                    // колонка deposit_allocation
    'max_position'       => 10,
    'daily_loss'         => 5,
    'default_sl'         => 3,
    'default_tp'         => 7,
  ],
];

if (!empty($tradesettings['binanceapikey']) && !empty($tradesettings['binancesecretkey']) && !empty($tradesettings['binanceallowed']) && !isset($_GET['settings']) && !isset($_GET['history'])) {
    $final_html = get_template("tradingview.twig");
} elseif (!isset($_GET['history'])) {
    $final_html = get_template("trading.twig");
} else {
    $final_html = get_template("tradinghistory.twig");
}
if ($country_code == 'US') {
    $cryptotrade = $db->super_query("select round(sum(profit_real),2) as sumprofit from cryptotrade where sold=1 and uid=" . $user_id);
}

$lasttimedelete = memcache_get($memcache_obj, "ltbalancedel" . $user_id);
if (empty($lasttimedelete)) {
    memcache_delete($memcache_obj, "binancebalances" . $user_id);
}
memcache_set($memcache_obj, "ltbalancedel" . $user_id, $startruntime, 0, 5);
memcache_set($memcache_obj, "ltbalancedelint" . $user_id, $startruntime, 0, 60);
