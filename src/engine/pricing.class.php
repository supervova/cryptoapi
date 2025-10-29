<?php

/**
 * Контроллер страницы тарифных планов
 *
 * Подготавливает данные и рендерит шаблон plans.twig с карточками тарифных планов.
 */

if (!empty($thispath['2'])) {
    if (!$islogged) {
        memcache_close($memcache_obj);
        if ($db) {
            $db->close();
        }
        header('Location: https://' . $authhost . '/auth?returl=' . $thispagesimpleurl);
        die();
    }
    // Тариф:
    if ($thispath['2'] == 'free') {
        $tariff_level = 0;
    } elseif ($thispath['2'] == 'trader') {
        $tariff_level = 1;
    } elseif ($thispath['2'] == 'expert') {
        $tariff_level = 2;
    } elseif ($thispath['2'] == 'premium') {
        $tariff_level = 3;
    } else {
        die("Incorrect parameters!");
    }
    // Период:
    if ($thispath['3'] == 'monthly' || $thispath['3'] == 'annual') {
        $tariff_interval = $thispath['3'];
    } else {
        die("Incorrect parameters!");
    }

    $price = $config['tarrif'][$thispath['2']]['price'][$thispath['3']];
    if (empty($price)) {
        die("Incorrect parameters!");
    }
    if ($thispath['3'] == 'annual') {
        $price = $price * 12;
    }
    $post = ['checkID' => $startruntime - 5, 'payobject' => 'tariff|' . $price . '|' . $thispath['2'] . '|' . $thispath['3'] . '|' . $tariff_level, 'udata' => $user_id . '|' . $user_country];
    $uagent = "Cron";
    curl_init();
    curl_setopt($ch, CURLOPT_USERAGENT, $uagent);
    curl_setopt($ch, CURLOPT_URL, "https://" . $thisdomain . "/createbill.php");
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
    $billid = $billid * 1;
    if (empty($billid)) {
        die("Error creating invoice!");
    }
    memcache_close($memcache_obj);
    if ($db) {
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
  'title' => 'Pricing Plans for Crypto Traders | CryptoAPI.ai - AI-Powered Crypto Trading',
];

$tariff = $db->super_query("select * from tariffs where user_id=" . $user_id . " and projectid=" . $thisprojectid . " and startdate<=date(NOW()) and lastdate>=date(NOW()) order by id desc limit 0,1");

$tarrif_binance_api = getphrase("integration available");
$tarrif_binance_api = str_replace(getphrase("integration"), "", $tarrif_binance_api);
$tarrif_binance_api = trim($tarrif_binance_api);

$phrase['Your tariff:'] = getphrase("Your tariff:");
$phrase['Available benefits'] = getphrase("Available benefits");
$phrase['Tariff end date:'] = getphrase("Tariff end date:");
$phrase['Signal delay:'] = getphrase("Signal delay:");
$phrase['Trading fee:'] = getphrase("Trading fee:");
$phrase['Integration with the exchange:'] = getphrase("Integration with the exchange:");
$phrase['API Limitations:'] = getphrase("API Limitations:");
$phrase['Selecting trading strategies:'] = getphrase("Selecting trading strategies:");
$phrase['Support type:'] = getphrase("Support type:");

$tarrif_support = getphrase("standard support");
if (empty($tariff['tariff_level'])) {
    $tarrif_name = getphrase("FREE TARIFF");
    $phrase['Tariff end date:'] = "";
    $tarrif_name = str_replace(getphrase("TARIFF"), "", $tarrif_name);
    $tarrif_name = str_replace("ТАРИФ", "", $tarrif_name);
    $tarrif_name = trim($tarrif_name);
    $tarrif_enddate = "";
    $tarrif_apirequests = number_format(1000) . " " . getphrase("requests per day");
    $tarrif_signal_delay = 15;
    $tarrif_strategies = getphrase("unavailable");
    $tarrif_fee = "30%";
} else {
    $tempdate = date_create_from_format('Y-m-d', $tariff['lastdate']);
    $tarrif_enddate = date_format($tempdate, $format_date_php);
    $tarrif_signal_delay = getphrase("without delays");
}
if ($tariff['tariff_level'] == 1) {
    $tarrif_name = getphrase("TRADER");
    $tarrif_apirequests = number_format(10000) . " " . getphrase("requests per day");
    $tarrif_strategies = getphrase("balanced strategy");
    $tarrif_fee = "20%";
}
if ($tariff['tariff_level'] == 2) {
    $tarrif_name = getphrase("EXPERT");
    $tarrif_apirequests = number_format(50000) . " " . getphrase("requests per day");
    $tarrif_strategies = getphrase("any strategy");
    $tarrif_fee = "10%";
}
if ($tariff['tariff_level'] == 3) {
    $tarrif_name = getphrase("PREMIUM");
    $tarrif_apirequests = getphrase("unlimited");
    $tarrif_strategies = getphrase("any strategy");
    $tarrif_support = getphrase("VIP support");
    $tarrif_fee = "5%";
}

$data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_meta);

require_once __DIR__ . '/helpers/tariff.php';
$data_objects['curr_plan'] = build_curr_plan($db, $user_id, $thisprojectid, $user_lng);

$data_objects['data_plans'] = [
  [
    "level" => 0,
    "title" => "Free",
    "icon" => "gift",
    "price" => 0,
    "subtitle" => getphrase("Try it out to assess the accuracy of our AI algorithms"),
    "link" => "/" . $user_lng . "/pricing/free/annual",
    "features" => [
      getphrase("Access to signals on the website"),
      getphrase("Signal delay – 15 seconds"),
      getphrase("Up to 1,000 daily requests to the APIs “asset rating”,  “market indicators and indices”"),
      getphrase("Binance API integration"),
      getphrase("Service fee – 30% of profit (but not less than $0.25)")
    ]
  ],
  [
    "level" => 1,
    "title" => "Trader",
    "icon" => "user",
    "price" => $config['tarrif']['trader']['price']['annual'] ?? 33,
    "subtitle" => getphrase("Perfect for beginner active traders"),
    "link" => "/" . $user_lng . "/pricing/trader/annual",
    "features" => [
      getphrase("Access to signals via Telegram"),
      getphrase("Signal delay – none (real-time)"),
      getphrase("Up to 10,000 daily requests to the APIs “asset rating”,  “market indicators and indices”"),
      getphrase("Balanced trading strategy"),
      getphrase("Service fee – 20% of profit (but not less than $0.25)"),
      getphrase("Plus all benefits of the Free plan")
    ]
  ],
  [
    "level" => 2,
    "title" => "Expert",
    "icon" => "star",
    "price" => $config['tarrif']['expert']['price']['annual'] ?? 60,
    "subtitle" => getphrase("Optimal choice for professional traders"),
    "link" => "/" . $user_lng . "/pricing/expert/annual",
    "features" => [
      getphrase("Up to 50,000 daily requests to the APIs “asset rating”,  “market indicators and indices”"),
      getphrase("Customizable trading strategies"),
      getphrase("Service fee – 10% of profit (but not less than $0.25)"),
      getphrase("Plus all benefits of the Trader plan")
    ],
    "isFeatured" => true
  ],
  [
    "level" => 3,
    "title" => "Premium",
    "icon" => "crown",
    "price" => $config['tarrif']['premium']['price']['annual'] ?? 150,
    "subtitle" => getphrase("Designed for professional teams and crypto funds"),
    "link" => "/" . $user_lng . "/pricing/premium/annual",
    "features" => [
      getphrase("Unlimited API “asset rating”,  “market indicators and indices” * no more than 1 request at any given moment"),
      getphrase("Service fee – 5% of profit (but not less than $0.25)"),
      getphrase("VIP support and a dedicated account manager"),
      getphrase("Plus all benefits of the Expert plan")
    ]
  ]
];

// Получение и отображение шаблона
$final_html = get_template("pricing.twig");
