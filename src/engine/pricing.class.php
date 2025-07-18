<?php

/**
 * Контроллер страницы тарифных планов
 *
 * Подготавливает данные и рендерит шаблон pricing.twig с карточками тарифных планов.
 */

// Получение окружения приложения (development/production) из переменной окружения APP_ENV
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

// Подготовка массива данных
$page_meta = [
  'classes' => 'is-pricing',
  'desc' => 'Explore our Free, Trader, Expert, and Premium plans for AI-powered crypto trading. ' .
            'Unlock real-time trading signals, advanced analytics, personalized insights, ' .
            'and automation tools to elevate your strategy.',
  'styles' => 'pricing.css',
  'title' => 'Pricing Plans for Crypto Traders | CryptoAPI.ai - AI-Powered Crypto Trading',
];

$data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_meta);

// Получение и отображение шаблона
$final_html = get_template("pricing.twig");
