<?php

/**
 * Контроллер страницы документации API
 *
 * Обрабатывает доступ авторизованных пользователей, подготавливает данные,
 * и рендерит шаблон legacy.twig с данными API-документации.
 */

// Проверка авторизации пользователя
// Удалено закрытие Memcache старым методом "на всякий случай".
// Соединение с Memcache закрывается автоматически при завершении скрипта.
if (!$islogged) {
    header('Location: https://' . $authhost . '/auth?returl=' . urlencode($thispagesimpleurl));
    exit;
}

// Переводим фразу через getphrase
$blog_name = getphrase("Payment Operations API");
$blog_description = $blog_name;

// Получаем содержание
$page_content_html = get_template("cryptoapi");

// Получение окружения приложения (development/production) из переменной окружения APP_ENV
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

// Подготовка массива данных
global $data_objects;
$data_objects = $data_objects ?? [];
$data_objects['ExtraData'] = [
    'title' => $blog_name,
    'desc' => $blog_description,
    'domain' => $host,
    'assets_prefix' => '/projects/cryptoapi.ai',
    'lang' => $lng_html,
    'page_styles' => 'api.css',
    'user_id' => $user_id,
    'user_name' => $username ?? '',
    'user_avatar' => $userdata['avatarbox'] ?? ''
];
$data_objects['content'] = $page_content_html;

// Рендер страницы
$final_html = get_template("legacy.twig");
