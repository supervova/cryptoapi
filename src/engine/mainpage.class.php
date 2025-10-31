<?php

/**
 * Контроллер главной страницы сайта для обработки запросов и рендеринга Twig-шаблонов
 *
 * Файл подготавливает данные для шаблонов и рендерит страницу.
 */

// Получение окружения приложения (development/production) из переменной окружения APP_ENV
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

// Подготовка массива данных
$page_meta = [
  'classes' => 'is-home',
  'desc' => $blog_description ?? 'Unlock the power of advanced APIs designed for crypto traders and analysts. Access' .
  ' real-time market insights, trading signals, custom indices, and automated tools to boost your trading performance.',
  'index' => true,
  'slug' => '', // убираем "home"
  'title' => $blog_name ?? 'CryptoAPI.ai – Advanced APIs for Crypto Traders and Market Analytics',
  'type' => 'website'
];
// home.css is hardcoded in template

$data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_meta);

$market = fetch_marketdata();

$data_objects['page']['market_tops'] = [
  'loser_ticker' => $market['leader']['fall']['curr']   ?? null,
  'loser_price' => $market['leader']['fall']['price']   ?? null,
  'loser_diff' => $market['leader']['fall']['diff']   ?? null,

  'gainer_ticker' => $market['leader']['growth']['curr']   ?? null,
  'gainer_price' => $market['leader']['growth']['price']   ?? null,
  'gainer_diff' => $market['leader']['growth']['diff']   ?? null,
];

$data_objects['page']['stats'] = [
  [
    'label' => 'Monthly Return',
    'value' => (float) $project_stat['1m_total_profit'],
    'unit'  => '%',
  ],
  [
    'label' => 'Annual Return',
    'value' => (float) $project_stat['1y_total_profit'],
    'unit'  => '%',
  ],
  [
    'label' => 'Trades (1Y)',
    'value' => (int) $project_stat['1y_dealscount'],
    'unit'  => '',
  ],
  [
    'label' => 'Average Return per Trade (1Y)',
    'value' => (float) $project_stat['1y_middle_profit'],
    'unit'  => '%',
  ],
];

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
      getphrase("Up to 1,000 daily requests to the APIs “asset rating”, “market indicators and indices”"),
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
$final_html = get_template("index.twig");
