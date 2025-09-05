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

require_once __DIR__ . '/helpers/tariff.php';
$data_objects['curr_plan'] = build_curr_plan($db, $user_id, $thisprojectid, $user_lng);

// Получение и отображение шаблона
$final_html = get_template("index.twig");
