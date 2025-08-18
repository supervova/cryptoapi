<?php

/**
 * Контроллер виджета индекса страха и жадности
 *
 * Подготавливает данные и рендерит шаблон widgets/trindex.twig с таблицей активов
 * с высоким индексом совокупного дохода.
 */

declare(strict_types=1);

// маршрут: /projects/cryptoapi.ai/widgets/trindex
// пример:  ?theme=dark8&lang=ru&aff=partner123

// 1) параметры
$theme = ($_GET['theme'] ?? 'dark') === 'light' ? 'light' : 'dark';
$lng  = substr(preg_replace('/[^a-z-]/i', '', (string)($_GET['lang'] ?? 'en')), 0, 10);
$aff   = $user_id;
// $aff   = preg_replace('/[^a-z0-9_-]/i', '', (string)($_GET['aff'] ?? ''));

// 2) заголовки для iframe
header('Content-Type: text/html; charset=utf-8');
header('X-Frame-Options: ALLOWALL');
$csp = [
  "default-src 'self'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'sha256-7vQ2Mq2MO5DzQLVxAYfAjd8PhWfsAA8v0GmeocdT2pc='",
  "frame-ancestors *",
];
header('Content-Security-Policy: ' . implode('; ', $csp));

// 3) получение данных и подготовка переменных
// Добавляем нужные переменные в $data_objects
$data_objects['widget'] = [
    'theme' => $theme,
    'lang'  => $lng,
    'aff'   => $aff
];

// 4) рендер Twig
$final_html = get_template('widgets/trindex.twig');
