<?php

/**
 * Главный файл приложения
 *
 * Этот файл является точкой входа в приложение. Он загружает все необходимые
 * зависимости, настраивает окружение и запускает приложение.
 *
 * PHP version 8.1
 *
 * @category Application
 * @package  EchoImmortal
 * @author   Vladimir Nikishin <vladimir@nikishin.dev>
 * @license  MIT License
 * @link     https://echo.im
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Twig\Environment;
use Twig\Loader\FilesystemLoader;
// Загрузка переменных окружения из .env.
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . DIRECTORY_SEPARATOR . '..');
$dotenv->load();

// Настройка Twig
$loader = new FilesystemLoader(__DIR__ . DIRECTORY_SEPARATOR . '../src/templates');
$twig   = new Environment(
    $loader,
    [
        'cache' => __DIR__ . DIRECTORY_SEPARATOR . '../cache',
        'debug' => $_ENV['APP_DEBUG'] === 'true',
    ]
);

$siteConfig = json_decode(file_get_contents(__DIR__ . '/../config/site.json'), true);

$pageData = [
    'title' => 'Create Your Digital Person — Echo Immortal',
    'desc' => 'Start creating your Digital Person by sharing your memories.',
    'body_classes' => 'e-page is-home has-brand-bar'
];

// Рендеринг страницы
echo $twig->render(
    'index.twig',
    [
    'site' => $siteConfig,
    'page' => $pageData
    ]
);
