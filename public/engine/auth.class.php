<?php

define('ENGINEDIR', __DIR__ . '/');
define('ROOTDIR', dirname(__DIR__));

// Парсинг маршрута из URL
$pageths = explode('/', $_REQUEST['routestring'] ?? '');

// Блокирование ботов для всех путей кроме API
if ($anybot && $thispath[1] != 'userapi') {
    include(ENGINEDIR . "403.class.php");
    exit();
}

// Определение URL возврата (returl) с приоритетом: GET > REFERER > COOKIE
$returl = '';
if (isset($_GET['returl'])) {
    $returl = urldecode($_GET['returl']);
} elseif (isset($_SERVER['HTTP_REFERER'])) {
    $referer = $_SERVER['HTTP_REFERER'];
    if (strpos($referer, "http") !== false && strpos($referer, '/auth') === false) {
        $returl = $referer;
    }
} elseif (isset($_COOKIE['returl'])) {
    $returl = urldecode($_COOKIE['returl']);
}

// Валидация URL возврата - если пустой или содержит недопустимые строки, используем URL по умолчанию
if (empty($returl) || strpos($returl, "auth") !== false || strpos($returl, ".php") !== false) {
    $returl = $config['project_type'] . "://" . $config['project_host'];
}

// Определение хоста авторизации из конфигурации или текущего домена
$authhost = $config['authhost'] ?? $this2leveldomain;

// Проверка и перенаправление на правильный хост авторизации если необходимо
if (strpos($this2leveldomain, $authhost) === false && strpos($thisuri, 'reset') === false) {
    if ($authhost == 'qwertynetworks.com' && in_array($user_lng, $project_languages)) {
        $authhost = $authhost . "/" . $user_lng;
    }
    // Закрываем соединения перед перенаправлением
    memcache_close($memcache_obj);
    if ($db) {
        $db->close();
    }
    header('Location: https://' . $authhost . '/auth?returl=' . urlencode($returl));
    die();
}

// Исправление дублирования языкового кода в URL
$returl = str_replace("/" . $user_lng . "/" . $user_lng . "/", "/" . $user_lng . "/", $returl);

// Сохранение URL возврата в cookie на 10 дней
savecookie('returl', $returl, time() + 86400 * 10);

// Парсинг URL для определения хоста
$returl_arr = parse_url($returl);
$this_http_host = $returl_arr['host'] ?? '';

// Загрузка проектов и конфигурации
require ROOTDIR . '/generated/projects.php';
$projectid = $thisprojectid;
require ROOTDIR . '/generated/config.php';

// Получение email из GET параметров для предзаполнения формы
$setemail = "";
if (isset($_GET['email'])) {
    $setemail = dbstr($_GET['email']);
}

// Повторное определение хоста авторизации (возможно, изменился после загрузки конфигурации)
$authhost = $config['authhost'] ?? $this2leveldomain;

// Управление ID неавторизованных пользователей
if (isset($_COOKIE['unloggedid'])) {
    $unloggedid = $_COOKIE['unloggedid'];
} elseif (isset($_COOKIE['oldunloggedid'])) {
    $unloggedid = $_COOKIE['oldunloggedid'];
}
if (empty($unloggedid)) {
    $unloggedid = md5($_SERVER['REMOTE_ADDR']) . rand(1000, 9999);
}

// Создание cookie для отслеживания пользователя
$hello_cookie = md5("helloADeJhl4yqawkZFxmAF8bDyaqr7dECsn0" . $_SERVER['HTTP_USER_AGENT']);

// Формирование URL для авторизации через Google
$googleurl = 'https://accounts.google.com/o/oauth2/auth?' .
    urldecode(http_build_query($params ?? []));

// Получение окружения приложения (development/production) из переменной окружения APP_ENV
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

// Заполнение массива данных для шаблона
$data_objects['page'] = array_merge(
    $data_objects['page'] ?? [],
    [
    'classes' => 'is-auth',
    'desc' => 'Log in to your CryptoAPI.ai account or create a new one. ' .
        'Access advanced trading tools, real-time market insights, and ' .
        'automated strategies powered by cutting-edge AI technology.',
    'title' => 'Secure Sign In or Sign Up | CryptoAPI.ai - AI-Powered Crypto Trading',
    'type' => 'website',

    // TODO: заменить этими переменными Smarty в auth.twig
    'hello' => $_COOKIE[$hello_cookie] ?? '',
    'hello_cookie' => $hello_cookie,
    'oauth_google' => $googleurl,
    'returl' => $returl,
    'setemail' => $setemail,
    'this_http_host' => $this_http_host,
    ]
);
// auth.css is hardcoded in template

$data_objects['user']['unloggedid'] = $unloggedid;

// Рендеринг шаблона
$final_html = get_template("auth.twig", $data_objects);
