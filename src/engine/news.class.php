<?php

/**
 * Контроллер для раздела "Новости"
 * Либо отображает список новостей (news.twig),
 * либо подключает post.class.php для отображения страницы отдельной новости.
 */

declare(strict_types=1);

// "Маршрутизация" на основе наличия slug в URL
// $thispath должен быть доступен из глобального контекста приложения
if (isset($thispath[1]) && $thispath[1] === 'news' && isset($thispath[2]) && !empty($thispath[2])) {
    // Случай 1: URL вида /news/post-slug
    $post_slug = trim($thispath[2]);

    // Подключаем контроллер страницы отдельной новости.
    $post_controller_path = __DIR__ . '/post.class.php';

    if (file_exists($post_controller_path)) {
        include_once($post_controller_path);
    } else {
        $fallback_lang_prefix = !empty($lng_html) ? '/' . $lng_html : '';
        header('Location: ' . ($fallback_lang_prefix ?? '') . '/news/');
        exit;
    }
} else {
    // Случай 2: URL вида /news (без slug) - отображаем ленту новостей.

    /**
     * Загружает новости из локальной фикстуры.
     * @return array
     */
    function loadNewsFixture(): array
    {
        $candidates = [
            dirname(__DIR__, 2) . '/assets/data/fixtures/news.json',
            rtrim($_SERVER['DOCUMENT_ROOT'], '/') .
            '/projects/cryptoapi.ai/assets/data/fixtures/news.json',
        ];

        foreach ($candidates as $path) {
            if (is_readable($path)) {
                $news_data = json_decode(file_get_contents($path), true);
                return is_array($news_data) ? $news_data : [];
            }
        }
        return [];
    }

    // Получение окружения приложения
    $data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

    // Подготовка данных для шаблона
    $lang = $data_objects['page']['lang'] ?? 'en';
    $news = loadNewsFixture(); // Используем фикстуру напрямую

    $metaPath = $_SERVER['DOCUMENT_ROOT'] . '/projects/cryptoapi.ai/assets/data/crypto-meta.json';

    $cryptoMeta = [];
    if (is_readable($metaPath)) {
        $json = file_get_contents($metaPath);
        $cryptoMeta = json_decode($json, true) ?: [];
    } else {
        error_log("crypto-meta.json not found or unreadable: $metaPath");
    }

    $page_meta = [
      'app' => true,
      'classes' => 'is-news',
      'desc' => 'Get real-time crypto market news and AI-powered analysis. Receive timely updates on Bitcoin, ' .
                'Ethereum, altcoins, and market trends to optimize your trading strategy.',
      'news' => $news,
      'styles' => 'news.css',
      'title' => 'Crypto Market News | CryptoAPI.ai - AI-Powered Crypto Trading',
    ];

    $data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_meta);
    $data_objects['crypto_meta'] = $cryptoMeta;

    // Получение и отображение шаблона
    $final_html = get_template("news.twig");
}
