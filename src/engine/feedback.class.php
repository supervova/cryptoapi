<?php

/**
 * Контроллер страницы обратной связи
 *
 * Подготавливает данные и рендерит шаблон feedback.twig с формой.
 */

$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

$page_meta = [
  'classes' => 'is-feedback',
  'desc' => 'Have questions or feedback? Reach out to the CryptoAPI.ai team — we′re here ' .
            'to help with AI-powered crypto trading tools, insights, and integrations.',
  'styles' => 'feedback.css',
  'title' => 'Contact Us | CryptoAPI.ai - AI-Powered Crypto Trading',
];

$data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_meta);

// CSRF токен
session_start();
$data_objects['csrf_token'] = $_SESSION['csrf_token'] ?? bin2hex(random_bytes(16));
$_SESSION['csrf_token'] = $data_objects['csrf_token'];

// Обработка формы
$data_objects['success'] = false;
$data_objects['error'] = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!empty($_POST['website'])) {
        http_response_code(400);
        exit;
    }

    if (
        empty($_POST['csrf_token']) ||
        !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])
    ) {
        $data_objects['error'] = 'Invalid CSRF token.';
    } else {
        $type = $_POST['feedback-type'] ?? '';
        $message = trim($_POST['feedback-message'] ?? '');
        $email = trim($_POST['feedback-email'] ?? '');

        if (!in_array($type, ['feedback', 'bug', 'feature'], true)) {
            $data_objects['error'] = 'Invalid type.';
        } elseif ($message === '' || mb_strlen($message) > 1000) {
            $data_objects['error'] = 'Message required.';
        } elseif ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $data_objects['error'] = 'Invalid email.';
        } else {
          // TODO: сохранить или отправить
            $data_objects['success'] = true;
        }
    }
}

// Получение и отображение шаблона
$final_html = get_template('feedback.twig');
