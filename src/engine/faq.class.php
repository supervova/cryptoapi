<?php

/**
 * Контроллер страницы ЧаВо
 *
 * Подготавливает данные и рендерит шаблон faq.twig c «гармошками» вопросов-ответов.
 */

// Получение окружения приложения (development/production) из переменной окружения APP_ENV
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

// Подготовка массива данных
$page_meta = [
  'classes' => 'is-faq',
  'desc' => 'Find answers to frequently asked questions about cryptocurrency  ' .
            'prices, market cap, supply, listings, and trading data on CryptoAPI.ai.',
  'title' => 'Crypto FAQ | CryptoAPI.ai - Cryptocurrency Data & AI Insights',
];

$data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_meta);

// Получение и отображение шаблона
$final_html = get_template("faq.twig");
