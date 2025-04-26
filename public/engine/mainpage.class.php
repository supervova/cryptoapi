<?php

/**
 * Контроллер главной таницы сайта для обработки запросов и рендеринга Twig-шаблонов
 *
 * Файл обрабатывает входящие запросы, настраивает конфигурацию CMS,
 * подготавливает данные для шаблонов и рендерит страницу.
 */

// Инициализация основных переменных
$user_id = $user_id ?? 0; // Убедитесь, что $user_id определена где-то выше
$user_lng = $user_lng ?? 'ru'; // Устанавливаем язык по умолчанию
$lng_html = $lng_html ?? 'ru'; // HTML-атрибут языка

// Безопасный парсинг маршрута из URL
$route = filter_input(INPUT_GET, 'routestring', FILTER_SANITIZE_STRING) ?? '';
$routeParts = explode('/', $route);

// Определение текущей страницы с безопасным значением по умолчанию
$currentPage = !empty($routeParts[1]) ? htmlspecialchars($routeParts[1]) : 'mainpage';

// Основные пути приложения
$rootDir = $_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR;
$entitiesDir = $rootDir . 'entities';
$engineDir = $rootDir;
$projectDir = $rootDir . 'projects' . DIRECTORY_SEPARATOR;

// Проверяем и используем только проверенные доменные имена
$host = filter_input(INPUT_SERVER, 'HTTP_HOST', FILTER_SANITIZE_STRING);
$allowedHosts = ['cryptoapi.ai', 'dev.cryptoapi.ai', 'staging.cryptoapi.ai']; // Список разрешенных доменов
if (!in_array($host, $allowedHosts)) {
    $host = 'cryptoapi.ai'; // Значение по умолчанию, если хост недопустим
}
$projectDir .= $host . DIRECTORY_SEPARATOR;

// Загрузка конфигурации
$configFile = $rootDir . 'ConfigCMS.php';
if (!file_exists($configFile)) {
    die('Configuration file not found');
}
include $configFile;

// Убедитесь, что класс и база данных доступны
if (!isset($db) || !class_exists('ConfigCMS')) {
    die('Database or ConfigCMS class not available');
}

$ConfigCMS = new ConfigCMS($db);

// Настройка путей и параметров
$ConfigCMS->setAutoloadDir($rootDir . 'libs' . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php')
    ->setEntitiesDir([$entitiesDir])
    ->setTransDir('translate')
    ->setTwigDir([$projectDir . 'twig', $engineDir . 'twig'])
    ->setClassDir([
        $projectDir . 'class',
        $projectDir . 'model',
        $engineDir . 'class',
        $engineDir . 'model',
        $entitiesDir
    ])
    ->setUserid((int) $user_id)
    ->setUserLng($user_lng);

// Проверка существования и подключение автозагрузчика
if (!file_exists($ConfigCMS->getAutoloadDir())) {
    die('Autoloader not found');
}
require $ConfigCMS->getAutoloadDir();

// Инициализация основных классов
try {
    $Render = new ThaiUtilities\ThaiRender($ConfigCMS);
    $Base = new ThaiUtilities\ThaiGettingClass($ConfigCMS);

    // Примечание: Закомментированный код, который "ломает шаблон"
    // Для восстановления работоспособности этого кода требуется дополнительный анализ
    /*
    $ActionInitClass = $Base->getClass('home');
    $data_objects = $ActionInitClass->Action()->getDataObject();
    */
} catch (Exception $e) {
    die('Error initializing system: ' . $e->getMessage());
}

// Получение окружения приложения (development/production) из переменной окружения APP_ENV
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

// Инициализация и заполнение массива данных для шаблона
global $data_objects;
$data_objects = $data_objects ?? [];
$data_objects['UserId'] = $user_id;
$data_objects['Page'] = $currentPage;
$data_objects['ExtraData'] = [
    'title' => $blog_name ?? '',
    'desc' => $blog_description ?? '',
    'domain' => $host,
    'assets_prefix' => '/projects/cryptoapi.ai',
    'body_classes' => 'is-home',
    'lang' => $lng_html,
    'fgi' => 68,
    'user_id' => $user_id,
    'user_name' => $username ?? '',
    'user_avatar' => $userdata['avatarbox'] ?? ''
];

// Проверка существования функции рендеринга шаблона
if (!function_exists('get_template')) {
    die('Template rendering function not found');
}

// Получение и отображение шаблона
$final_html = get_template("index.twig");
