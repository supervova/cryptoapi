<?php

$pageths = explode('/', $_REQUEST['routestring']);

if (!empty($pageths[1])) {
    $pageths = $pageths[1];
} else {
    $pageths = 'home';
}

// Получение окружения приложения (development/production) из переменной окружения APP_ENV
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

//var_dump($pageths);exit;
//var_dump();exit;
$data_objects['UserId'] = $user_id;
$data_objects['ExtraData'] = [
  'title' => $blog_name ?? '',
  'desc' => $blog_description ?? '',
  'domain' => $host,
  'assets_prefix' => '/projects/cryptoapi.ai',
  'body_classes' =>  false,
  'lang' => $lng_html,
  'user_id' => $user_id,
  'user_name' => $username ?? '',
  'user_avatar' => $userdata['avatarbox'] ?? ''
];

// Получение и отображение шаблона
// $final_html = get_template("new-template.twig");
