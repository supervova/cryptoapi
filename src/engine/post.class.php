<?php

/**
 * Контроллер страницы одной новости.
 * Отображает новость, найденную по slug.
 */

// Этот файл подключается из news.class.php, если в URL есть slug.

declare(strict_types=1);

// $post_slug определяется в news.class.php перед включением этого файла.
if (!isset($post_slug) || empty(trim($post_slug))) {
    $fallback_lang_prefix = !empty($lng_html) ? '/' . $lng_html : '';
    // Если $post_slug не определён, редирект на ленту новостей.
    header('Location: ' . ($fallback_lang_prefix ?? '') . '/news/');
    exit;
}

/**
 * Находит новость по slug в файле-фикстуре.
 *
 * @param string $slug Уникальный идентификатор новости.
 *
 * @return array|null Возвращает массив с данными новости или null, если не найдено.
 */
function findNewsArticleBySlug(string $slug): ?array
{
    $candidates = [
        dirname(__DIR__, 2) . '/assets/data/fixtures/news.json',
        rtrim($_SERVER['DOCUMENT_ROOT'], '/') .
        '/projects/cryptoapi.ai/assets/data/fixtures/news.json',
    ];
    $news_path = '';
    foreach ($candidates as $path) {
        if (is_readable($path)) {
            $news_path = $path;
            break;
        }
    }

    if (empty($news_path)) {
        return null;
    }

    $all_news = json_decode(file_get_contents($news_path), true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($all_news)) {
        return null;
    }

    foreach ($all_news as $news_item) {
        if (isset($news_item['slug']) && $news_item['slug'] === $slug) {
            return $news_item;
        }
    }

    return null;
}

// ПОИСК НОВОСТИ
$article_data = findNewsArticleBySlug($post_slug);

// ПОДГОТОВКА ДАННЫХ СТРАНИЦЫ
$page_settings = [
    'app'     => true,
    'classes' => 'is-news is-post',
    'slug'    => 'news/' . $post_slug,
    'styles'  => 'news.css',
    'type'    => 'article',
];

if ($article_data) {
    // Новость найдена
    $page_settings['title'] = ($article_data['title'] ?? 'News Article') . ' – CryptoAPI.ai';

    $plain_content = strip_tags($article_data['content'] ?? '');
    $desc = mb_substr($plain_content, 0, 160);
    if (mb_strlen($plain_content) > 160) {
        // Убираем последнее, возможно, обрезанное слово
        $desc = preg_replace('/\s\S+$/u', '', $desc) . '...';
    }
    $page_settings['desc'] = $desc;

    $data_objects['article'] = $article_data;

    if (!empty($article_data['image'])) {
        // Для OpenGraph мета-тега
        $data_objects['page']['og_image'] = $article_data['image'];
    }
} else {
    // Новость не найдена
    http_response_code(404);
    $page_settings['title'] = 'Article Not Found – CryptoAPI.ai';
    $page_settings['desc'] = 'The article you are looking for could not be found on our server.';
    $data_objects['article'] = null;
}

// Обновляем $data_objects['page']
$data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_settings);

// РЕНДЕР ШАБЛОНА
$final_html = get_template("post.twig");
