<?php

/**
 * Контроллер страницы настроек трейдинга
 *
 * Обрабатывает доступ авторизованных пользователей, подготавливает данные,
 * и рендерит шаблон plans.twig с карточками тарифнх планов.
 */

// Проверка авторизации пользователя
if (!$islogged) {
    $redirectUrl = 'Location: https://' . ($authhost ?? 'yourdomain.com') .
        '/auth?returl=' . urlencode($thispagesimpleurl ?? '/');
    header($redirectUrl);
    exit;
}

// Получение окружения приложения (development/production) из переменной окружения APP_ENV
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

// Подготовка массива данных
$page_meta = [
  'app' => true,
  'classes' => 'is-trading',
  'desc' => 'Customize your crypto trading setup for safer, faster crypto trades.',
  'styles' => 'trading.css',
  'title' => 'Trading Settings | AI Strategy & Risk Controls – CryptoAPI.ai'
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

// Получение и отображение шаблона
$final_html = get_template("trading.twig");
