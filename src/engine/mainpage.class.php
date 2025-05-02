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
  'desc' => $blog_description ?? 'Unlock the power of advanced APIs designed for crypto traders and analysts. Access real-time market insights, trading signals, custom indices, and automated tools to boost your trading performance.',
  'index' => true,
  'slug' => '', // убираем "home"
  'title' => $blog_name ?? 'CryptoAPI.ai – Advanced APIs for Crypto Traders and Market Analytics',
  'type' => 'website'
];
// home.css is hardcoded in template

$data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_meta);

// Получение и отображение шаблона
$final_html = get_template("index.twig");
