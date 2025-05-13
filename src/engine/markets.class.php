<?php

/**
 * Контроллер страницы "Рынки" с таблицей криптовалютных активов.
 * Отображает данные по криптовалютам, позволяет сортировку и (в будущем) фильтрацию.
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
    'desc' => 'Explore cryptocurrency markets, track asset performance with real-time data, ratings, and risk analysis. Sort and prepare for filtering to find your next investment.',
    'styles' => 'markets.css',
    'title' => 'Cryptocurrency Markets | Real-Time Prices, Ratings & Analysis – CryptoAPI.ai',
    'type'  => 'website'
];

$data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_meta);

// $data_objects['page']['type'] = 'website';

// Начальные параметры сортировки
$data_objects['initial_sort_field'] = 'rating'; // Поле для начальной сортировки
$data_objects['initial_sort_direction'] = 'asc'; // Направление начальной сортировки ('asc' или 'desc')

// Конфигурация колонок таблицы
// Эта структура будет использована в Twig для генерации <thead>.
// Метки (label) здесь указаны на английском, так как Twig будет применять фильтр `|trans`
// для их перевода на основе текущего языка пользователя и PO-файлов.
// Ключ 'visible' определяет, будет ли колонка отображаться по умолчанию.
// Отсутствие 'visible' или 'visible: true' означает, что колонка видима.
// 'visible: false' скроет колонку.
$data_objects['default_columns'] = [
  [
      'key' => 'watchlist',       // Уникальный идентификатор колонки
      'type' => 'action',         // Тип для CSS-классов и логики (text, num, icon, action)
      'label' => 'Watchlist',     // Текст для заголовка (будет переведен)
      'sortable' => false,        // Можно ли сортировать по этой колонке
      'visible' => false          // Скрыта по умолчанию (функционал будет добавлен позже)
  ],
  [
      'key' => 'asset',
      'type' => 'text',
      'label' => 'Asset',
      'sortable' => true
  ],
  [
      'key' => 'price',
      'type' => 'num',
      'label' => 'Price',         // В Twig к этому добавится ", $"
      'sortable' => true
  ],
  [
      'key' => 'change_24h',
      'type' => 'num',
      'label' => 'Chg (24H)',     // В Twig к этому добавится ", %"
      'sortable' => true
  ],
  [
      'key' => 'rating',
      'type' => 'num',
      'label' => 'Rating',
      'sortable' => true
  ],
  [
      'key' => 'risk',
      'type' => 'icon',
      'label' => 'Risk',
      'sortable' => false
  ],
  [
      'key' => 'trindex',
      'type' => 'num',
      'label' => 'TRIndex',
      'sortable' => true
  ],
  [
      'key' => 'rsi',
      'type' => 'num',
      'label' => 'RSI (7D)',
      'sortable' => true
  ],
  [
      'key' => 'chart',
      'type' => 'action',
      'label' => 'Chart',
      'sortable' => false,
      'visible' => false          // Скрыта по умолчанию (функционал будет добавлен позже)
  ]
];

// Рендер страницы
$final_html = get_template("markets.twig");
