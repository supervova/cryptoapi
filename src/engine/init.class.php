<?php

$pageths = explode('/', $_REQUEST['routestring']);

if (!empty($pageths[1])) {
    $pageths = $pageths[1];
} else {
    $pageths = 'home';
}

//var_dump($pageths);exit;
//var_dump();exit;
$data_objects['UserId'] = $user_id;
$data_objects['ExtraData'] = [
  'assets_prefix' => '/projects/cryptoapi.ai',
  'body_classes' => false,
  'domain' => 'cryptoapi.ai',
  'fonts_google' => ['Inter:wght@300;400;500'],
  'lang' => $lng_html,
  'powered_by' => '@qwertynetworks',
  'section' => "/" . $thispath[1],
  'user_id' => $user_id
];
