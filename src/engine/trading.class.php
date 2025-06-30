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

// TODO: Заменить на реальные данные из базы или API
$data_objects['apis'] = [
    ['name' => 'BTC Bungavy Bot', 'status' => 'active', 'icon' => 'robot'],
    ['name' => 'Binance', 'status' => 'active', 'icon' => 'exchange'],
    ['name' => 'Coinbase', 'status' => 'inactive', 'icon' => 'exchange'],
    ['name' => 'ETH Grid Bot', 'status' => 'inactive', 'icon' => 'robot'],
];

// Получение и отображение шаблона
$final_html = get_template("trading.twig");
