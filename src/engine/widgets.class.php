<?php

/**
 * Контроллер страницы виджетов (widgets)
 */

declare(strict_types=1);

// Получение окружения приложения (development/production) из переменной окружения APP_ENV
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

if (!empty($thispath[2])) {
    $widgets = [
        'signals' => 'signals.class.php',
        'fgi'     => 'fgi.class.php',
        'btc'     => 'btc.class.php',
        'trandx'  => 'trandx.class.php',
    ];

    if (isset($widgets[$thispath[2]])) {
        include_once ROOTDIR . 'projects/' . $config['project_path'] . '/engine/widgets/' . $widgets[$thispath[2]];
    }
} else {
    $page_meta = [
    'app' => true,
    'classes' => 'is-widgets',
    'desc' => 'Embed real-time crypto charts, tickers, and tapes in minutes. ' .
                'Lightweight, accessible widgets with AI insights and affiliate tracking to grow revenue.',
    'styles' => 'widgets.css',
    'title' => 'Crypto Widgets & Embeds | CryptoAPI.ai - AI-Powered Crypto Trading',
    ];
    $data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_meta);

    // --- widget params ---
    $allowedTabs  = ['signals','fgi','btc-chart', 'trandx'];
    $allowedTheme = ['light','dark'];

    $raw_theme = $_GET['theme'] ?? 'dark';
    $theme = in_array($raw_theme, $allowedTheme, true) ? $raw_theme : 'dark';
    $rows  = (int)($_GET['rows'] ?? 8);
    $rows  = max(1, min(8, $rows));
    $active = in_array(($_GET['tab'] ?? 'signals'), $allowedTabs, true) ? $_GET['tab'] : 'signals';

    $aff = $user_id ?? '';
    // $aff = preg_match('/^[A-Za-z0-9_\-]{0,64}$/', $aff) ? $aff : '';

    $lng = in_array($lng_html, ['en','ru'], true) ? $lng_html : 'en';

    $data_objects['widget'] = [
      'theme'  => $theme,
      'rows'   => $rows,
      'active' => $active,
      'aff'    => $aff,
      'lang'   => $lng,
    ];

    // Рендер
    $final_html = get_template('widgets.twig');
}
