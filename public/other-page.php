<?php

require_once __DIR__ . DIRECTORY_SEPARATOR . '../vendor/autoload.php';

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . DIRECTORY_SEPARATOR . '..');
$dotenv->load();

$loader = new FilesystemLoader(__DIR__ . DIRECTORY_SEPARATOR . '../src/templates');
$twig = new Environment($loader, [
    'cache' => __DIR__ . DIRECTORY_SEPARATOR . '../cache',
    'debug' => $_ENV['APP_DEBUG'] === 'true'
]);

$siteConfig = json_decode(file_get_contents(__DIR__ . '/../config/site.json'), true);

$pageData = [
    'title' => '',
    'desc' => '',
    'body_classes' => '',

    // Onboarding vars
    // 'prev' => '',
    // 'is_onboarding_start' => true,
    // 'is_onboarding' => true,
    // 'user_email' => '',
];

echo $twig->render(
    'other-page.twig',
    [
    'site' => $siteConfig,
    'page' => $pageData
    ]
);
