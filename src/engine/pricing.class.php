<?php

/**
 * Контроллер страницы тарифных планов
 *
 * Подготавливает данные и рендерит шаблон plans.twig с карточками тарифных планов.
 */

if (!empty($thispath['2'])) {
    if (!$islogged) {
        if (isset($memcache_obj) && function_exists('memcache_close')) {
            memcache_close($memcache_obj);
        }
        if (!empty($db)) {
            $db->close();
        }
        $retUrl = isset($thispagesimpleurl) ? urlencode($thispagesimpleurl) : '';
        header('Location: https://' . $authhost . '/auth?returl=' . $retUrl);
        die();
    }

    // Безопасно читаем параметры тарифа
    $tariff_key = isset($thispath['2']) ? (string)$thispath['2'] : '';
    $tariff_interval = isset($thispath['3']) ? (string)$thispath['3'] : '';

    // Тариф:
    $tariff_map = [
        'free' => 0,
        'trader' => 1,
        'expert' => 2,
        'premium' => 3,
    ];
    if (!array_key_exists($tariff_key, $tariff_map)) {
        die('Incorrect parameters!');
    }
    $tariff_level = $tariff_map[$tariff_key];

    // Период:
    if (!in_array($tariff_interval, ['monthly', 'annual'], true)) {
        die('Incorrect parameters!');
    }

    // Цена тарифа из конфига (ключ "tarrif" намеренно сохранен)
    $price = $config['tarrif'][$tariff_key]['price'][$tariff_interval] ?? null;
    if ($price === null || $price === '' || !is_numeric($price)) {
        die('Incorrect parameters!');
    }

    $post = [
        'checkID'   => $startruntime - 5,
        'payobject' => 'tariff|' . $price . '|' . $tariff_key . '|' . $tariff_interval . '|' . $tariff_level,
        'udata'     => $user_id . '|' . $user_country,
    ];

    $uagent = 'Cron';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_USERAGENT, $uagent);
    curl_setopt($ch, CURLOPT_URL, 'https://' . $thisdomain . '/createbill.php');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_COOKIESESSION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
    $billid = curl_exec($ch);
    $status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    //die($billid." *** ".$status_code);

    $billid = (int)$billid;
    if ($billid <= 0) {
        die('Error creating invoice!');
    }

    if (isset($memcache_obj) && function_exists('memcache_close')) {
        memcache_close($memcache_obj);
    }
    if (!empty($db)) {
        $db->close();
    }
    header('Location: /' . $user_lng . '/bill/' . $billid);
    die();
}

// Получение окружения приложения (development/production) из переменной окружения APP_ENV
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

// Подготовка массива данных
$page_meta = [
  'classes' => 'is-pricing',
  'desc' => 'Explore our Free, Trader, Expert, and Premium plans for AI-powered crypto trading. ' .
            'Unlock real-time trading signals, advanced analytics, personalized insights, ' .
            'and automation tools to elevate your strategy.',
  // 'styles' => 'pricing.css',
  'title' => 'Pricing Plans for Crypto Traders | CryptoAPI.ai - AI-Powered Crypto Trading',
];

require_once __DIR__ . '/helpers/tariff.php';
$data_objects['curr_plan'] = build_curr_plan($db, $user_id, $thisprojectid, $user_lng);
$data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_meta);

// Получение и отображение шаблона
$final_html = get_template("pricing.twig");
