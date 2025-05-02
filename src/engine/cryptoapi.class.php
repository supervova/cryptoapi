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
$data_objects['page'] = array_merge(
    $data_objects['page'] ?? [],
    [
      'content' => $page_content_html,
      'desc' => $blog_description,
      'styles' => 'api.css',
      'title' => $blog_name,
    ]
);

// Рендер страницы
$final_html = get_template("legacy.twig");
