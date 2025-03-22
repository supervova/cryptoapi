<?php

$meta_title = $blog_name;
$meta_description = $blog_description;
//include_once(ROOTDIR."projects/".$config['project_path']."/engine/payments_receiver.class.php");

$pageths = explode('/', $_REQUEST['routestring']);

if (!empty($pageths[1])) {
    $pageths = $pageths[1];
} else {
    $pageths = 'mainpage';
}

$data_objects['UserId'] = $user_id;

$data_objects['ExtraData'] = [
    'assets_prefix' => '/projects/cryptoapi.ai',
    'body_classes' => 'e-page is-home',
    'lang' => $lng_html,
    'fgi' => 68,
    'fonts_google' => ['Inter:wght@300;400;500'],
];

//var_dump($pageths);exit;
$final_html = get_template("index.twig");
