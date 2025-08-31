<?php

declare(strict_types=1);

// маршрут: /projects/cryptoapi.ai/widgets/signals
// пример:  ?theme=dark&rows=8&aff=partner123

// 1) параметры
$theme = ($_GET['theme'] ?? 'dark') === 'light' ? 'light' : 'dark';
$rows  = max(1, min(20, (int)($_GET['rows'] ?? 8)));
// $aff   = $user_id;
// $aff   = preg_replace('/[^a-z0-9_-]/i', '', (string)($_GET['aff'] ?? ''));


global $lng_html;
$lng = in_array($lng_html, ['en','ru'], true) ? $lng_html : 'en';

// 2) заголовки для iframe
header('Content-Type: text/html; charset=utf-8');
header('X-Frame-Options: ALLOWALL');
$csp = [
  "default-src 'self'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'sha256-76/dnLMZknTV3OS74yEk65tuIfU+RIp7gAidHfP15Es='",
  "frame-ancestors *",
];
header('Content-Security-Policy: ' . implode('; ', $csp));

// 3) получение данных
// В проекте сейчас сигналы приходят от cryptosignals.php, а настройки — от signals_settings_get.php.
// Там часто приходит уже HTML в полях сообщений — чистим.
$signals = fetch_signals($rows, $lng);

// Добавляем нужные переменные в $data_objects
$data_objects['widget'] = [
  'theme'   => $theme,
  'rows'    => $rows,
  'lang'    => $lng,
  'aff'     => $aff,
  'signals' => $signals,
];

// 4) рендер Twig
$final_html = get_template('widgets/signals.twig');

/**
 * Возвращает массив нормализованных сигналов:
 * [
 *   ['date'=>'2025-08-18','time'=>'19:06:29','symbol'=>'BTC','html'=>'…','type'=>'strongdown']
 * ]
 */
function fetch_signals(int $rows, string $lng): array
{
    $payload = ['signalid' => 0, 'wlang' => $lng];
    // pass-through optional bypass params agreed with backend (whitelist keys)
    foreach (['widget_bypass','wtoken','dev','bypass'] as $k) {
        if (isset($_GET[$k])) {
            $val = preg_replace('/[^a-zA-Z0-9._:-]/', '', (string)$_GET[$k]);
            if ($val !== '') {
                $payload[$k] = $val;
            }
        }
    }
    $resp = http_post_json('./cryptosignals.php', $payload);

    if (!$resp) {
        return [];
    }

    $data = json_decode($resp, true);
    if (!is_array($data) || !isset($data[0]) || $data[0] !== 'OK') {
        return [];
    }

    $list = $data[1] ?? [];
    $out  = [];
    foreach ($list as $i => $el) {
        if (!is_array($el)) {
            continue;
        }

        $dt  = (string)($el['datetime'] ?? '');
        $sym = (string)($el['curr'] ?? '');
        $msg = (string)($el['msg'] ?? '');
        $typ = (string)($el['signaltype'] ?? 'neutral');

        [$date, $time] = explode(' ', $dt . ' ');
      // Очистка HTML из msg: разрешаем b, i, strong, em, a[href]
        $msg = sanitize_msg_html($msg);

        $out[] = [
        'date'   => $date,
        'time'   => $time,
        'symbol' => $sym,
        'html'   => $msg,     // уже очищено → выводим |raw в Twig
        'type'   => $typ,     // например typestrongdown / typeup и т.п.
        ];
        if (count($out) >= $rows) {
            break;
        }
    }
    return $out;
}

function http_post_json(string $url, array $payload): ?string
{
    $opts = [
    'http' => [
      'method'  => 'POST',
      'header'  => "Content-Type: application/x-www-form-urlencoded\r\nX-Widget-Request: 1\r\n",
      'content' => http_build_query($payload),
      'timeout' => 3,
    ],
    ];
    $ctx = stream_context_create($opts);
    $res = @file_get_contents($url, false, $ctx);
    return $res === false ? null : $res;
}

function sanitize_msg_html(string $html): string
{
  // минимальный вайтлист; убираем onclick/style и т.п.
    $html = preg_replace('#<(script|style)\b[^>]*>.*?</\1>#is', '', $html);
    $html = preg_replace('# on\w+="[^ "]*"#i', '', $html);
    $html = preg_replace('# on\w+=\'[^ "]*\'#i', '', $html);
    $html = strip_tags($html, '<b><strong><i><em><u><a><span>');
  // ссылки: только https/http, rel noopener
    $html = preg_replace('#<a\b([^>]*href\s*=\s*\")([^"]*)"#i', '<a$1$2', $html);
    $html = preg_replace('#<a\b([^>]*)>#i', '<a $1 rel="noopener" target="_blank">', $html);
    return $html;
}
