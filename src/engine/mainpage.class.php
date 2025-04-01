
<?php
// Парсинг маршрута из URL
$pageths = explode('/', $_REQUEST['routestring'] ?? '');

// Определение текущей страницы
if (!empty($pageths[1])) {
    $pageths = $pageths[1];
} else {
    $pageths = 'mainpage';
}

// Заполнение массива данных для шаблона
$data_objects = [];
$data_objects['UserId'] = $user_id ?? null;
$data_objects['Page'] = $pageths; // Добавляем текущую страницу в данные
$data_objects['ExtraData'] = [
    'title' => $blog_name ?? '',
    'desc' => $blog_description ?? '',
    'assets_prefix' => '/projects/cryptoapi.ai',
    'body_classes' => 'e-page is-home',
    'lang' => $lng_html,
    'fgi' => 68
];

// Получение и отображение шаблона
$final_html = get_template("index.twig", $data_objects);
